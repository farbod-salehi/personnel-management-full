import { Component, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';
import { InitInfoType } from '../../models/initInfoType.model';
import { NgModel } from '@angular/forms';


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
    this.markAllControlsTouched(this.controls.toArray());
    const isFormValid = this.areAllControlsValid(this.controls.toArray());

    if(isFormValid) {

    }
  }

}
