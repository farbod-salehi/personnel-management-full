import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitInfoItemComponent } from './init-info-item.component';


describe('InitInfoItemComponent', () => {
  let component: InitInfoItemComponent;
  let fixture: ComponentFixture<InitInfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitInfoItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitInfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
