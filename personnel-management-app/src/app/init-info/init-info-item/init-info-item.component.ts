import { Component, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { InitInfoType } from '../../models/initInfoType.model';
import { NgModel } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { routeNamePath } from '../../app.routes';


@Component({
  selector: 'app-init-info-item',
  imports: [
    SharedModule,
    MatSelect,
    MatOption,
  ],
  templateUrl: './init-info-item.component.html',
  styleUrl: './init-info-item.component.css'
})
export class InitInfoItemComponent extends BaseComponent implements OnInit {

  @ViewChildren(NgModel) controls!: QueryList<NgModel>;
  route = inject(ActivatedRoute);

  title = "";
  typesList = InitInfoType.getList();
  selectedTypeId = this.typesList[0].id;

  ngOnInit(): void {
    this.selectedTypeId = Number(this.route.snapshot.params["type"]);
  }

  onSave() {
    console.log(0);
    this.markAllControlsTouched(this.controls.toArray());
    const isFormValid = this.areAllControlsValid(this.controls.toArray());
    console.log(isFormValid);
    if(isFormValid) {
      const parameters = {
        title: this.title,
        type: this.selectedTypeId,
        parentId: null,
        active: true
      };

      this.isLoading.set(true);

      this.httpService.request('/api/initinfo/add','POST',parameters, this.storageService.getAuthInfo()?.token).pipe(
        takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on destroy
        finalize(() => {
          this.isLoading.set(false);
        })
        ).subscribe({
            next: async (data: any) => {
               this._snackBar.open('اطلاعات با موفقیت ثبت شد.', 'متوجه شدم', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration:4000
              });

              this.router.navigate([routeNamePath.initInfoListForm]);
            },
            error: (errorObj: any) => {
              this.handleError(errorObj);
            }
          });

    }
  }

}
