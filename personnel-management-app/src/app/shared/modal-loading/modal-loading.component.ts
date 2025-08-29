import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-modal-loading',
  imports: [MatProgressSpinnerModule],
  templateUrl: './modal-loading.component.html',
  styleUrl: './modal-loading.component.css',
})
export class ModalLoadingComponent {}
