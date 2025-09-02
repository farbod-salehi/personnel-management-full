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
    eblaghDakheliAsliId: undefined,
    sayerSematha: '',
    vahedKhedmat: '',
    isSetad: 'true',
    isMale: 'true',
    madrakTahsiliId: undefined,
    reshteTahsiliId: undefined,
    noeEstekhdamId: undefined,
    postId: undefined,
    reshteShoghliId: undefined,
    mojtameGhazaiyId: undefined,
    shahrMahalKhedmatId: undefined,
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

  onSave() {}
}
