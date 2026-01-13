import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToiletComponent } from './add-toilet.component';

describe('AddToiletComponent', () => {
  let component: AddToiletComponent;
  let fixture: ComponentFixture<AddToiletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToiletComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddToiletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
