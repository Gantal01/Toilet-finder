import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToiletPanelComponent } from '../components/toilet-panel/toilet-panel.component';
import { LocationService } from '../services/location.service';

import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-gpx';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: 'assets/toilet_marker.png',
  iconRetinaUrl: 'assets/toilet_marker.png',
  shadowUrl: null,
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
});



@Component({
  selector: 'app-map',
  standalone: true,
  imports: [ToiletPanelComponent],
  providers: [ApiService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;

  selectedToilet: any = null;

  private userMarker!: L.Marker;
  private routeLayer!: any;
  private selectedToiletLatLng!: L.LatLng;
  private startRouteLatLng: L.LatLng | null = null;

  private lastGpxText: string | null = null;

   private currentPosMarker!: L.Marker;

  transportProfile: string = '';


  

  onTransportModeChange(mode: string) {
    this.transportProfile = mode;

    if (this.startRouteLatLng && this.selectedToilet) {
      this.calculateRoute(this.startRouteLatLng, this.selectedToiletLatLng);
    }
  }

  constructor(
    private api: ApiService,
    private locationService: LocationService
  ) {}

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
          iconAnchor: [15, 15],
        });
      },
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

            marker.on('click', () => {
              this.api.getToiletsById(t.toilet_id).subscribe({
                next: (fullToilet) => {
                  this.selectedToilet = fullToilet;
                  console.log('Részletes WC adatok:', fullToilet);
                },
                error: (err) => console.error(err),
              });
            });

            markers.addLayer(marker);
          }
        });

        this.map.addLayer(markers);
      },
      error: (err) => console.error(err),
    });


     this.currentPosition();

  }

  private initMap(): void {

    const currentPos = this.locationService.getCurrentLocation();

    this.map = L.map('map', {
      center: [47.4979, 19.0402], //Budapest koordinátái
      zoom: 8.4,
      minZoom: 8,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
  }

  startRoute() {
    if (!this.selectedToilet) return;

    this.selectedToiletLatLng = L.latLng(
      this.selectedToilet.lat,
      this.selectedToilet.lon
    );

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (this.userMarker) this.map.removeLayer(this.userMarker);

      this.startRouteLatLng = e.latlng;

      this.userMarker = L.marker(e.latlng, { draggable: true }).addTo(this.map);
      this.calculateRoute(e.latlng, this.selectedToiletLatLng);


      this.userMarker.on('dragend', (event: L.LeafletEvent) => {
        const marker = event.target as L.Marker;
        const newPosition = marker.getLatLng();
        this.startRouteLatLng = newPosition;
        this.calculateRoute(this.startRouteLatLng, this.selectedToiletLatLng);
      })

      this.map.off('click', clickHandler);
    };

    this.map.on('click', clickHandler);
  }

  calculateRoute(start: L.LatLng, end: L.LatLng) {
    this.api.getRoute(start, end, this.transportProfile).subscribe({
      next: (gpxText: string) => {
        console.log('gpx', gpxText);

        this.lastGpxText = gpxText;

          const startIcon = L.icon({
          iconUrl: 'assets/greenDot.png',
          iconSize: [30,30],
          iconAnchor: [10,10],  
          });
           const endIcon = L.icon({
          iconUrl: 'assets/redDot.png',
          iconSize: [30,30],
          iconAnchor: [10,10],  
          });


        // @ts-ignore
        const newRouteLayer = new L.GPX(gpxText, {
          async: true,
          markers: {
            startIcon: startIcon,
            endIcon: endIcon,
            wptIcons: {},
          },
          polyline_options: {
            color: 'darkblue',
            weight: 6,
          },
        })
          .on('loaded', (e: any) => {
            if (this.routeLayer) {
              this.map.removeLayer(this.routeLayer);
            }
            this.routeLayer = newRouteLayer;
            this.map.fitBounds(e.target.getBounds());
          })
          .on('addpoint', (e: any) => {
            if (e.point_type === 'end' && e.marker) {
              this.map.removeLayer(e.marker);
            }
          })
          /*
          .on('loaded', (e: any) => {
            this.map.fitBounds(e.target.getBounds());
          })*/
          .addTo(this.map);
      },
      error: (err) => console.error('Route fetch error', err),
    });
  }

  googleRoute() {
    if (!this.userMarker || !this.selectedToiletLatLng) {
      alert('Nincs elérhető útvonal!');
      return;
    }

    var startLat = this.userMarker.getLatLng().lat;
    var startLng = this.userMarker.getLatLng().lng;

    var endLat = this.selectedToiletLatLng.lat;
    var endLng = this.selectedToiletLatLng.lng;

    var travelMode = '';

    switch (this.transportProfile) {
      case 'shortest':
        travelMode = 'walking';
        break;
      case 'mtb':
        travelMode = 'bicycling';
        break;
      case 'car-vario':
        travelMode = 'driving';
        break;
      default:
        break;
    }

    const googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=${travelMode}`;

    window.open(googleUrl, '_blank');
  }

  downloadGpx() {
    if (!this.lastGpxText) {
      alert('Nincs letölthető útvonal!');
      return;
    }

    const blob = new Blob([this.lastGpxText], {
      type: 'application/gpx+xml;charset=utf-8',
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'utvonal.gpx';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  async startRouteFromCurrentLocation() {
    if (!this.selectedToilet) {
      return;
    }

    try {
      const position = await this.locationService.getCurrentLocation();

      const startLatLng = L.latLng(position.lat, position.lng);

      this.selectedToiletLatLng = L.latLng(
        this.selectedToilet.lat,
        this.selectedToilet.lon
      );

      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
      }

      this.userMarker = L.marker(startLatLng, {
        icon: L.icon({
          iconUrl: 'assets/toilet_marker.png',
          iconSize: [60, 60],
        }),
      }).addTo(this.map);

      this.startRouteLatLng = startLatLng;

      this.calculateRoute(startLatLng, this.selectedToiletLatLng);
    } catch (err) {
      console.log('Position error', err);
    }
  }


  async currentPosition() {
    try{
      const position = await this.locationService.getCurrentLocation();

      const latlng = L.latLng(position.lat, position.lng);

      if(this.currentPosMarker){
        this.map.removeLayer(this.currentPosMarker);
      }


      this.currentPosMarker = L.marker(latlng, {
        icon: L.icon({
          iconUrl: 'assets/currentPosition.png',
          iconSize: [60,60]
        }),
      }).addTo(this.map);

    }catch (err){
      console.log('Position error', err);
    }
  }
}
