import { Component, inject, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MapActionService } from '../services/map-action.service';
import { filter } from 'rxjs/operators';

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
    AsyncPipe,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isMapPage = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private mapAction: MapActionService
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isMapPage = e.urlAfterRedirects === '/';
      });
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }

  selectNearestToilet() {
    this.mapAction.triggerSelectNearestToilet();
  }
}
