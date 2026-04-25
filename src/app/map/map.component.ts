import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToiletPanelComponent } from '../components/toilet-panel/toilet-panel.component';
import { LocationService } from '../services/location.service';
import { MapActionService } from '../services/map-action.service';
import { Toilet } from '../models/toilet';
import { ToiletNearest } from '../models/toilet-nearest';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { AddToiletComponent } from '../components/add-toilet/add-toilet.component';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RouteService } from '../services/route.service';
import { MarkerManagerService } from '../services/marker-manager.service';
import { ToiletFilterComponent } from '../components/toilet-filter/toilet-filter.component';

import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-gpx';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const MARKER_SIZE: L.PointExpression = [60, 60];
const MARKER_ANCHOR: L.PointExpression = [30, 60];
const POPUP_ANCHOR: L.PointExpression = [0, -60];

const BUDAPEST_CENTER: L.LatLngExpression = [47.4979, 19.0402];
const DEFAULT_ZOOM = 8.4;
const INIT_MIN_ZOOM = 8;
const MIN_ZOOM = 15;

const ICONS = {
  toilet: 'assets/toilet_marker.png',
  toiletNew: 'assets/toilet_marker_new.png',
  currentPosition: 'assets/currentPosition.png',
} as const;

L.Icon.Default.mergeOptions({
  iconUrl: ICONS.toilet,
  iconRetinaUrl: ICONS.toilet,
  shadowUrl: null,
  iconSize: MARKER_SIZE,
  iconAnchor: MARKER_ANCHOR,
  popupAnchor: POPUP_ANCHOR,
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    ToiletPanelComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    NgIf,
    AsyncPipe,
    AddToiletComponent,
    ToiletFilterComponent
  ],
  providers: [ApiService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;

  selectedToilet: Toilet | null = null;

  private userMarker!: L.Marker;

  private selectedToiletLatLng!: L.LatLng;
  private startRouteLatLng: L.LatLng | null = null;

  private currentPosMarker!: L.Marker;
  private currentFilters: {fee?: boolean; wheelchair?: boolean} = {};

  private prevZoom: number | null = null;

  addToiletMode: boolean = false;
  addToiletLatLng: L.LatLng | null = null;
  isPickingPosition: boolean = false;

  showBackToAdminButton = false;
  isAdminPreviewMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private locationService: LocationService,
    private mapAction: MapActionService,
    public auth: AuthService,
    private router: Router,
    private routeService: RouteService,
    private markerManager: MarkerManagerService,
  ) {}

  get distance() {
    return this.routeService.distance;
  }
  get time() {
    return this.routeService.time;
  }
  get calcRoute() {
    return this.routeService.calcRoute;
  }
  get transportProfile() {
    return this.routeService.transportProfile;
  }

  onTransportModeChange(mode: string) {
    this.routeService.transportProfile = mode;

    if (this.startRouteLatLng && this.selectedToilet) {
      this.routeService.calculateRoute(
        this.map,
        this.startRouteLatLng,
        this.selectedToiletLatLng,
      );
    }
  }

  ngAfterViewInit(): void {
    this.initMap();

    this.markerManager.loadToiletMarkers(
      this.map,
      (toilet) => {
        this.selectedToilet = toilet;
        console.log('Részletes WC adatok:', toilet);
      },
      () => this.isAdminPreviewMode,
    );

    this.mapAction.selectNearestToilet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getNearestToilet();
      });

    this.currentPosition();

    this.mapAction.jumpTo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ lat, lon, zoom }) => {
        this.map.setView([lat, lon], zoom);
      });

    this.mapAction.adminPreviewToilet$
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (!action || !action.toilet) return;

        this.isAdminPreviewMode = true;

        const lat = Number(action.toilet.lat);
        const lon = Number(action.toilet.lon);

        if (!isFinite(lat) || !isFinite(lon)) {
          return;
        }

        const pos: L.LatLngExpression = [lat, lon];

        Promise.resolve().then(() => {
          this.selectedToilet = action.toilet;
          this.showBackToAdminButton = action.returnToAdmin;
        });
        this.selectedToiletLatLng = L.latLng(lat, lon);

        this.markerManager.showAdminPreview(this.map, pos);

        requestAnimationFrame(() => {
          this.map.invalidateSize(true);
          this.map.flyTo(pos, 19, { duration: 1.2 });
        });
        this.mapAction.clearAdminPreviewToilet();
      });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: BUDAPEST_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: INIT_MIN_ZOOM,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
  }

  startRoute() {
    if (this.isAdminPreviewMode) return;
    if (!this.selectedToilet) return;

    this.selectedToiletLatLng = L.latLng(
      this.selectedToilet.lat,
      this.selectedToilet.lon,
    );

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (this.userMarker) this.map.removeLayer(this.userMarker);

      this.startRouteLatLng = e.latlng;

      this.userMarker = L.marker(e.latlng, { draggable: true }).addTo(this.map);
      this.routeService.calculateRoute(
        this.map,
        e.latlng,
        this.selectedToiletLatLng,
      );

      this.userMarker.on('dragend', (event: L.LeafletEvent) => {
        const marker = event.target as L.Marker;
        const newPosition = marker.getLatLng();
        this.startRouteLatLng = newPosition;
        this.routeService.calculateRoute(
          this.map,
          this.startRouteLatLng,
          this.selectedToiletLatLng,
        );
      });

      this.map.off('click', clickHandler);
    };

    this.map.on('click', clickHandler);
  }

  googleRoute() {
    if (this.isAdminPreviewMode) return;
    if (!this.userMarker || !this.selectedToiletLatLng) {
      alert('Nincs elérhető útvonal!');
      return;
    }

    this.routeService.openGoogleRoute(
      this.userMarker.getLatLng(),
      this.selectedToiletLatLng,
    );
  }

  downloadGpx() {
    if (this.isAdminPreviewMode) return;

    this.routeService.downloadGpx();
  }

  async startRouteFromCurrentLocation() {
    if (this.isAdminPreviewMode) return;
    if (!this.selectedToilet) {
      return;
    }

    try {
      const position = await this.locationService.getCurrentLocation();

      const startLatLng = L.latLng(position.lat, position.lng);

      this.selectedToiletLatLng = L.latLng(
        this.selectedToilet.lat,
        this.selectedToilet.lon,
      );

      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
      }

      this.userMarker = L.marker(startLatLng, {
        icon: L.icon({
          iconUrl: ICONS.currentPosition,
          iconSize: MARKER_SIZE,
        }),
      }).addTo(this.map);

      this.startRouteLatLng = startLatLng;

      this.routeService.calculateRoute(
        this.map,
        startLatLng,
        this.selectedToiletLatLng,
      );
    } catch (err) {
      console.log('Position error', err);
    }
  }

  async currentPosition() {
    try {
      const position = await this.locationService.getCurrentLocation();

      const latlng = L.latLng(position.lat, position.lng);

      if (this.currentPosMarker) {
        this.map.removeLayer(this.currentPosMarker);
      }

      this.markerManager.showCurrentPosition(this.map, latlng);
    } catch (err) {
      console.log('Position error', err);
    }
  }

  async getNearestToilet() {
    if (this.isAdminPreviewMode) return;
    try {
      const position = await this.locationService.getCurrentLocation();

      this.api.getNearestToilet(position.lat, position.lng).subscribe({
        next: (nearest: ToiletNearest) => {
          this.api.getToiletsById(nearest.toilet_id).subscribe({
            next: (toilet) => {
              this.selectedToilet = toilet;

              this.selectedToiletLatLng = L.latLng(nearest.lat, nearest.lon);

              this.map.setView(this.selectedToiletLatLng, 25);
            },
            error: (err) => console.error('Toilet details error', err),
          });
        },

        error: (err) => console.error('Nearest toilet error', err),
      });
    } catch (err) {
      console.error('Location error', err);
    }
  }

  startAddToiletMode() {
    if (this.isAdminPreviewMode) return;
    this.lockZoomForPicking();
    this.selectedToilet = null;
    this.addToiletLatLng = null;
    this.addToiletMode = true;
    this.isPickingPosition = true;

    const mapElement = document.getElementById('map');
  }

  cancelAddToiletMode() {
    this.addToiletMode = false;
    this.mapInteraction(true);

    const mapElement = document.getElementById('map');
  }

  cancelAdding() {
    this.unlockZoom();
    this.mapInteraction(true);
    this.addToiletMode = false;
    this.isPickingPosition = false;
    this.addToiletLatLng = null;

    const mapElement = document.getElementById('map');
  }

  confirmPosition() {
    this.mapInteraction(false);
    const position = this.map.getCenter();
    this.addToiletLatLng = L.latLng(position.lat, position.lng);

    this.isPickingPosition = false;
  }

  saveToilet() {
    this.cancelAdding();
  }

  openMap() {
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${this.selectedToilet?.lat}%2C${this.selectedToilet?.lon}`;

    window.open(googleUrl, '_blank');
  }

  private lockZoomForPicking() {
    this.prevZoom = this.map.getMinZoom();

    if (this.map.getZoom() < MIN_ZOOM) {
      this.map.setZoom(MIN_ZOOM);
    }

    this.map.setMinZoom(MIN_ZOOM);
  }

  private unlockZoom() {
    if (this.prevZoom !== null) {
      this.map.setMinZoom(this.prevZoom);
      this.prevZoom = null;
    }
  }

  private mapInteraction(enable: boolean) {
    if (!this.map) {
      return;
    }

    if (enable) {
      this.map.dragging.enable();
      this.map.touchZoom.enable();
      this.map.doubleClickZoom.enable();
      this.map.scrollWheelZoom.enable();
      this.map.boxZoom.enable();
      this.map.keyboard.enable();

      if ((this.map as any).tap) {
        (this.map as any).tap.enable();
      }
    } else {
      this.map.dragging.disable();
      this.map.touchZoom.disable();
      this.map.doubleClickZoom.disable();
      this.map.scrollWheelZoom.disable();
      this.map.boxZoom.disable();
      this.map.keyboard.disable();

      if ((this.map as any).tap) {
        (this.map as any).tap.disable();
      }
    }
  }

  backToAdmin() {
    this.showBackToAdminButton = false;

    this.markerManager.removeAdminPreview(this.map);

    this.isAdminPreviewMode = false;

    this.router.navigate(['/admin'], {
      queryParamsHandling: 'preserve',
      state: {
        selectedToiletId: this.selectedToilet?.toilet_id,
      },
    });
  }

  onFilterChange(filters: { fee?: boolean; wheelchair?: boolean }) {
    this.currentFilters = filters;
    this.markerManager.loadToiletMarkers(
      this.map,
      (toilet) => {
        this.selectedToilet = toilet;
      },
      () => this.isAdminPreviewMode,
      filters,
    );
  } 

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}