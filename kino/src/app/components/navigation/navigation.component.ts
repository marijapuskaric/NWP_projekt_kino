import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../shared/authService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, OnDestroy {

  private authenticationSub: Subscription;
  userAuthenticated = false;
  role: string;

  constructor (private authService: AuthService){}
  ngOnDestroy(): void 
  {
    this.authenticationSub.unsubscribe();
  }

  ngOnInit(): void
  {
    this.userAuthenticated = this.authService.getIsAuthenticated();
    this.authenticationSub = this.authService.getAuthenticatedSub().subscribe(status => {
      this.userAuthenticated = status;
    })
    this.authService.getUser().subscribe(
      (response) => {
        this.role = response.user.role;
        console.log(this.role);
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  logout()
  {
    this.authService.logout();
  }

}
