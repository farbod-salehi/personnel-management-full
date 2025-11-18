import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { NgxPersianModule } from 'ngx-persian';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-grid-pager',
  imports: [
    MatIconModule,
    NgxPersianModule,
    MatButtonModule
  ],
  templateUrl: './grid-pager.component.html',
  styleUrl: './grid-pager.component.css'
})
export class GridPagerComponent {
  pagesCount = input.required<number>();
  pageNumber = input.required<number>();
  changePage = output<number>();


  prevButtonClick() {
    this.changePage.emit(this.pageNumber() -1);
  }

  nextButtonClick() {
    this.changePage.emit(this.pageNumber() + 1);
  }
}
