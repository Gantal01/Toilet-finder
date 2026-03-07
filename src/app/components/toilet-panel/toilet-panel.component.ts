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
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Rating } from '../../models/rating';
import { Toilet } from '../../models/toilet';
import { TagDictionaryService } from '../../services/tag-dictionary.service';
import {
  MatExpansionModule,
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatCard, MatCardContent } from '@angular/material/card';

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
    MatButtonModule,
    MatSlideToggle,
    MatButtonModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatCard,
    MatCardContent,
  ],
  templateUrl: './toilet-panel.component.html',
  styleUrl: './toilet-panel.component.scss',
})
export class ToiletPanelComponent implements OnChanges {
  @Input() toilet: Toilet | null = null;
  @Input() distance: number | null = null;
  @Input() time: number | null = null;
  @Input() calculatedRoute: boolean = false;

  averageRating = 0;
  ratingCount = 0;
  userRating = 0;
  description = '';
  transportMode: string = '';
  ratings: Rating[] = [];
  suggestion = '';
  routePanel: boolean = false;

  isFromCurrent: boolean = false;

  Keys = Object.keys;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    public tag: TagDictionaryService,
  ) {}

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

    if (changes['calculatedRoute']) {
      if (this.calculatedRoute) {
        this.routePanel = true;
      } else {
        this.routePanel = false;
      }
    }
  }

  @Output() close = new EventEmitter<void>();
  @Output() startRoute = new EventEmitter<void>();
  @Output() googleRoute = new EventEmitter<void>();
  @Output() downloadGpx = new EventEmitter<void>();
  @Output() TransportModeChange = new EventEmitter<string>();
  @Output() startRouteFromCurrentLocation = new EventEmitter();
  @Output() openMap = new EventEmitter();

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
    if (!confirm('Biztosan beküldöd ezt a véleményt?')) {
      return;
    }

    if (!this.toilet || this.userRating === 0) {
      alert('Adj meg értékelést is!');
      return;
    }

    const toilet = this.toilet;

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

          this.loadRatingAverage(toilet.toilet_id);
        },
        error: (err) => {
          if (err.status === 401) {
            alert('Csak bejelentkezve értékelhetsz');
          }
        },
      });
  }

  submitSuggestion() {
    if (!confirm('Biztosan beküldöd ezt a javaslatot?')) {
      return;
    }

    if (!this.toilet) {
      return;
    }

    const toilet = this.toilet;

    this.api
      .postSuggestion({
        toilet_id: this.toilet.toilet_id,
        suggestion: this.suggestion,
      })
      .subscribe({
        next: () => {
          this.suggestion = '';
        },
        error: (err) => {
          if (err.status === 401) {
            alert('Csak bejelentkezve értékelhetsz');
          }
        },
      });
  }
}
