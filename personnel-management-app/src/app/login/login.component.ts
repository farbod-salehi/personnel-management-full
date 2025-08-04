import { Component, inject, QueryList, ViewChildren } from '@angular/core';
import { NgModel } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { BaseComponent } from '../shared/base.component';
import { LocalStorageService } from '../shared/local-sorage.service';

@Component({
  selector: 'app-login',
  imports: [
    SharedModule,
  ],
  providers:[
    LocalStorageService
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent extends BaseComponent {

  @ViewChildren(NgModel) controls!: QueryList<NgModel>;

  storageService = inject(LocalStorageService);

  username = "";
  password = "";

  async onLogin() {

    this.markAllControlsTouched(this.controls.toArray());

    const isFormValid = this.isAllControlsValid(this.controls.toArray());

    if (isFormValid) {

      const parameters = {
        username: this.username,
        password: this.password
      };

      this.sendRequest('/api/login', 'POST', parameters);

      if (this.resData) {
        const authInfo = {
          title: String(this.resData.userTitle),
          role: Number(this.resData.userRole),
          token: String(this.resData.userToken)
        };

        this.storageService.setAuthInfo(authInfo);
        // redirect
      }
    }

  }
}
