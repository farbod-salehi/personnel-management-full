import {
  Component,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NgxPersianModule } from 'ngx-persian';

import { BaseComponent } from '../shared/base.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-change-my-password',
  imports: [
    SharedModule,
    NgxPersianModule
  ],
  templateUrl: './change-my-password.component.html',
  styleUrl: './change-my-password.component.css',
})
export class ChangeMyPasswordComponent extends BaseComponent {
  @ViewChildren(NgModel) controls!: QueryList<NgModel>;

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  onSave() {

    this.errorMessage.set('');

    this.markAllControlsTouched(this.controls.toArray());

    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if (isFormValid) {

      if (this.confirmNewPassword !== this.newPassword) {
        this.errorMessage.set('کلمه عبور جدید و تکرار آن باید یکسان باشند.');
        return;
      }

      const parameters = {
        newPassword: this.newPassword,
        confirmPassword: this.confirmNewPassword,
        currentPassword: this.currentPassword,
      };

      this.isLoading.set(true);

      this.httpService
        .request(
          '/api/changepassword',
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
            this.openSnackBar(
              'تغییر کلمه عبور با موفقیت انجام شد.',
              'متوجه شدم'
            );

            this.router.navigate(['/']);

          },
          error: (errorObj: any) => {
            this.handleError(errorObj);
          },
        });
    }
  }
}
