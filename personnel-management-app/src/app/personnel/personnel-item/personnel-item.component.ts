import {
  Component,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { NgModel } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { SharedModule } from '../../shared/shared.module';
import { BaseComponent } from '../../shared/base.component';
import { routeNamePath } from '../../app.routes';
import { InitInfoType } from '../../models/initInfoType.model';
import { filterInitInfoByTypePipe } from '../../shared/filter-initinfo-by-type.pipe';
import { Personnel } from '../../models/personnel.model';


@Component({
  selector: 'app-personnel-item',
  imports: [
    SharedModule,
    MatSelectModule,
    filterInitInfoByTypePipe,
    MatButtonToggleModule,
    MatDatepickerModule,
  ],
  templateUrl: './personnel-item.component.html',
  styleUrl: './personnel-item.component.css',
})
export class PersonnelItemComponent extends BaseComponent implements OnInit {
  @ViewChildren(NgModel) controls!: QueryList<NgModel>;
  route_NamePath = routeNamePath;
  initInfoTypesList = InitInfoType.getList();
  initInfoTypesItems = InitInfoType.Items;
  initInfoList: { id: string; title: string; type: number }[] = [];
  title: string = '';
  selectedTypeId: string = '';


  modalLoader: any = null;
  loadingCount = signal(0);
  route = inject(ActivatedRoute);

  id: string | undefined | null = undefined;

  model: Personnel = {
    firstName: '',
    codeMeli: '',
    lastName: '',
    shomarePersonneli: '',
    eblaghDakheliAsliId: null,
    sayerSematha: '',
    vahedKhedmat: '',
    isSetad: 'true',
    isMale: 'true',
    madrakTahsiliId: null,
    reshteTahsiliId: null,
    noeEstekhdamId: null,
    postId: null,
    reshteShoghliId: null,
    mojtameGhazaiyId: null,
    shahrMahalKhedmatId: null,
    tarikhAghazKhedmat: '',
    noeMahalKhedmat: '1',
  };

  ngOnInit(): void {
    this.getInitData();
    this.route.paramMap.subscribe((info) => {
      this.id = info.get('id');
      if (this.id) {
        this.getItem(this.id);
      }
    });
  }

  getInitData() {
    if (this.loadingCount() === 0) {
      this.modalLoader = this.openModalLoader();
    }
    this.loadingCount.set(this.loadingCount() + 1);

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
          this.loadingCount.set(this.loadingCount() - 1);
          if (this.loadingCount() === 0) {
            this.modalLoader?.close();
          }
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

  getItem(id: string) {
    if (this.loadingCount() === 0) {
      this.modalLoader = this.openModalLoader();
    }
    this.loadingCount.set(this.loadingCount() + 1);

    /*this.loadingCount.set(this.loadingCount() - 1);
    if (this.loadingCount() === 0) {
      this.modalLoader?.close();
    }*/
  }

  compareFn (a: string | null, b: string | null) : boolean {
    console.log(a,b);
     return a === null && b === null ? true : a === b;
  }

  onSave() {

    this.markAllControlsTouched(this.controls.toArray());
    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if (isFormValid) {

      const parameters = {
        codeMeli: this.model.codeMeli,
        eblaghDakheliAsliId: this.model.eblaghDakheliAsliId,//.length == 0 ? null : this.model.eblaghDakheliAsliId,
        firstName: this.model.firstName,
        lastName: this.model.lastName,
        isMale: this.model.isMale === "true",
        isSetad: this.model.isSetad === "true",
        madrakTahsiliId: this.model.madrakTahsiliId,
        shahrMahalKhedmatId: this.model.shahrMahalKhedmatId,
        mojtameGhazaiyId: this.model.mojtameGhazaiyId,
        noeEstekhdamId: this.model.noeEstekhdamId,
        postId: this.model.postId,
        reshteShoghliId: this.model.reshteTahsiliId,
        reshteTahsiliId: this.model.reshteTahsiliId,
        sayerSematha: this.model.sayerSematha,
        shomarePersonneli: this.model.shomarePersonneli,
        tarikhAghazKhedmat: this.model.tarikhAghazKhedmat,
        vahedKhedmat: this.model.vahedKhedmat,
        noeMahalKhedmat: this.model.noeMahalKhedmat,
      }

      if (this.id) {
        this.update(parameters);
      } else {
        this.add(parameters);
      }
    }
  }

    add(parameters: any) {
      console.log(parameters);
      this.isLoading.set(true);

      this.httpService
        .request(
          '/api/personnel/add',
          'POST',
          parameters,
          this.storageService.getAuthInfo()?.token
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
          finalize(() => {
            this.isLoading.set(false);
          })
        )
        .subscribe({
          next: async (data: any) => {
            this.openSnackBar('اطلاعات با موفقیت ثبت شد.', 'متوجه شدم');

            this.router.navigate([routeNamePath.personnelListForm]);
          },
          error: (errorObj: any) => {
            this.handleError(errorObj);
          },
        });
    }

    update(parameters: any) {

      this.isLoading.set(true);

      this.httpService
        .request(
          `/api/personnel/${this.id}/update`,
          'PATCH',
          parameters,
          this.storageService.getAuthInfo()?.token
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
          finalize(() => {
            this.isLoading.set(false);
          })
        )
        .subscribe({
          next: async (data: any) => {
            this.openSnackBar('اطلاعات با موفقیت بروز شد.', 'متوجه شدم');

            this.router.navigate([
              routeNamePath.personnelListForm,
              this.selectedTypeId,
            ]);
          },
          error: (errorObj: any) => {
            this.handleError(errorObj);
          },
        });
    }
}
