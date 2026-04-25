import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToiletFilterComponent } from './toilet-filter.component';

describe('ToiletFilterComponent', () => {
  let component: ToiletFilterComponent;
  let fixture: ComponentFixture<ToiletFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToiletFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToiletFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
