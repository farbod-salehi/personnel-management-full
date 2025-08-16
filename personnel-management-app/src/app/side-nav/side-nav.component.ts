import { Component, inject, input } from '@angular/core';
import {  RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { AuthInfo } from '../models/authInfo.model';
import { routeNamePath } from '../app.routes';

@Component({
  selector: 'app-side-nav',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})
export class SideNavComponent {
  authInfo = input.required<AuthInfo | undefined>();
  defaultInitInfoTypeId = input.required<number>();
  route_NamePath = routeNamePath;
}
