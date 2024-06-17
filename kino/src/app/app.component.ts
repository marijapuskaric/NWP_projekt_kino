import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/authService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit 
{
  constructor(private authService: AuthService){}

  ngOnInit(): void 
  {
    this.authService.authenticateFromLocalStorage();
  }
  title = 'kino';
}
