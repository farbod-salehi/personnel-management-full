import { DestroyRef, inject, signal } from "@angular/core";
import { NgModel } from "@angular/forms";
import { Router } from "@angular/router";
import {MatSnackBar} from '@angular/material/snack-bar';

import { HttpService } from "./http.service";
import { LocalStorageService } from "./local-sorage.service";
import { routeNamePath } from "../app.routes";

export abstract class BaseComponent {

  protected _snackBar = inject(MatSnackBar);

  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected destroyRef = inject(DestroyRef);
  protected httpService = inject(HttpService);
  protected router = inject(Router);
  protected storageService = inject(LocalStorageService);

  handleError(errorObj: any) {
    console.log(errorObj.status);
    if (errorObj.status === 401 && errorObj.error.act === 'login') {
      this.storageService.clearAuthInfo();
      this.router.navigate([routeNamePath.loginForm]);
    } if (errorObj.status === 403 && errorObj.error.act === 'message') {
      this._snackBar.open('شما مجوز دسترسی به این بخش را ندارید', 'متوجه شدم', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } else if (errorObj.status === 0){
      this.errorMessage.set('خطای نامشخصی اتفاق افتاده است. ارتباط شبکه را بررسی نمایید.');
    } else {
      this.errorMessage.set(errorObj.error.error);
    }
  }

  markAllControlsTouched(controls: NgModel[]) {
    controls.forEach(c => c.control?.markAsTouched());
  }

  areAllControlsValid(controls: NgModel[]) {
    return controls.every(control => control.valid);
  }
}
