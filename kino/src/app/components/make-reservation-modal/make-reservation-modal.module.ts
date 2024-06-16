import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MakeReservationModalComponent } from './make-reservation-modal.component';



@NgModule({
  declarations: [MakeReservationModalComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [MakeReservationModalComponent]
})
export class MakeReservationModalModule { }
