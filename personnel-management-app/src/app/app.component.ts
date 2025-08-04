import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { SideNavComponent } from './side-nav/side-nav.component';
import { environment } from '../environments/environment';
import { LocalStorageService } from './shared/local-sorage.service';
import { routeNamePath } from './app.routes';

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
  storageService = inject(LocalStorageService);
  router = inject(Router);

  ngOnInit(): void {
     const authInfo = this.storageService.getAuthInfo();

     if(!authInfo) {
      this.router.navigate([routeNamePath.lognForm]);
     }
  }
}
