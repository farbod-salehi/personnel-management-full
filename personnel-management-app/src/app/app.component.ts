import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

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
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent extends BaseComponent implements OnInit {

  version = environment.version;

  uiService = inject(UIService);

  authInfo = signal<AuthInfo| undefined>(undefined);
  initInfoTypes = signal<{id: number; title: string;}[]>(InitInfoType.getList());

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
     }
  }
}
