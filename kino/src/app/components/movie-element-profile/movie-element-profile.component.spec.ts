import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieElementProfileComponent } from './movie-element-profile.component';

describe('MovieElementProfileComponent', () => {
  let component: MovieElementProfileComponent;
  let fixture: ComponentFixture<MovieElementProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovieElementProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MovieElementProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
