import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { NgxPersianModule } from 'ngx-persian';

import { SharedModule } from '../../shared/shared.module';
import { routeNamePath } from '../../app.routes';
import { BaseComponent } from '../../shared/base.component';
import { GridPagerComponent } from '../../shared/grid-pager/grid-pager.component';

@Component({
  selector: 'app-personnel-list',
  imports: [
    SharedModule,
    MatSelectModule,
    MatTableModule,
    MatGridListModule,
    NgxPersianModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    GridPagerComponent
  ],
  templateUrl: './personnel-list.component.html',
  styleUrl: './personnel-list.component.css',
})
export class PersonnelListComponent extends BaseComponent implements OnInit {
  displayedColumns = ['No', 'name', 'shomarePersonneli', 'codeMeli', 'actions'];
  route_NamePath = routeNamePath;

  route = inject(ActivatedRoute);
  authInfo = this.storageService.getAuthInfo();

  searchQuery = signal<string>('');
  pageLength = signal<number>(20);
  pageNumber = signal<number>(1);
  pagesCount = signal<number>(1);

  list = signal<
    {
      rowNumber: number;
      id: string;
      name: string;
      shomarePersonneli: string;
      codeMeli: string;
    }[]
  >([]);

  ngOnInit(): void {
    this.getList();
  }

  getList() {
    const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        `/api/personnel?searchQuery=${this.searchQuery()}&page=${this.pageNumber()}&count=${this.pageLength()}`,
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
            this.pagesCount.set(data.pagesCount);
            data.list.forEach(
              (
                element: {
                  firstName: string;
                  lastName: string;
                  id: string;
                  shomarePersonneli: string;
                  codeMeli: string;
                },
                index: number
              ) => {
                this.list().push({
                  rowNumber: ++index,
                  name: `${element.lastName}, ${element.firstName}`,
                  id: element.id,
                  shomarePersonneli: element.shomarePersonneli,
                  codeMeli: element.codeMeli ?? '---',
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

  search(page: number) {
    this.pageNumber.set(page);
    this.getList();
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
        `/api/personnel/${id}/delete`,
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

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: Event) {
    this.search(1);
  }
}
