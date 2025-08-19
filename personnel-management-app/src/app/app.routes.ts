import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { PersonnelListComponent } from './personnel/personnel-list/personnel-list.component';
import { InitInfoItemComponent } from './init-info/init-info-item/init-info-item.component';
import { InitInfoListComponent } from './init-info/init-info-list/init-info-list.component';
import { AuthGuard } from './shared/auth.guard';

export const routeNamePath = {
  personnelListForm: 'personnels',
  initInfoItemForm: 'initinfo',
  initInfoListForm: 'initinfo/list',
  loginForm: 'login',
};

export const routes: Routes = [
  { path: '', redirectTo: routeNamePath.personnelListForm, pathMatch: 'full'},
  { path: routeNamePath.loginForm, component: LoginComponent },
  { path: routeNamePath.personnelListForm, component: PersonnelListComponent , canActivate : [AuthGuard]},
  { path: routeNamePath.initInfoListForm, component: InitInfoListComponent , canActivate : [AuthGuard]},
  { path: `${routeNamePath.initInfoItemForm}/:type`, component: InitInfoItemComponent , canActivate : [AuthGuard]}
];
