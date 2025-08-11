import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { ButtonLoaderComponent } from "./button-loader/button-loader.component";
import { ErrorMessageBoxComponent } from "./error-message-box/error-message-box.component";

@NgModule({
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ButtonLoaderComponent,
    ErrorMessageBoxComponent,
  ],
  exports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ButtonLoaderComponent,
    ErrorMessageBoxComponent
  ]
})
export class SharedModule {}
