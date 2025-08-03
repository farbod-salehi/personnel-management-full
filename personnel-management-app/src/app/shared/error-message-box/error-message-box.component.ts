import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message-box',
  imports: [],
  templateUrl: './error-message-box.component.html',
  styleUrl: './error-message-box.component.css'
})
export class ErrorMessageBoxComponent {
  text = input('');
}
