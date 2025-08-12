import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseComponent } from '../../shared/base.component';
import { SharedModule } from '../../shared/shared.module';


@Component({
  selector: 'app-init-info-item',
  imports: [
    SharedModule
  ],
  templateUrl: './init-info-item.component.html',
  styleUrl: './init-info-item.component.css'
})
export class InitInfoItemComponent extends BaseComponent implements OnInit {

  private route = inject(ActivatedRoute);

  initInfoType?: number;
  initInfoTypeName? : string;

  title = "";
  active = true;

  ngOnInit(): void {
    //Angular automatically unsubscribes from ActivatedRoute observables like params, queryParams, and data when the component is destroyed
    this.route.params.subscribe(params => {
      this.initInfoType = params['type'];
    });
  }

}
