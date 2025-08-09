import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  providers: [
    LocalStorageService
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

  authInfo: AuthInfo | null = null;

  ngOnInit(): void {

    this.uiService.userInfo$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(info => {
      this.authInfo = info;
    });

    this.authInfo = this.storageService.getAuthInfo();

     if(!this.authInfo) {
      this.router.navigate([routeNamePath.loginForm]);
     }
  }
}
