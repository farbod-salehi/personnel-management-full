import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-button-loader',
  imports: [MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './button-loader.component.html',
  styleUrl: './button-loader.component.css'
})
export class ButtonLoaderComponent {

  blClick = output<void>();

  text = input.required<string>();
  displayLoading = input<boolean>(false);

  onClick() {
    this.blClick.emit();
  }
}
