import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
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
    const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        `/api/initinfo/${this.selectedTypeId}`,
        'GET',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          modalLoader.close();
        })
      )
      .subscribe({
        next: async (data: any) => {
          if (data) {
            this.list.set([]);

            data.list.forEach(
              (element: { title: string; id: string }, index: number) => {
                this.list().push({
                  rowNumber: ++index,
                  title: element.title,
                  id: element.id,
                });
              }
            );
          }
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }

  confirmDelete(id: string) {
    const dialogRef = this.openDialog(
      'تایید',
      'آیا از حذف این داده اطمینان دارید؟'
    );

    dialogRef.afterClosed().subscribe((result: 'yes' | 'no') => {
      if (result === 'yes') {
        this.delete(id);
      }
    });
  }

  delete(id: string) {
    const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        `/api/initinfo/${id}/delete`,
        'DELETE',
        null,
        this.storageService.getAuthInfo()?.token
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          modalLoader.close();
        })
      )
      .subscribe({
        next: async (data: any) => {
          this.openSnackBar('حذف با موفقیت انجام شد.', 'متوجه شدم');

          // A signal property is immutable and changing it via splice() for example, won’t be detected by Angular
          // so we should use set() again or update() by new list, because signals rely on reference change detection
          this.list.update((items) => items.filter((item) => item.id !== id));
        },
        error: (errorObj: any) => {
          this.handleError(errorObj);
        },
      });
  }
}
