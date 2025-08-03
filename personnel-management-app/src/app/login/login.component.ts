import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgModel } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-login',
  imports: [
    SharedModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent extends BaseComponent {

  @ViewChildren(NgModel) controls!: QueryList<NgModel>;

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
        // save to local storage
        // redirect
      }
    }

  }
}
