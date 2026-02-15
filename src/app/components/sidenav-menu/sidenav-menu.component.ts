import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidenav-menu',
  standalone: true,
  imports: [
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './sidenav-menu.component.html',
  styleUrl: './sidenav-menu.component.scss',
})
export class SidenavMenuComponent {
  searchControl = new FormControl<string>('');
  errorMessage: string | null = null;

  @Output() navigate = new EventEmitter<void>();

  constructor(
    private router: Router,
    public auth: AuthService,
  ) {}

  homepage() {
    this.router.navigate(['']);
    this.navigate.emit();
  }

  closeMenu() {
    this.navigate.emit();
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['']);
  }
}
