import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<any | null>(this.getUserFromToken());
  user$ = this.userSubject.asObservable();

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

  login(token: string) {
    localStorage.setItem('jwt', token);

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




