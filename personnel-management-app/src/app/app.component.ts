import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { NgxPersianModule } from 'ngx-persian';

import { SideNavComponent } from './side-nav/side-nav.component';
import { environment } from '../environments/environment';
import { routeNamePath } from './app.routes';
import { AuthInfo } from './models/authInfo.model';
import { UIService } from './shared/ui.service';
import { BaseComponent } from './shared/base.component';
import { InitInfoType } from './models/initInfoType.model';


@Component({
  selector: 'app-root',
  imports: [
    SideNavComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    NgxPersianModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent extends BaseComponent {

  version = environment.version;

  uiService = inject(UIService);

  authInfo = signal<AuthInfo| undefined>(undefined);
  initInfoTypes = signal<{id: number; title: string;}[]>(InitInfoType.getList());

  constructor() {

    super();

    // effect() only works in an injectable context like constructor(). It doesn't work in ngOnInit() for example
    effect(() => {
      const info = this.uiService.userInfoSignal();
      this.authInfo.set(info);
    });
  }

  signout() {
    const dialogRef = this.openDialog(
      'تایید',
      'آیا می خواهید از برنامه خارج شوید؟'
    );

    dialogRef.afterClosed().subscribe((result: 'yes' | 'no') => {
      if (result === 'yes') {
        const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        '/api/signout/',
        'POST',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          modalLoader.close();
        })
      )
      .subscribe({
        next: async (data: any) => {
          this.storageService.clearAuthInfo();

          this.uiService.UpdateUserInfo(undefined);

          this.router.navigate([routeNamePath.loginForm]);
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
      }
    });
  }

}
