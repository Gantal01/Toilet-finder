import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getToilets(): Observable<any>{
    return this.http.get(`http://localhost:3000/toilets`);
  }

  getToiletsById(osm_id: number): Observable<any>{
    return this.http.get(`http://localhost:3000/toilets/${osm_id}`);
  }

  getRoute(start: {lat: number, lng: number}, end: {lat: number, lng: number}, profile: string): Observable<string>{
    return this.http.post(`http://localhost:3000/route`, {start, end, profile}, {responseType: 'text'});
  }

  getUserById(user_id: number): Observable<any>{
    return this.http.get(`http://localhost:3000/profil/${user_id}`);
  }

  getUsers(): Observable<any>{
    return this.http.get(`http://localhost:3000/users`)
  }

}
