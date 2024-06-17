import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/authService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit
{
  loginForm: FormGroup;
  constructor(private authService: AuthService) {}
  ngOnInit(): void 
  {
    this.loginForm = new FormGroup({
      'username': new FormControl('', [Validators.required]),
      'password': new FormControl('', [Validators.required])
    })
  }

  onSubmit()
  {
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password);
    
  }
}
