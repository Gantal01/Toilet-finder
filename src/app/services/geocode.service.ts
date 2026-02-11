import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { ApiService } from '../services/api.service';

export type GeocodeResult = { lat: number; lon: number };

@Injectable({
  providedIn: 'root',
})
export class GeocodeService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) {}

  search(query: string): Observable<GeocodeResult | null> {
    if (!query) {
      return of(null);
    }
    return this.api.getGeocode(query);
  }
}
