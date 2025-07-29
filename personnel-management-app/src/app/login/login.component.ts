import { Component, DestroyRef, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SharedModule } from '../shared/shared.module';
import { HttpService } from '../shared/http.service';
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

  username = "";
  password = "";

  async onLogin() {

    const parameters = {
      username: this.username,
      password: this.password
    };

    this.sendRequest('/api/login', 'POST', parameters);

  }
}
