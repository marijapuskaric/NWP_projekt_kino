import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjectionModalComponent } from './add-projection-modal.component';

describe('AddProjectionModalComponent', () => {
  let component: AddProjectionModalComponent;
  let fixture: ComponentFixture<AddProjectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddProjectionModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddProjectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
