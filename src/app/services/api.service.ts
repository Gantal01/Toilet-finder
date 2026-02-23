import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ToiletNearest } from '../models/toilet-nearest';
import { ToiletList } from '../models/toilet-list';
import { Toilet } from '../models/toilet';
import { User } from '../models/user';
import { Rating } from '../models/rating';
import { environment } from '../../environments/environment';
import { PostToilet } from '../models/toilet-add';
import { Suggestion } from '../models/suggestion';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getToilets(): Observable<ToiletList[]>{
    return this.http.get<ToiletList[]>(`${environment.apiUrl}/toilets`);
  }

  getToiletsById(toilet_id: number): Observable<Toilet>{
    return this.http.get<Toilet>(`${environment.apiUrl}/toilets/${toilet_id}`);
  }

  getRoute(start: {lat: number, lng: number}, end: {lat: number, lng: number}, profile: string): Observable<string>{
    return this.http.post(`${environment.apiUrl}/route`, {start, end, profile}, {responseType: 'text'});
  }

  getUserById(user_id: number): Observable<User>{
    return this.http.get<User>(`${environment.apiUrl}/profil/${user_id}`);
  }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(`${environment.apiUrl}/users`)
  }

  getRatings(toilet_id: number): Observable<Rating[]>{
    return this.http.get<Rating[]>(`${environment.apiUrl}/rating/${toilet_id}`);
  }

  getRatingAverage(toilet_id: number): Observable<{average: number, count: number}>{
    return this.http.get<{average: number, count: number}>(`${environment.apiUrl}/rating/average/${toilet_id}`);
  }

  postRating(data: {toilet_id: number, value: number, description: string | null}): Observable<Rating> {
    return this.http.post<Rating>(`${environment.apiUrl}/rating`, data)
  }

  putNickname(nickname: string, userId: number){
    return this.http.put<User>(`${environment.apiUrl}/users/${userId}/nickname`, {nickname});
  }

  removeNickname(userId: number){
    return this.http.put<User>(`${environment.apiUrl}/users/${userId}/nickname/remove`, {});
  }

  getNearestToilet(lat: number, lng: number): Observable<ToiletNearest>{
    return this.http.get<ToiletNearest>(`${environment.apiUrl}/toilet/nearest?lat=${lat}&lon=${lng}`);
  }

  getRatingsByUserId(user_id: number): Observable<any>{
    return this.http.get(`${environment.apiUrl}/ratings/${user_id}`)
  }

  deleteRating(rating_id: number): Observable<{messange: string}>{
    return this.http.delete<{messange: string}>(`${environment.apiUrl}/rating/${rating_id}/delete`);
  }

  putRating(rating_id: number, value: number, description: string | null): Observable<Rating>{
    return this.http.put<Rating>(`${environment.apiUrl}/rating/${rating_id}/update`,{value, description})
  }

  postToilet(toilet: PostToilet): Observable<PostToilet>{
    return this.http.post<PostToilet>(`${environment.apiUrl}/toilets/add`, toilet)
  }

  getNewToilets(): Observable<ToiletList[]>{
    return this.http.get<ToiletList[]>(`${environment.apiUrl}/newToilet`);
  }

  getNewToiletsById(toilet_id: number): Observable<Toilet>{
    return this.http.get<Toilet>(`${environment.apiUrl}/newToilets/${toilet_id}`);
  }

  putToiletApprove(toilet_id: number): Observable<Rating>{
    return this.http.put<Rating>(`${environment.apiUrl}/toilet/${toilet_id}/approve`, {})
  }

  postSuggestion(data: {toilet_id: number, suggestion: string | null}): Observable<Rating> {
    return this.http.post<Rating>(`${environment.apiUrl}/suggestion`, data)
  }

  getNewSuggestions(): Observable<Suggestion[]>{
      return this.http.get<Suggestion[]>(`${environment.apiUrl}/suggestions`)
  }

  patchToilet(toilet_id: number, payload: any): Observable<Toilet>{
    return this.http.patch<Toilet>(`${environment.apiUrl}/toiletsUpdate/${toilet_id}`, payload)
  }

  postSuggestionResolve(suggestion_id: number, status: 'approved' | 'rejected'){
    return this.http.post(`${environment.apiUrl}/suggestion/${suggestion_id}/resolve`, {status})
  }

  deleteToilet(toilet_id: number): Observable<{messange: string}>{
    return this.http.delete<{messange: string}>(`${environment.apiUrl}/toilet/${toilet_id}/delete`)
  }

  putToiletReject(toilet_id: number): Observable<Rating>{
    return this.http.put<Rating>(`${environment.apiUrl}/toilet/${toilet_id}/reject`, {})
  }

  getGeocode(query: string): Observable<{lat: number, lon: number} | null>{
    return this.http.get<{lat: number, lon: number} | null>(`${environment.apiUrl}/geocode?q=${encodeURIComponent(query)}`)
  }

  deleteUser(){
    return this.http.patch(`${environment.apiUrl}/user/me/delete`, {})
  }

  deleteUserByAdmin(user_id: number){
    return this.http.patch(`${environment.apiUrl}/user/${user_id}/delete`, {})
  }

  getMe(){
    return this.http.get(`${environment.apiUrl}/user/me`)
  }

  getToiletsAdmin(query: string): Observable<any>{
    return this.http.get<{}>(`${environment.apiUrl}/admin/toiletquery?q=${encodeURIComponent(query)}`)
  }

  getUsersAdmin(query: string): Observable<any>{
    return this.http.get<{}>(`${environment.apiUrl}/admin/userquery?q=${encodeURIComponent(query)}`)
  }

}
