import { Component, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { InitInfoType } from '../../models/initInfoType.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-init-info-list',
  imports: [SharedModule, MatSelectModule, MatProgressSpinner],
  templateUrl: './init-info-list.component.html',
  styleUrl: './init-info-list.component.css'
})
export class InitInfoListComponent extends BaseComponent implements OnInit {
  typesList = InitInfoType.getList();
  selectedTypeId = this.typesList[0].id;
  currentPage = signal(1);
  pagesLength = signal(15);

  list = signal<{rowNumber: number; id:string; title: string;}[]>([]);

  ngOnInit(): void {

    this.getList();

  }

  onTypeChange() {
    this.getList();
  }

  getList() {

    this.isLoading.set(true);

    this.httpService.request(`/api/initinfo/${this.selectedTypeId}?count=${this.pagesLength()}&page=${this.currentPage()}`,'GET', null, this.storageService.getAuthInfo()?.token).pipe(
      takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
      finalize(() => {
        this.isLoading.set(false);
      })
      ).subscribe({
          next: async (data: any) => {
            if (data) {

              console.log(data);
            }
          },
          error: (errorObj: any) => {
            this.handleError(errorObj);
          }
        });
  }
}
