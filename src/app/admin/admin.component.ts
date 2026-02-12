import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import {
  MatTabGroup,
  MatTabsModule,
  MatTabChangeEvent,
} from '@angular/material/tabs';
import { ToiletList } from '../models/toilet-list';
import { User } from '../models/user';
import { MatDivider } from '@angular/material/divider';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { Toilet } from '../models/toilet';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { Rating } from '../models/rating';
import { MatButton } from '@angular/material/button';
import { Suggestion } from '../models/suggestion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatButton,
    MatFormField,
    MatLabel,
    A11yModule,
    FormsModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  toilets: ToiletList[] = [];
  users: User[] = [];
  selectedUser: User | null = null;
  slectedToilet: Toilet | null = null;
  userRatings: Rating[] = [];
  toiletRatings: Rating[] = [];
  newToilets: ToiletList[] = [];
  Keys = Object.keys;
  suggestions: Suggestion[] = [];
  selectedSuggestion: Suggestion | null = null;
  modifyTrigger: boolean = false;
  editToilet: any = null;
  extraInfoText: string = '';

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

    this.api.getNewSuggestions().subscribe({
      next: (data) => {
        this.suggestions = data;
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
        console.log('toiletRatings raw:', ratings);
      console.log('first item keys:', ratings?.[0] && Object.keys(ratings[0]));
        this.toiletRatings = ratings;
      },
      error: (err) => console.error('API error', err),
    });
  }

  deleteRating(ratingID: number) {
    if (!confirm('Biztosan törölöd ezt a véleményt?')) {
      return;
    }

    if (ratingID === this.selectedUser?.user_id) {
      this.api.deleteRating(ratingID).subscribe({
        next: () => {
          this.userRatings = this.userRatings.filter(
            (r) => r.rating_id !== ratingID,
          );
        },
      });
    } else {
      this.api.deleteRating(ratingID).subscribe({
        next: () => {
          this.toiletRatings = this.toiletRatings.filter(
            (r) => r.rating_id !== ratingID,
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

  approveToilet(toilet_id: number) {
    this.api.putToiletApprove(toilet_id).subscribe({
      next: () => {
        this.getNewToilets();
        this.slectedToilet = null;
      },
      error: (err) => console.error('API error', err),
    });
  }

    rejectToilet(toilet_id: number) {
    this.api.putToiletApprove(toilet_id).subscribe({
      next: () => {
        this.getNewToilets();
        this.slectedToilet = null;
      },
      error: (err) => console.error('API error', err),
    });
  }

  getNewToilets() {
    this.api.getNewToilets().subscribe({
      next: (data) => {
        this.newToilets = data;
      },
      error: (err) => console.error('APi error: ', err),
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedUser = null;
    this.slectedToilet = null;
    this.userRatings = [];
    this.toiletRatings = [];
    this.selectedSuggestion = null;
    this.modifyTrigger = false;
  }

  setSuggestion(suggestion: Suggestion) {
    this.selectedSuggestion = suggestion;
    this.api.getToiletsById(suggestion.toilet_id).subscribe({
      next: (toilet) => {
        this.slectedToilet = toilet;
      },
      error: (err) => console.error('API error', err),
    });
  }

  setModifyTrigger() {
    if (this.modifyTrigger) {
      this.modifyTrigger = false;
    } else {
      this.modifyTrigger = true;
    }

    if(this.modifyTrigger){
      this.initEditToilet();
    }
  }

  putToiletDataSuggestoins() {
    if (!this.slectedToilet || !this.selectedSuggestion) {
      return;
    }

    let extraObj: any = {};
    try {
      extraObj = JSON.parse(this.extraInfoText || '{}');
    } catch {
      alert('Hibás extrainfo!');
      return;
    }

    const payload = {
      ...this.editToilet,
      extra_info: extraObj,
    };

    this.api.patchToilet(this.slectedToilet.toilet_id, payload).subscribe({
      next: (updatetedToilet) => {
        this.slectedToilet = updatetedToilet;

        this.api
          .postSuggestionResolve(
            this.selectedSuggestion!.suggestion_id,
            'approved',
          )
          .subscribe({
            next: () => {
              this.suggestions = this.suggestions.filter(
                (s) =>
                  s.suggestion_id !== this.selectedSuggestion!.suggestion_id,
              );

              this.selectedSuggestion = null;
              this.slectedToilet = null;
              this.modifyTrigger = false;
            },
            error: (err) => console.error(err),
          });
      },
      error: (err) => console.error(err),
    });
  }

  rejectSuggestion() {
    if (!this.selectedSuggestion) return;

    this.api
      .postSuggestionResolve(this.selectedSuggestion.suggestion_id, 'rejected')
      .subscribe({
        next: () => {
          this.suggestions = this.suggestions.filter(
            (s) => s.suggestion_id !== this.selectedSuggestion!.suggestion_id,
          );

          this.selectedSuggestion = null;
          this.slectedToilet = null;
          this.modifyTrigger = false;
        },
        error: (err) => console.error(err),
      });
  }

  putToiletData() {
    if (!this.slectedToilet) {
      return;
    }

    let extraObj: any = {};
    try {
      extraObj = JSON.parse(this.extraInfoText || '{}');
    } catch {
      alert('Hibás extrainfo!');
      return;
    }

    const payload = {
      ...this.editToilet,
      extra_info: extraObj,
    };

    this.api.patchToilet(this.slectedToilet.toilet_id, payload).subscribe({
      next: (updatetedToilet) => {
        this.slectedToilet = updatetedToilet;
        this.modifyTrigger = false;
      },
      error: (err) => console.error(err),
    });
  }

  initEditToilet(){

    if(!this.slectedToilet){
      return;
    }

    this.editToilet = {
          name: this.slectedToilet.name ?? null,
          operator: this.slectedToilet.operator ?? null,
          access: this.slectedToilet.access ?? null,
          opening_hours: this.slectedToilet.opening_hours ?? null,
          fee: this.slectedToilet.fee ?? null,
          wheelchair: this.slectedToilet.wheelchair ?? null,
        };

        this.extraInfoText = JSON.stringify(this.slectedToilet.extra_info ?? {}, null, 2);
  }

  deleteToilet(){

    if(!this.slectedToilet){
      return;
    }

    if (!confirm('Biztosan törölöd ezt a mosdót?')) {
      return;
    }

    this.api.deleteToilet(this.slectedToilet?.toilet_id).subscribe({
      next: () => {
        this.toilets = this.toilets.filter(
          (t) =>  t.toilet_id !== this.slectedToilet?.toilet_id
        )
        this.slectedToilet = null;
      },
      error: (err) => console.error(err),
    })
  }


  deleteUserByAdmin(user_id: number){

    if(!confirm("Biztoan törli a felhasználót?")){
      return;
    }

    this.api.deleteUserByAdmin(user_id).subscribe({
      next: () =>{
        const index = this.users.filter( u => u.user_id === user_id);
      },
      error: (err) => console.error(err),
    })
  }

}
