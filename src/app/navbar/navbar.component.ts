import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { RouterLink, Router } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { NgIf, AsyncPipe } from "@angular/common";
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    NgIf,
    AsyncPipe
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  constructor(public auth: AuthService, private router: Router){}
 

  loginWithGoogle(){
    this.auth.loginWithGoogle();
  }


  logout(){
    this.auth.logout();
    this.router.navigate(['']);  
  }



}
