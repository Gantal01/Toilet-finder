import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Toilet } from '../models/toilet';

export interface AdminPreviewAction {
  toilet: Toilet;
  returnToAdmin: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MapActionService {
  private selectNearestToiletSource = new Subject<void>();

  selectNearestToilet$ = this.selectNearestToiletSource.asObservable();

  triggerSelectNearestToilet() {
    this.selectNearestToiletSource.next();
  }

  jumpTo$ = new Subject<{ lat: number; lon: number; zoom: number }>();

 private adminPreviewToiletSubject =
    new BehaviorSubject<AdminPreviewAction | null>(null);

  adminPreviewToilet$ = this.adminPreviewToiletSubject.asObservable();

  setAdminPreviewToilet(action: AdminPreviewAction) {
    this.adminPreviewToiletSubject.next(action);
  }

  clearAdminPreviewToilet() {
    this.adminPreviewToiletSubject.next(null);
  }

}
