import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<any | null>(
    this.getUserFromToken(),
  );
  user$ = this.userSubject.asObservable();

  constructor(private api: ApiService) {
    this.bootstrapAuth();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('jwt');
  }

  private getUserFromToken(): any | null {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  bootstrapAuth() {
    if (!this.hasToken()) {
      this.loggedInSubject.next(false);
      this.userSubject.next(null);
      return;
    }

    this.userSubject.next(this.getUserFromToken());

    this.api.getMe().subscribe({
      next: (me) => {
        this.loggedInSubject.next(true);
        this.userSubject.next(me);
      },
      error: (err) => {
        if (err.status === 401) {
          this.logout();
        } else {
          console.error(err);
        }
      },
    });
  }

  login(token: string) {
    localStorage.setItem('jwt', token);

    this.bootstrapAuth();

    const user = this.getUserFromToken();
    this.loggedInSubject.next(true);
    this.userSubject.next(user);
  }

  logout() {
    localStorage.removeItem('jwt');
    this.loggedInSubject.next(false);
    this.userSubject.next(null);
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }
}
