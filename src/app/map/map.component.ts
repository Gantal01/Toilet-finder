import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from "@angular/common";


import * as L from 'leaflet';
import 'leaflet.markercluster';



@Component({
  selector: 'app-map',
  standalone: true,
  imports: [HttpClientModule, NgIf],
  providers:[ApiService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit{

  private map!: L.Map;

  selectedToilet: any = null;

  constructor(private api: ApiService){}


  ngAfterViewInit(): void {
      this.initMap();

      const markers = L.markerClusterGroup({
          iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount(); 
            return L.divIcon({
              html: `
                <div style="
                  position: relative;
                  width: 60px;
                  height: 60px;
                  background-image: url('assets/toilet_marker.png');
                  background-size: cover;
                  background-repeat: no-repeat;
                  background-position: center;
                  border-radius: 50%;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  <div style="
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background-color: red;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    text-align: center;
                    line-height: 20px;
                    font-weight: bold;
                    font-size: 12px;
                    border: 2px solid white;
                  ">
                    ${count}
                  </div>
                </div>
              `,
              className: '', 
              iconSize: [30, 30], 
              iconAnchor: [15, 15] 
          });
        }
        });


  this.api.getToilets().subscribe({
    next: (toilets) => {
      const toiletIcon = L.icon({
        iconUrl: 'assets/toilet_marker.png',
        iconSize: [60, 60],
      });

      toilets.forEach((t: any) => {
        if (t.lat && t.lon) {
          const marker = L.marker([t.lat, t.lon], { icon: toiletIcon });
         
          
            marker.on('click', () =>{
              this.api.getToiletsById(t.osm_id).subscribe({
                next: (fullToilet) => {
                  this.selectedToilet = fullToilet;
                  console.log("Részletes WC adatok:", fullToilet);
                },
                error: (err) => console.error(err)
              });

            });
          
          markers.addLayer(marker);         

        }
      });

      this.map.addLayer(markers);
    },
    error: (err) => console.error(err)
  });  
  }

  private initMap(): void{
    this.map = L.map('map', {
      center: [47.4979, 19.0402], //Budapest koordinátái
      zoom: 8.4,
      minZoom: 8
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);


  }





}
