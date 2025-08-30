import {
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { NgModel } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { InitInfoType } from '../../models/initInfoType.model';
import { routeNamePath } from '../../app.routes';

@Component({
  selector: 'app-init-info-item',
  imports: [SharedModule, MatSelect, MatOption],
  templateUrl: './init-info-item.component.html',
  styleUrl: './init-info-item.component.css',
})
export class InitInfoItemComponent extends BaseComponent implements OnInit {
  @ViewChildren(NgModel) controls!: QueryList<NgModel>;
  route = inject(ActivatedRoute);

  title = '';
  id: string | undefined | null = undefined;
  typesList = InitInfoType.getList();
  selectedTypeId = this.typesList[0].id;
  route_NamePath = routeNamePath;

  ngOnInit(): void {
    this.route.paramMap.subscribe((info) => {
      this.selectedTypeId = Number(info.get('type'));
      this.id = info.get('id');

      if (this.id) {
        this.getItem();
      }
    });
  }

  onSave() {
    this.markAllControlsTouched(this.controls.toArray());
    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if (isFormValid) {
      if (this.id) {
        this.update();
      } else {
        this.add();
      }
    }
  }

  add() {
    const parameters = {
      title: this.title,
      type: this.selectedTypeId,
      parentId: null,
      active: true,
    };

    this.isLoading.set(true);

    this.httpService
      .request(
        '/api/initinfo/add',
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

          this.router.navigate([
            routeNamePath.initInfoListForm,
            this.selectedTypeId,
          ]);
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }

  update() {
    const parameters = {
      title: this.title,
      parentId: null,
      active: true,
    };

    this.isLoading.set(true);

    this.httpService
      .request(
        `/api/initinfo/${this.selectedTypeId}/${this.id}/update`,
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
            routeNamePath.initInfoListForm,
            this.selectedTypeId,
          ]);
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }

  getItem() {
    const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        `/api/initinfo/${this.selectedTypeId}/${this.id}`,
        'GET',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          modalLoader.close();
        })
      )
      .subscribe({
        next: async (data: any) => {
          if (data) {
            this.title = data.title;
          }
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }
}
