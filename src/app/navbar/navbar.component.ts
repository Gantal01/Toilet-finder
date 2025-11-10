import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { RouterLink } from "@angular/router";
import { MatInputModule } from "@angular/material/input";
import { NgIf } from "@angular/common";


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    NgIf
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  userRole: string | null = null;


  ngOnInit(): void {
      this.checkLoginStatus();
      
  }

  checkLoginStatus(){
    const token = localStorage.getItem('jwt');
    
    if(token){
      this.isLoggedIn = true;

      try{
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = payload.role || null;
      }catch(err){
        console.error('Token error:', err);
      }
    }else{
      this.isLoggedIn = false;
      this.userRole = null;
    }
  }

  logout(){
    localStorage.removeItem('jwt');
    this.isLoggedIn = false;
    this.userRole = null;
  }

}
