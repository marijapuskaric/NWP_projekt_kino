import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../shared/authService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy 
{
  private authenticationSub: Subscription;
  userAuthenticated = false;
  role: string;

  constructor(private authService: AuthService) {}

  ngOnDestroy(): void 
  {
    if (this.authenticationSub) { this.authenticationSub.unsubscribe(); }
  }

  ngOnInit(): void 
  {
    this.userAuthenticated = this.authService.getIsAuthenticated();

    if (this.userAuthenticated) 
    {
      this.authenticationSub = this.authService.getAuthenticatedSub().subscribe(status => {
        this.userAuthenticated = status;
        if (status) {
          this.authService.getUser().subscribe(
            (response) => {
              this.role = response.user.role;
            },
            (error) => {
              console.error('Error fetching user information', error);
            }
          );
        } else {
          this.role = ''; 
        }
      });
    } else {
      this.role = ''; 
    }
  }

  logout(): void 
  {
    this.authService.logout();
  }
}
