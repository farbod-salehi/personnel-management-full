import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-button-loader',
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './button-loader.component.html',
  styleUrl: './button-loader.component.css',
})
export class ButtonLoaderComponent {
  blClick = output<void>();

  text = input.required<string>();
  iconName = input<string | undefined>(undefined);
  color = input<'blue' | 'yellow' | 'red'>('blue');
  displayLoading = input<boolean>(false);

  onClick() {
    this.blClick.emit();
  }
}
