import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { NgIf, DatePipe, NgFor } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { MatDividerModule } from '@angular/material/divider';
import { Rating } from '../models/rating';
import { User } from '../models/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    MatButton,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInputModule,
    StarRatingComponent,
    DatePipe,
    NgFor,
    MatDividerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userId: number | null = null;
  user: User | null = null;

  formTrigger: boolean = false;
  newNickname: string = '';

  editingRatingId: number | null = null;

  ratings: Rating[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (!user || !user.user_id) return;

      this.userId = user.user_id;

      this.api.getUserById(this.userId!).subscribe({
        next: (userData) => (this.user = userData),
        error: (err) => console.error('API error', err),
      });

      this.api.getRatingsByUserId(this.userId!).subscribe({
        next: (rat) => {
          this.ratings = rat;
        },
        error: (err) => console.error('API error', err),
      });
    });
  }

  formTriggerFunc() {
    if (!this.formTrigger) {
      this.formTrigger = true;
    } else {
      this.formTrigger = false;
    }
  }

  setNewNickname() {
    if (!this.newNickname || this.userId === null) {
      return;
    }

    if (!confirm('Biztosan megváltoztatod a nevet?')) {
      return;
    }

    this.api.putNickname(this.newNickname, this.userId).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.formTrigger = false;
      },
      error: (err) => {
        if (err.status === 409) {
          alert('Ez a név már foglalt!');
        }

        console.error('Nickname update error', err);
      },
    });
  }

  removeNickname() {
    if (this.userId === null) {
      return;
    }

    this.api.removeNickname(this.userId).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.formTrigger = false;
      },
      error: (err) => {
        console.error('Nickname remove error', err);
      },
    });
  }

  deleteRating(ratingId: number) {
    if (!confirm('Biztosan törölni akarja a véleményét?')) {
      return;
    }

    this.api.deleteRating(ratingId).subscribe({
      next: () => {
        this.ratings = this.ratings.filter((r) => r.rating_id !== ratingId);
      },
      error: (err) => console.error('Delete rating error', err),
    });
  }

  modifyRating(rating_id: number) {
    this.editingRatingId = rating_id;
  }

  cancelEditing() {
    this.editingRatingId = null;
  }

  saveRating(rating: Rating) {
    this.api
      .putRating(rating.rating_id, rating.value, rating.description)
      .subscribe({
        next: () => {
          this.editingRatingId = null;
        },
        error: (err) => console.error('Update rating error', err),
      });
  }

    deleteUser(){
      if (!confirm('Biztosan törölni akarja a profilját?')) {
        return;
      }
    this.api.deleteUser().subscribe({
      next: () =>{
        this.auth.logout();
        this.router.navigate(['']);
      },
      error: (err) => console.error(err),
    })
  }
}
