import { Component, HostListener, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { NgxPersianModule } from 'ngx-persian';

import { SharedModule } from '../../shared/shared.module';
import { BaseComponent } from '../../shared/base.component';
import { routeNamePath } from '../../app.routes';

@Component({
  selector: 'app-user-edit',
  imports: [
    SharedModule,
    MatSelect,
    MatOption,
    MatCheckboxModule,
    NgxPersianModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent extends BaseComponent implements OnInit {

  @ViewChildren(NgModel) controls!: QueryList<NgModel>;
  route = inject(ActivatedRoute);

  id: string | undefined | null = undefined;

  model = {
    title: '',
    username: '',
    passwordShouldChange: false,
    password: '',
    roleId: 3,
    roles: [
      {title: 'مدیر', id:2},
      {title: 'کاربر', id:3}
    ]
  };

  route_NamePath = routeNamePath;

  ngOnInit(): void {
     this.route.paramMap.subscribe((info) => {
      this.id = info.get('id');
      if (this.id) {
        this.getItem(this.id);
      }
    });
  }

  getItem(id: string) {

    let modalLoader = this.openModalLoader();


     this.httpService
      .request(
        `/api/users/${id}`,
        'GET',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          modalLoader?.close();
        })
      )
      .subscribe({
        next: async (data: any) => {
          if (data) {
            this.model.username = data.userName;
            this.model.title = data.title;
            this.model.roleId = data.role;
          }
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });


  }

  onSave() {

    this.errorMessage.set('');

    this.markAllControlsTouched(this.controls.toArray());
    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if (isFormValid) {

      if(this.model.passwordShouldChange && this.model.password.length < this.passwordsMinLength) {
        this.errorMessage.set('کلمه عبور را با طول مناسب وارد نمایید.');
        return;
      }

      const parameters = {
        title: this.model.title,
        password: this.model.passwordShouldChange ? this.model.password : null,
        role: this.model.roleId
      };

      this.update(parameters);

    }
  }

   update(parameters: any) {

    this.isLoading.set(true);

    this.httpService
      .request(
        `/api/users/${this.id}/update`,
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

          this.router.navigate([routeNamePath.usersListForm]);
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    this.onSave();
  }

}
