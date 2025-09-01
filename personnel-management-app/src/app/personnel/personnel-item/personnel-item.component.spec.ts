import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelItemComponent } from './personnel-item.component';

describe('PersonnelItemComponent', () => {
  let component: PersonnelItemComponent;
  let fixture: ComponentFixture<PersonnelItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonnelItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonnelItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
