import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { PersonnelListComponent } from './personnel/personnel-list/personnel-list.component';
import { InitInfoItemComponent } from './init-info/init-info-item/init-info-item.component';

export const routeNamePath = {
  personnelListForm: 'personnels',
  initInfoItemForm: 'initinfo/:type',
  loginForm: 'login',
};

export const routes: Routes = [
  { path: '', redirectTo: routeNamePath.personnelListForm, pathMatch: 'full'},
  { path: routeNamePath.loginForm, component: LoginComponent },
  { path: routeNamePath.personnelListForm, component: PersonnelListComponent },
  { path: routeNamePath.initInfoItemForm, component: InitInfoItemComponent }
];
