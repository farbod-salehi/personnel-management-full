import { Component, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { filterInitInfoByTypePipe } from '../../shared/filter-initinfo-by-type.pipe';
import { InitInfoType } from '../../models/initInfoType.model';

@Component({
  selector: 'app-personnel-report',
  imports: [
    SharedModule,
    MatSelectModule,
    filterInitInfoByTypePipe,
    MatButtonToggleModule
  ],
  templateUrl: './personnel-report.component.html',
  styleUrl: './personnel-report.component.css'
})
export class PersonnelReportComponent extends BaseComponent implements OnInit  {

  selectedGender: "all" | "man" | "woman" = "all";
  selectedWorkplaceType: "all" | "saf" | "setad" = "all";
  selelectedWorkplace: "all" | "1" | "2" | "0" = "all";
  initInfoList: { id: string; title: string; type: number }[] = [];
  initInfoTypesList = InitInfoType.getList();
  initInfoTypesItems = InitInfoType.Items;

  selectedCityId = "" ;
  selectedMogtameGhazaiyId = "";

  isInitLoading = signal(true);

  ngOnInit(): void {
    this.getInitData();
  }

   getInitData() {

    const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        '/api/initinfo',
        'GET',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
         modalLoader?.close();
         this.isInitLoading.set(false);
        })
      )
      .subscribe({
        next: async (data: any) => {
          if (data?.list) {
            data.list.forEach(
              (element: { id: string; title: string; type: number }) => {
                this.initInfoList.push({
                  id: element.id,
                  title: element.title,
                  type: element.type,
                });
              }
            );
          }
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }

  onGetReport() {

    this.isLoading.set(true);

    let query = this.generateQuery();

    this.httpService
      .request(
        `/api/report/personnel${query}`,
        'GET',
        null,
        this.storageService.getAuthInfo()?.token,
        true
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
         this.isLoading.set(false);
        })
      )
      .subscribe({
        next: async (data: any) => {
          this.downLoadByteArrayAsFile(data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        },
        error: (errorObj: any) => {
          console.log(errorObj);
          this.handleError(errorObj);
        },
      });
  }

  downLoadByteArrayAsFile(data: any, type: string) {
      var blob = new Blob([data], { type: type });
      var url = window.URL.createObjectURL(blob);
      var pwa = window.open(url);
      if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        const message = `لطفااز تنظیمات مرورگر، بخش
        pop-up block
        را غیرفعال نمایید.`
          this.openSnackBar(message, 'متوجه شدم');
      }
  }

  generateQuery() {

    let query = '';

     if(this.selectedGender !== 'all') {
      query += 'isMale=' + (this.selectedGender === 'man' ? true : false);
    }

    if(this.selectedWorkplaceType !== 'all') {
      query += '&isSetad=' + this.selectedWorkplaceType === 'saf' ? 'false' : 'true';
    }

    if(this.selelectedWorkplace !== 'all') {
      query += '&noeMahalKhedmat=' + this.selelectedWorkplace;
    }

    if(this.selectedCityId.length > 0) {
      query += '&cityId=' + this.selectedCityId;
    }

    if(this.selectedMogtameGhazaiyId.length > 0) {
      query += '&mojtameId=' + this.selectedMogtameGhazaiyId;
    }

    if(query.length > 0) {
      query = '?' + query;
    }

    return query;
  }
}
