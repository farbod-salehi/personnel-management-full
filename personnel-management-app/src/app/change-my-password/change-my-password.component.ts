import {
  Component,
  DestroyRef,
  model,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BaseComponent } from '../shared/base.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-change-my-password',
  imports: [SharedModule],
  templateUrl: './change-my-password.component.html',
  styleUrl: './change-my-password.component.css',
})
export class ChangeMyPasswordComponent extends BaseComponent {
  @ViewChildren(NgModel) controls!: QueryList<NgModel>;

  currentPassword = model<string>('');
  newPassword = model<string>('');
  confirmNewPassword = model<string>('');

  onSave() {
    this.markAllControlsTouched(this.controls.toArray());

    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if (isFormValid) {
      const parameters = {
        newPassword: this.newPassword(),
        confirmPassword: this.confirmNewPassword(),
        currentPassword: this.currentPassword(),
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
            this.newPassword.set('');
            this.currentPassword.set('');
            this.confirmNewPassword.set('');
          },
          error: (errorObj: any) => {
            this.handleError(errorObj);
          },
        });
    }
  }
}
