import { DestroyRef, inject, signal } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { HttpService } from './http.service';
import { LocalStorageService } from './local-sorage.service';
import { routeNamePath } from '../app.routes';
import { ModalLoadingComponent } from './modal-loading/modal-loading.component';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';

export abstract class BaseComponent {
  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected destroyRef = inject(DestroyRef);
  protected httpService = inject(HttpService);
  protected router = inject(Router);
  protected storageService = inject(LocalStorageService);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  handleError(errorObj: any) {
    if (errorObj.status === 401 && errorObj.error.act === 'login') {
      this.storageService.clearAuthInfo();
      this.router.navigate([routeNamePath.loginForm]);
    }
    if (errorObj.status === 403 && errorObj.error.act === 'message') {
      this.openSnackBar('شما مجوز دسترسی به این بخش را ندارید', 'متوجه شدم');
    } else if (errorObj.status === 0) {
      this.errorMessage.set(
        'خطای نامشخصی اتفاق افتاده است. ارتباط شبکه را بررسی نمایید.'
      );
    } else {
      this.errorMessage.set(errorObj.error.error);
    }
  }

  markAllControlsTouched(controls: NgModel[]) {
    controls.forEach((c) => c.control?.markAsTouched());
  }

  areAllControlsValid(controls: NgModel[]) {
    return controls.every((control) => control.valid);
  }

  openModalLoader() {
    return this.dialog.open(ModalLoadingComponent, {
      panelClass: 'transparent',
      disableClose: true,
    });
  }

  openSnackBar(message: string, handler: string, duration = 4000) {
    this._snackBar.open(message, handler, {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: duration,
    });
  }

  openDialog(
    title: string,
    message: string
  ): MatDialogRef<ModalConfirmComponent, any> {
    return this.dialog.open(ModalConfirmComponent, {
      width: '250px',
      enterAnimationDuration: '400ms',
      exitAnimationDuration: '200ms',
      data: { title, message },
    });
  }

  convertEmptyStringToNull(input: string) : string | null {
    return input.trim().length === 0 ? null : input.trim();
  }

  convertNullToEmptyString(input: string | null) : string {
    return input ?? '';
  }
}
