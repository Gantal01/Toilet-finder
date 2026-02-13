import { Component, inject, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MapActionService } from '../services/map-action.service';
import { GeocodeService } from '../services/geocode.service';

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
    ReactiveFormsModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isMapPage = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private mapAction: MapActionService,
    private geocode: GeocodeService,
  ) {}

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }

  searchControl = new FormControl<string>('');
  errorMessage: string | null = null;

  onSearch() {
    const q = (this.searchControl.value ?? '').trim();
    if (!q) return;

    this.errorMessage = null;
    this.searchControl.markAsTouched();
    this.searchControl.setErrors(null);

    this.geocode.search(q).subscribe({
      next: (res) => {
        if (!res) {
          this.searchControl.setErrors({ notFound: true });
          this.errorMessage = 'Nem taláható ilyen település!';
          return;
        }

        this.mapAction.jumpTo$.next({ lat: res.lat, lon: res.lon, zoom: 15 });
      },
      error: () => {
        this.searchControl.setErrors({ serverError: true });
        this.searchControl.markAsTouched();
        this.errorMessage = 'Keresési hiba';
      },
    });
  }

  homepage(){
    this.router.navigate([''])
  }

}
