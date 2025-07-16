import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css',
})
export class SideNavComponent {
  userIsAuthenticated = false;
}
