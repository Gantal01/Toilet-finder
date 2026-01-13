import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { PostToilet } from '../../models/toilet-add';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NgFor } from '@angular/common';

type ExtraInfo = { key: string; value: string };

@Component({
  selector: 'app-add-toilet',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSlideToggle,
    NgFor,
  ],
  templateUrl: './add-toilet.component.html',
  styleUrl: './add-toilet.component.scss',
})
export class AddToiletComponent {
  @Input() lat: number | null = null;
  @Input() lng: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  addedToilet: PostToilet | null = null;

  readonly maxNumExtraInfo = 15;

  constructor( private api: ApiService){}

  name = '';
  operator = '';
  access = '';
  opening_hours = '';
  fee: boolean | null = null;
  wheelchair: boolean | null = null;

  extraInfos: ExtraInfo[] = [];

  addExtraInfo() {
    if (this.extraInfos.length >= this.maxNumExtraInfo) {
      return;
    }

    this.extraInfos.push({ key: '', value: '' });
  }

  removeExtraInfo(i: number) {
    this.extraInfos.splice(i, 1);
  }

  buildExtraInfo(): Record<string, string> | null {
    const cleaned = this.extraInfos
      .map((p) => ({ key: p.key.trim(), value: p.value.trim() }))
      .filter((p) => p.key.length > 0 && p.value.length > 0);

    if (cleaned.length === 0) return null;

    const keys = cleaned.map((x) => x.key);
    const unique = new Set(keys);
    if (unique.size !== keys.length) {
      alert('Az extra információk kulcsai nem lehetnek duplikáltak.');
      return null;
    }

    const record: Record<string, string> = {};
    cleaned.forEach((p) => (record[p.key] = p.value));
    return record;
  }

  saveToilet() {
    const extra_info = this.buildExtraInfo();

    const payload: PostToilet = {
      name: this.name?.trim() || null,
      operator: this.operator?.trim() || null,
      access: this.access?.trim() || null,
      lat: this.lat,
      lon: this.lng,
      opening_hours: this.opening_hours?.trim() || null,
      fee: this.fee,
      wheelchair: this.wheelchair,
      extra_info: extra_info,
    };
    this.api.postToilet(payload).subscribe({
      next: () => this.save.emit(),
      error: (err) => console.error(err)
    });
  }
  
}
