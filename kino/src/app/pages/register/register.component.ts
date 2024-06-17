import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/authService';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit
{
  registerForm: FormGroup;

  constructor(private authService: AuthService) {}

  ngOnInit(): void 
  {
    this.registerForm = new FormGroup({
      'username': new FormControl('', [Validators.required]),
      'password': new FormControl('', [Validators.required]),
      'confirmPassword': new FormControl('', [Validators.required])
    })
  }

  onSubmit()
  {
    if (this.registerForm.value.password == this.registerForm.value.confirmPassword)
    {
      this.authService.register(
        this.registerForm.value.username, 
        this.registerForm.value.password
      )
    }
    else
    {
      console.log("Password not confirmed");
    }
  }
}
