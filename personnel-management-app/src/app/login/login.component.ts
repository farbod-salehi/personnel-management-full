import { Component, signal } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-login',
  imports: [
    SharedModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = "";
  password = "";

  isLoading = signal(false);

  onLogin() {
    this.isLoading.set(true);
  }
}
