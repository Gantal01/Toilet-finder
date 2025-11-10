import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements AfterViewInit {
  userId: number | null = null;
  user: any;

  constructor(private api: ApiService) {}

  ngAfterViewInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        console.log('Token payload:', token.split('.')[1]);
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded payload:', payload);
        const userIdString = payload.user_id || payload.sub;


        if (userIdString) {
          this.userId = Number(userIdString);

          this.api.getUserById(this.userId).subscribe({
            next: (user) => {console.log('User info:', user);
              this.user = user;
            },
            error: err => {console.error('Api hiba: ', err);}
          });
        }
      } catch (err) {
        console.error('Wrong format', err);
      }
    }
  }
}
