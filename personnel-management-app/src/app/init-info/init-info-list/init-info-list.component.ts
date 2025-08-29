import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivatedRoute } from '@angular/router';

import { NgxPersianModule } from 'ngx-persian';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { InitInfoType } from '../../models/initInfoType.model';
import { routeNamePath } from '../../app.routes';

@Component({
  selector: 'app-init-info-list',
  imports: [
    SharedModule,
    MatSelectModule,
    MatProgressSpinner,
    MatTableModule,
    MatGridListModule,
    NgxPersianModule,
  ],
  templateUrl: './init-info-list.component.html',
  styleUrl: './init-info-list.component.css',
})
export class InitInfoListComponent extends BaseComponent implements OnInit {
  typesList = InitInfoType.getList();
  selectedTypeId = this.typesList[0].id;
  displayedColumns = ['No', 'title', 'actions'];
  route_NamePath = routeNamePath;

  route = inject(ActivatedRoute);

  currentPage = signal(1);
  pagesLength = signal(15);
  list = signal<{ rowNumber: number; id: string; title: string }[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe((info) => {
      this.selectedTypeId = Number(info.get('type'));
      this.getList();
    });
  }

  onTypeChange() {
    // navigates to the same parent route but with a new param
    // "relativeTo: this.route" : ensures the navigation is relative to the current route.
    this.router.navigate(['../', this.selectedTypeId], {
      relativeTo: this.route,
    });
  }

  getList() {
    this.isLoading.set(true);

    this.httpService
      .request(
        `/api/initinfo/${
          this.selectedTypeId
        }?count=${this.pagesLength()}&page=${this.currentPage()}`,
        'GET',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: async (data: any) => {
          if (data) {
            let rowNumber = (this.currentPage() - 1) * this.pagesLength() + 1;

            this.list.set([]);

            data.list.forEach((element: { title: string; id: string }) => {
              this.list().push({
                rowNumber: rowNumber++,
                title: element.title,
                id: element.id,
              });
            });
          }
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }
}
