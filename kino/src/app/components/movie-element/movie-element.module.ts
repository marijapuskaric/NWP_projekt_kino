import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieElementComponent } from './movie-element.component';

@NgModule({
  declarations: [MovieElementComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [MovieElementComponent]
})
export class MovieElementModule { }
