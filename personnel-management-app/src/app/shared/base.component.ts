import { DestroyRef, inject, signal } from "@angular/core";
import { NgModel } from "@angular/forms";
import { Router } from "@angular/router";

import { HttpService } from "./http.service";
import { LocalStorageService } from "./local-sorage.service";

export abstract class BaseComponent {

  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected destroyRef = inject(DestroyRef);
  protected httpService = inject(HttpService);
  protected router = inject(Router);
  protected storageService = inject(LocalStorageService);

  handleError(errorObj: any) {
    if (errorObj.status === 401 && errorObj.error.act === 'login') {
      alert('redirect');
    } if (errorObj.status === 403 && errorObj.error.act === 'message') {
      alert('alert');
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
