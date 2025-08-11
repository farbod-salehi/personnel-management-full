import { Component, inject, QueryList, ViewChildren } from '@angular/core';
import { NgModel } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { SharedModule } from '../shared/shared.module';
import { BaseComponent } from '../shared/base.component';
import { routeNamePath } from '../app.routes';
import { AuthInfo } from '../models/authInfo.model';
import { UIService } from '../shared/ui.service';

@Component({
  selector: 'app-login',
  imports: [
    SharedModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent extends BaseComponent {

  @ViewChildren(NgModel) controls!: QueryList<NgModel>;

  uiService = inject(UIService);
  authInfo?: AuthInfo;

  username = "";
  password = "";


  onLogin() {

    this.markAllControlsTouched(this.controls.toArray());

    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if (isFormValid) {

      const parameters = {
        username: this.username,
        password: this.password
      };

      this.isLoading.set(true);

      this.httpService.request('/api/login','POST',parameters).pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          this.isLoading.set(false);
        })
        ).subscribe({
            next: async (data: any) => {
              if (data) {

                this.authInfo = new AuthInfo(String(data.userTitle),String(data.userToken), Number(data.userRole));

                this.storageService.setAuthInfo(this.authInfo);

                this.uiService.UpdateUserInfo(this.authInfo);

                this.router.navigate([routeNamePath.personnelListForm]);
              }
            },
            error: (errorObj: any) => {
              this.handleError(errorObj);
            }
          });

    }

  }
}
