import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeReservationModalComponent } from './make-reservation-modal.component';

describe('MakeReservationModalComponent', () => {
  let component: MakeReservationModalComponent;
  let fixture: ComponentFixture<MakeReservationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MakeReservationModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MakeReservationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
