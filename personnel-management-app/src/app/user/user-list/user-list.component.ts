import { Component, HostListener, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { NgxPersianModule } from 'ngx-persian';

import { SharedModule } from '../../shared/shared.module';
import { BaseComponent } from '../../shared/base.component';
import { routeNamePath } from '../../app.routes';
import { GridPagerComponent } from '../../shared/grid-pager/grid-pager.component';

@Component({
  selector: 'app-user-list',
  imports: [
    SharedModule,
    MatTableModule,
    MatGridListModule,
    NgxPersianModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    GridPagerComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent extends BaseComponent {

  displayedColumns = ['No', 'title', 'username', 'role', 'actions'];
  route_NamePath = routeNamePath;

  route = inject(ActivatedRoute);

  searchQuery = signal<string>('');
  pageLength = signal<number>(20);
  pageNumber = signal<number>(1);
  pagesCount = signal<number>(1);

  list = signal<
    {
      rowNumber: number;
      id: string;
      title: string;
      username: string;
      role: string;
    }[]
  >([]);

  ngOnInit(): void {
    this.getList();
  }

  getList() {
    const modalLoader = this.openModalLoader();

    this.httpService
      .request(
        `/api/users?searchQuery=${this.searchQuery()}&page=${this.pageNumber()}&count=${this.pageLength()}`,
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
                  title: string;
                  role: string;
                  id: string;
                  userName: string;
                },
                index: number
              ) => {
                this.list().push({
                  rowNumber: ++index,
                  title: element.title,
                  id: element.id,
                  username: element.userName,
                  role: element.role
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
        `/api/users/${id}/delete`,
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
