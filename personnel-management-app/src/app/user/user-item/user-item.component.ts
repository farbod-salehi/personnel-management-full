import { Component, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { NgxPersianModule } from 'ngx-persian';

import { routeNamePath } from '../../app.routes';
import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-item',
  imports: [
    SharedModule,
    MatSelect,
    MatOption,
    NgxPersianModule
  ],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.css'
})
export class UserItemComponent extends BaseComponent{

  @ViewChildren(NgModel) controls!: QueryList<NgModel>;
  route = inject(ActivatedRoute);

  model = {
    title: '',
    username: '',
    password: '',
    roleId: 3,
    roles: [
      {title: 'مدیر', id:2},
      {title: 'کاربر', id:3}
    ]
  };

  route_NamePath = routeNamePath;

  onSave() {
    this.errorMessage.set('');

    this.markAllControlsTouched(this.controls.toArray());

    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if(isFormValid) {
       const parameters = {
        username: this.model.username,
        password: this.model.password,
        title: this.model.title,
        role: this.model.roleId,
      };

    this.isLoading.set(true);

    this.httpService
      .request(
        '/api/users/add',
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
            routeNamePath.usersListForm
          ]);
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
    }
  }
}
