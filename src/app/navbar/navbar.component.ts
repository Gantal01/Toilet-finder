import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MapActionService } from '../services/map-action.service';
import { GeocodeService } from '../services/geocode.service';
import { MatIconModule } from '@angular/material/icon';

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
    MatButtonModule,
    MatIconModule,
    RouterLinkActive
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isMapPage: boolean = false;
  isSidenavOpen: boolean = false;
  isLargeScreen: boolean = false;

  searchControl = new FormControl<string>('');
  errorMessage: string | null = null;

  @Output() menuClick = new EventEmitter<void>();

  constructor(
    public auth: AuthService,
    private router: Router,
    private mapAction: MapActionService,
    private geocode: GeocodeService,
  ) {
    this.checkScreenSize();
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }

  onSearch() {
    const q = (this.searchControl.value ?? '').trim();
    if (!q) return;

    if (this.router.url !== '/') {
      this.router.navigate(['']);
    }

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

  homepage() {
    this.router.navigate(['']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isLargeScreen = window.innerWidth >= 768;
    this.isSidenavOpen = this.isLargeScreen;
  }

  toggleSidenav() {
    this.menuClick.emit();
  }
}
