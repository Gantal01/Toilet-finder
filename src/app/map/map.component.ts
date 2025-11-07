import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from "@angular/common";


import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-gpx';




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

  private userMarker!: L.Marker;
  private routeLayer!: any;
  private selectedToiletLatLng!: L.LatLng;

  transportProfile: string = 'trekking';

  constructor(private api: ApiService){}


  ngAfterViewInit(): void {
      this.initMap();

      const markers = L.markerClusterGroup({
          iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount(); 
            return L.divIcon({
              html: `
                <div class="custom-cluster-icon">
                  <div class="custom-cluster-count">
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


  startRoute(){
    if(!this.selectedToilet) return;

    this.selectedToiletLatLng = L.latLng(this.selectedToilet.lat, this.selectedToilet.lon);

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if(this.userMarker) this.map.removeLayer(this.userMarker);

      this.userMarker = L.marker(e.latlng, {draggable: true}).addTo(this.map);
      this.calculateRoute(e.latlng, this.selectedToiletLatLng);
      this.map.off('click', clickHandler);  
    };

    this.map.on('click', clickHandler);

  }

  calculateRoute(start: L.LatLng, end: L.LatLng){
    this.api.getRoute(start, end, this.transportProfile).subscribe({
      next: (gpxText: string) => {
        console.log("gpx", gpxText);
        if(this.routeLayer) this.map.removeLayer(this.routeLayer);

        // @ts-ignore
        this.routeLayer = new L.GPX(gpxText, {
          async: true,
          marker_options: {
            startIconUrl: 'assets/toilet_marker.png',
            endIconUrl: 'assets/toilet_marker.png',
            shadowUrl: null
          },
          polyline_options: {
            color: 'darkblue',
            weight: 6
          }
        }).on('addpoint', (e: any) => {
            if(e.point_type === 'end' && e.marker){
              this.map.removeLayer(e.marker);
            }
          })
          .on('loaded', (e:any) => {
            this.map.fitBounds(e.target.getBounds());
          }).addTo(this.map)
        },
      error: (err) => console.error('Route fetch error', err)
    });

  }





}
