import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {


  getCurrentLocation(): Promise<{ lat: number, lng: number}>{
    return new Promise((resolve, reject) =>{
      if(!navigator.geolocation){
        reject('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => reject(error), {enableHighAccuracy: true}
        
      );

    });
  }


}
