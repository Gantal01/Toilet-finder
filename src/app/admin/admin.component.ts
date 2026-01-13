import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import {
  MatTabGroup,
  MatTabsModule,
  MatTabChangeEvent
} from '@angular/material/tabs';
import { ToiletList } from '../models/toilet-list';
import { User } from '../models/user';
import { MatDivider } from '@angular/material/divider';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { Toilet } from '../models/toilet';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { Rating } from '../models/rating';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    HttpClientModule,
    NgForOf,
    MatTabGroup,
    MatTabsModule,
    MatCardModule,
    MatCardContent,
    NgIf,
    StarRatingComponent,
    DatePipe,
    MatDivider,
    MatButton
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  toilets: ToiletList[] = [];
  users: User[] = [];
  selectedUser: User | null = null;
  slectedToilet: Toilet | null = null;
  userRatings: Rating[]  = [];
  toiletRatings: Rating[]  = [];
  newToilets: ToiletList[] = [];
  Keys = Object.keys;

  constructor(private api: ApiService) {}

  ngOnInit(): void {

    this.api.getToilets().subscribe({
      next: (data) => {
        this.toilets = data;
      },
      error: (err) => console.error('APi error: ', err),
    });

    this.api.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => console.error('APi error: ', err),
    });

    this.getNewToilets();
  }

  getToiletDetails(toiletID: number) {
    if (!this.slectedToilet || this.slectedToilet.toilet_id !== toiletID) {
      this.api.getToiletsById(toiletID).subscribe({
        next: (toilet) => {
          this.slectedToilet = toilet;
          this.getToiletRatings(this.slectedToilet.toilet_id);
        },
        error: (err) => console.error('API error', err),
      });
    } else {
      this.closeToiletCard();
    }
  }

  setUser(user: User) {
    if (!this.selectedUser || user !== this.selectedUser) {
      this.selectedUser = user;
      this.getUserRatings(this.selectedUser.user_id);
    } else {
      this.closeUserCard();
    }
  }

  closeUserCard() {
    this.selectedUser = null;
    this.userRatings = [];
  }

  closeToiletCard() {
    this.slectedToilet = null;
  }

  getUserRatings(userID: number) {
    this.api.getRatingsByUserId(userID).subscribe({
      next: (ratings) => {
        this.userRatings = ratings;
      },
      error: (err) => console.error('API error', err),
    });
  }

  getToiletRatings(toiletID: number) {
    this.api.getRatings(toiletID).subscribe({
      next: (ratings) => {
        this.toiletRatings = ratings;
      },
      error: (err) => console.error('API error', err),
    });
  }

  deleteRating(ratingID: number) {

    if(!confirm('Biztosan törölöd ezt a véleményt?')) {
      return;
    }

    if (ratingID === this.selectedUser?.user_id) {
      this.api.deleteRating(ratingID).subscribe({
        next: () => {
          this.userRatings = this.userRatings.filter(
            (r) => r.rating_id !== ratingID
          );
        },
      });
    } else {
      this.api.deleteRating(ratingID).subscribe({
        next: () => {
          this.toiletRatings = this.toiletRatings.filter(
            (r) => r.rating_id !== ratingID
          );
        },
      });
    }
  }


 getNewToiletDetails(toiletID: number) {
    if (!this.slectedToilet || this.slectedToilet.toilet_id !== toiletID) {
      this.api.getNewToiletsById(toiletID).subscribe({
        next: (toilet) => {
          this.slectedToilet = toilet;
        },
        error: (err) => console.error('API error', err),
      });
    } else {
      this.closeToiletCard();
    }
  }

  approveToilet(toilet_id: number){
    this.api.putToiletApprove(toilet_id).subscribe({
      next: () => {
        this.getNewToilets();
        this.slectedToilet = null;
      },
      error: (err) => console.error('API error', err), 
    });
  }



  getNewToilets(){
    this.api.getNewToilets().subscribe({
      next: (data) => {
        this.newToilets = data;
      },
      error: (err) => console.error('APi error: ', err),
    });
  }



  onTabChange(event: MatTabChangeEvent){
    this.selectedUser = null;
    this.slectedToilet = null;
    this.userRatings = [];
    this.toiletRatings = [];
  }

}
