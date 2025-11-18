import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridPagerComponent } from './grid-pager.component';

describe('GridPagerComponent', () => {
  let component: GridPagerComponent;
  let fixture: ComponentFixture<GridPagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridPagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridPagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
