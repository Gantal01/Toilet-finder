import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgIf, NgFor, DatePipe, AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ApiService } from '../../services/api.service';
import {
  MatRadioButton,
  MatRadioChange,
  MatRadioGroup,
} from '@angular/material/radio';
import { AuthService } from '../../services/auth.service';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-toilet-panel',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    StarRatingComponent,
    DatePipe,
    MatRadioButton,
    MatRadioGroup,
    AsyncPipe,
    MatButtonModule
  ],
  templateUrl: './toilet-panel.component.html',
  styleUrl: './toilet-panel.component.scss',
})
export class ToiletPanelComponent implements OnChanges {
  @Input() toilet: any | null = null;

  averageRating = 0;
  ratingCount = 0;
  userRating = 0;
  description = '';
  transportMode: string = '';
  ratings: any[] = [];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toilet'] && this.toilet) {
      this.loadRatingAverage(this.toilet.toilet_id);

      this.api.getRatings(this.toilet.toilet_id).subscribe({
        next: (data) => {
          this.ratings = data;
        },
        error: (err) => console.error('API error', err),
      });
    }
  }

  @Output() close = new EventEmitter<void>();
  @Output() startRoute = new EventEmitter<void>();
  @Output() googleRoute = new EventEmitter<void>();
  @Output() downloadGpx = new EventEmitter<void>();
  @Output() TransportModeChange = new EventEmitter<string>();
  @Output() startRouteFromCurrentLocation = new EventEmitter();

  onModeChange(event: MatRadioChange) {
    this.transportMode = event.value;
    this.TransportModeChange.emit(event.value);
  }

  private loadRatingAverage(toilet_id: number): void {
    this.api.getRatingAverage(toilet_id).subscribe((average) => {
      this.averageRating = average.average;
      this.ratingCount = average.count;
    });
  }

  submitRating() {
    if (!this.toilet || this.userRating === 0) {
      alert('Adj meg értékelést is!');
      return;
    }

    this.api
      .postRating({
        toilet_id: this.toilet.toilet_id,
        value: this.userRating,
        description: this.description,
      })
      .subscribe({
        next: () => {
          this.userRating = 0;
          this.description = '';

          this.loadRatingAverage(this.toilet.toilet_id);
        },
        error: (err) => {
          if (err.status === 401) {
            alert('Csak bejelentkezve értékelhetsz');
          }
        },
      });
  }
}
