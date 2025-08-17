import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitInfoListComponent } from './init-info-list.component';

describe('InitInfoListComponent', () => {
  let component: InitInfoListComponent;
  let fixture: ComponentFixture<InitInfoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitInfoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitInfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
