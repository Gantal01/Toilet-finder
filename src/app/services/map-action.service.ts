import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapActionService {

  private selectNearestToiletSource = new Subject<void>();

  selectNearestToilet$ = this.selectNearestToiletSource.asObservable();

  triggerSelectNearestToilet(){
    this.selectNearestToiletSource.next();
   }
}
