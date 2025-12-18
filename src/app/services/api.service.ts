import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ToiletNearest } from '../models/toilet-nearest';
import { ToiletList } from '../models/toilet-list';
import { Toilet } from '../models/toilet';
import { User } from '../models/user';
import { Rating } from '../models/rating';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getToilets(): Observable<ToiletList[]>{
    return this.http.get<ToiletList[]>(`http://localhost:3000/toilets`);
  }

  getToiletsById(osm_id: number): Observable<Toilet>{
    return this.http.get<Toilet>(`http://localhost:3000/toilets/${osm_id}`);
  }

  getRoute(start: {lat: number, lng: number}, end: {lat: number, lng: number}, profile: string): Observable<string>{
    return this.http.post(`http://localhost:3000/route`, {start, end, profile}, {responseType: 'text'});
  }

  getUserById(user_id: number): Observable<User>{
    return this.http.get<User>(`http://localhost:3000/profil/${user_id}`);
  }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(`http://localhost:3000/users`)
  }

  getRatings(toilet_id: number): Observable<Rating[]>{
    return this.http.get<Rating[]>(`http://localhost:3000/rating/${toilet_id}`);
  }

  getRatingAverage(toilet_id: number): Observable<{average: number, count: number}>{
    return this.http.get<{average: number, count: number}>(`http://localhost:3000/rating/average/${toilet_id}`);
  }

  postRating(data: {toilet_id: number, value: number, description: string}): Observable<Rating> {
    return this.http.post<Rating>(`http://localhost:3000/rating`, data)
  }

  putNickname(nickname: string, userId: number){
    return this.http.put(`http://localhost:3000/users/${userId}/nickname`, {nickname});
  }

  removeNickname(userId: number){
    return this.http.put(`http://localhost:3000/users/${userId}/nickname/remove`, {});
  }

  getNearestToilet(lat: number, lng: number): Observable<ToiletNearest>{
    return this.http.get<ToiletNearest>(`http://localhost:3000/toilet/nearest?lat=${lat}&lon=${lng}`);
  }

  getRatingsByUserId(user_id: number): Observable<any>{
    return this.http.get(`http://localhost:3000/ratings/${user_id}`)
  }

  deleteRating(rating_id: number): Observable<{messange: string}>{
    return this.http.delete<{messange: string}>(`http://localhost:3000/rating/${rating_id}/delete`);
  }

  putRating(rating_id: number, value: number, description: string | null): Observable<Rating>{
    return this.http.put<Rating>(`http://localhost:3000/rating/${rating_id}/update`,{value, description})
  }

}
