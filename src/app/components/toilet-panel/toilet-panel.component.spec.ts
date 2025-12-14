import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToiletPanelComponent } from './toilet-panel.component';

describe('ToiletPanelComponent', () => {
  let component: ToiletPanelComponent;
  let fixture: ComponentFixture<ToiletPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToiletPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToiletPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
