import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { PersonnelListComponent } from './personnel/personnel-list/personnel-list.component';
import { InitInfoItemComponent } from './init-info/init-info-item/init-info-item.component';
import { InitInfoListComponent } from './init-info/init-info-list/init-info-list.component';
import { AuthGuard } from './shared/auth.guard';
import { PersonnelItemComponent } from './personnel/personnel-item/personnel-item.component';
import { ChangeMyPasswordComponent } from './change-my-password/change-my-password.component';

export const routeNamePath = {
  personnelListForm: 'personnels',
  personnelItemForm: 'personnel-item',
  initInfoItemForm: 'initinfo',
  initInfoListForm: 'initinfo-list',
  loginForm: 'login',
  changePasswordForm: 'changepassword',
};

export const routes: Routes = [
  { path: '', redirectTo: routeNamePath.personnelListForm, pathMatch: 'full' },
  { path: routeNamePath.loginForm, component: LoginComponent },
  {
    path: routeNamePath.personnelListForm,
    component: PersonnelListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${routeNamePath.personnelItemForm}/:id`,
    component: PersonnelItemComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routeNamePath.personnelItemForm,
    component: PersonnelItemComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${routeNamePath.initInfoListForm}/:type`,
    component: InitInfoListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${routeNamePath.initInfoItemForm}/:type/:id`,
    component: InitInfoItemComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${routeNamePath.initInfoItemForm}/:type`,
    component: InitInfoItemComponent,
    canActivate: [AuthGuard],
  },
  {
    path: `${routeNamePath.changePasswordForm}`,
    component: ChangeMyPasswordComponent,
    canActivate: [AuthGuard],
  },
];
