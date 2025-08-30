import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-modal-confirm',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.css',
})
export class ModalConfirmComponent {
  title = 'تایید';
  message = 'آیا اطمینان دارید؟';

  constructor(private dialogRef: MatDialogRef<ModalConfirmComponent>) {
    const data = inject(MAT_DIALOG_DATA);
    this.message = data.message;
    this.title = data.title;
  }

  sendResult(result: 'yes' | 'no') {
    this.dialogRef.close(result);
  }
}
