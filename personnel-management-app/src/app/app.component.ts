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
import { BaseComponent } from './shared/base.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';


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
export class AppComponent extends BaseComponent implements OnInit {

  version = environment.version;

  uiService = inject(UIService);

  authInfo = signal<AuthInfo| undefined>(undefined);
  initInfoTypes = signal<{id: number; title: string;}[]>([]);

  constructor() {

    super();

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
     } else {

        this.isLoading.set(true);

        this.httpService.request('/api/initinfo/types','GET', null, this.authInfo()?.token).pipe(
          takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
          finalize(() => {
            this.isLoading.set(false);
          })
          ).subscribe({
              next: async (data: any) => {
                if (data) {
                  data.list.forEach((type: { id: number; title: string; }) => {
                        this.initInfoTypes().push({id:type.id, title: type.title});
                  });
                }
              },
              error: (errorObj: any) => {
                this.handleError(errorObj);
              }
          });
     }
  }
}
