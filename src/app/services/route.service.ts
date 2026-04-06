import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import * as L from 'leaflet';
import 'leaflet-gpx';

const TRANSPORT_MODE_MAP: Record<string, string> = {
  shortest: 'walking',
  mtb: 'bicycling',
  'car-vario': 'driving',
};

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  transportProfile: string = '';

  distance: number | null = null;
  time: number | null = null;
  calcRoute: boolean = false;

  private lastGpxText: string | null = null;
  private routeLayer: any = null;

  constructor(private api: ApiService) {}

  calculateRoute(
    map: L.Map,
    start: L.LatLng,
    end: L.LatLng,
    onLoaded?: () => void,
  ) {
    this.api.getRoute(start, end, this.transportProfile).subscribe({
      next: (gpxText: string) => {
        this.calcRoute = true;
        this.lastGpxText = gpxText;

        const stats = this.extractStats(gpxText);
        this.distance = stats.distanceKm ?? 0;
        this.time = stats.durationMin ?? 0;

        const startIcon = L.icon({
          iconUrl: 'assets/toilet_marker_start.png',
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        });
        const endIcon = L.icon({
          iconUrl: 'assets/toilet_marker_end.png',
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        });

        // @ts-ignore
        const newRouteLayer = new L.GPX(gpxText, {
          async: true,
          markers: {
            startIcon,
            endIcon,
            wptIcons: {},
          },
          polyline_options: {
            color: 'darkblue',
            weight: 6,
          },
        })
          .on('loaded', (e: any) => {
            if (this.routeLayer) {
              map.removeLayer(this.routeLayer);
            }
            this.routeLayer = newRouteLayer;
            map.fitBounds(e.target.getBounds());
            onLoaded?.();
          })
          .on('addpoint', (e: any) => {
            if (e.point_type === 'end' && e.marker) {
              map.removeLayer(e.marker);
            }
          })
          .addTo(map);
      },
      error: (err) => {
        console.error('Route fetch error', err);
        this.calcRoute = false;
      },
    });
  }

  private extractStats(gpx: string): {
    distanceKm?: number;
    durationMin?: number;
  } {
    const commentMatch = gpx.match(/<!--([\s\S]*?)-->/);
    if (!commentMatch) return {};

    const comment = commentMatch[1];

    const distanceMatch = comment.match(/track-length\s*=\s*([0-9]+)/i);
    const distanceKm = distanceMatch
      ? Number(distanceMatch[1]) / 1000
      : undefined;

    const timeMatch = comment.match(
      /time\s*=\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i,
    );
    let durationMin: number | undefined;
    if (timeMatch) {
      const h = Number(timeMatch[1] ?? 0);
      const m = Number(timeMatch[2] ?? 0);
      const s = Number(timeMatch[3] ?? 0);
      durationMin = h * 60 + m + s / 60;
    }

    return { distanceKm, durationMin };
  }

  openGoogleRoute(startLatLng: L.LatLng, endLatLng: L.LatLng) {
    const travelMode = TRANSPORT_MODE_MAP[this.transportProfile] ?? '';
    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${startLatLng.lat},${startLatLng.lng}` +
      `&destination=${endLatLng.lat},${endLatLng.lng}` +
      `&travelmode=${travelMode}`;
    window.open(url, '_blank');
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

  clearRoute(map: L.Map) {
    if (this.routeLayer) {
      map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
    this.calcRoute = false;
    this.distance = null;
    this.time = null;
    this.lastGpxText = null;
  }
}
