import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { SideNavComponent } from './side-nav/side-nav.component';
import { environment } from '../environments/environment';
import { LocalStorageService } from './shared/local-sorage.service';
import { routeNamePath } from './app.routes';
import { AuthInfo } from './models/authInfo.model';
import { UIService } from './shared/ui.service';

@Component({
  selector: 'app-root',
  imports: [
    SideNavComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

  version = environment.version;

  destroyRef = inject(DestroyRef);
  storageService = inject(LocalStorageService);
  router = inject(Router);
  uiService = inject(UIService);

  authInfo = signal<AuthInfo| undefined>(undefined);

  constructor() {

    // effect() only works in an injectable context like constructor(). It doesn't work in ngOnInit() for example
    effect(() => {
      const info = this.uiService.userInfoSignal();
      if (info) {
        this.authInfo.set(info);
      }
    });
  }


  ngOnInit(): void {

    this.authInfo.set(this.storageService.getAuthInfo() ?? undefined);

     if(!this.authInfo()) {
      this.router.navigate([routeNamePath.loginForm]);
     }
  }
}
