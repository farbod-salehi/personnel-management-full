import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { ButtonLoaderComponent } from './button-loader/button-loader.component';
import { ErrorMessageBoxComponent } from './error-message-box/error-message-box.component';
import { ModalLoadingComponent } from './modal-loading/modal-loading.component';

@NgModule({
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ButtonLoaderComponent,
    ErrorMessageBoxComponent,
    RouterModule,
    MatDialogModule,
    ModalLoadingComponent,
  ],
  exports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ButtonLoaderComponent,
    ErrorMessageBoxComponent,
    RouterModule,
    MatDialogModule,
    ModalLoadingComponent,
  ],
})
export class SharedModule {}
