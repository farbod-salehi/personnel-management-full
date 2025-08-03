import { DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { NgModel } from "@angular/forms";

import { HttpService } from "./http.service";

export abstract class BaseComponent {


  protected destroyRef = inject(DestroyRef);
  protected httpService = inject(HttpService);
  protected isLoading = signal(false);
  protected errorMessage = signal('');

  protected resData: any = null;

  protected sendRequest(url: string, method: 'GET' | 'PATCH' | 'DELETE' | 'POST', parameters: any | null = null, token: string | null = null) {

    this.errorMessage.set('');
    this.resData = null;
    this.isLoading.set(true);

    this.httpService.request(url, method, parameters, token).pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          this.isLoading.set(false);
        })
        ).subscribe({
            next: async (data: any) => {
              this.resData = data;
            },
            error: (errorObj: any) => {
              if (errorObj.status === 401 && errorObj.error.act === 'login') {
                alert('redirect');
              } if (errorObj.status === 403 && errorObj.error.act === 'message') {
                alert('alert');
              } else {
                this.errorMessage.set(errorObj.error.error);
              }

            }
          });
  }

  markAllControlsTouched(controls: NgModel[]) {
    controls.forEach(c => c.control?.markAsTouched());
  }

  isAllControlsValid(controls: NgModel[]) {
    return controls.every(control => control.valid);
  }
}
