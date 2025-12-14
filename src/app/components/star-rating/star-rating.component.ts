import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkAutofill } from "@angular/cdk/text-field";


@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [NgClass, NgFor, CdkAutofill],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {

@Input() rating: number = 0;
@Input() readonly: boolean = false;

@Output() ratingChange = new EventEmitter<number>();

stars = [1, 2, 3, 4, 5];
setRating(value: number){
  if(this.readonly) return;



this.rating = value;
this.ratingChange.emit(value);
}



}
