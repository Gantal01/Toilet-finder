import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }
}
