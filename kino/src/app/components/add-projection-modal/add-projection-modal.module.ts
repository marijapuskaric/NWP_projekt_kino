import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProjectionModalComponent } from './add-projection-modal.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [AddProjectionModalComponent],
  imports: [CommonModule, NgbDatepickerModule, ReactiveFormsModule],
  exports: [AddProjectionModalComponent]
})
export class AddProjectionModalModule { }
