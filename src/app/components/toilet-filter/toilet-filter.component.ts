import { Component, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-toilet-filter',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCheckboxModule, MatTooltipModule, FormsModule, NgIf],
  templateUrl: './toilet-filter.component.html',
  styleUrl: './toilet-filter.component.scss'
})
export class ToiletFilterComponent {

  @Output() filterChange = new EventEmitter<{ fee?: boolean, wheelchair?: boolean }>();

  panelOpen: boolean = false;
  freeOnly: boolean = false;
  wheelchairOnly: boolean = false;

  togglePanel() {
    this.panelOpen = !this.panelOpen;
  }

  onFilterChange() {
    const filters: { fee?: boolean, wheelchair?: boolean } = {};
    if (this.freeOnly) {
      filters.fee = false;
    }
    if (this.wheelchairOnly) {
      filters.wheelchair = true;
    }
    this.filterChange.emit(filters);
  }

  resetFilters() {
    this.freeOnly = false;
    this.wheelchairOnly = false;
    this.onFilterChange();
  }

}
