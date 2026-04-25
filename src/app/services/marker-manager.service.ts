import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Toilet } from '../models/toilet';
import { ToiletList } from '../models/toilet-list';

const MARKER_SIZE: L.PointExpression = [60, 60];
const MARKER_ANCHOR: L.PointExpression = [30, 60];
const POPUP_ANCHOR: L.PointExpression = [0, -60];
const CLUSTER_SIZE: L.PointExpression = [30, 30];
const CLUSTER_ANCHOR: L.PointExpression = [15, 15];

const ICONS = {
  toilet: 'assets/toilet_marker.png',
  toiletNew: 'assets/toilet_marker_new.png',
  currentPosition: 'assets/currentPosition.png',
} as const;

@Injectable({
  providedIn: 'root',
})
export class MarkerManagerService {
  private currentPosMarker!: L.Marker;
  private adminPreviewMarker: L.Marker | null = null;
  private toiletMarkers: L.MarkerClusterGroup | null = null;

  constructor(private api: ApiService) {}

  loadToiletMarkers(
    map: L.Map,
    onToiletClick: (toilet: Toilet) => void,
    isAdminPreview: () => boolean,
    filters?: { fee?: boolean; wheelchair?: boolean },
  ) {

    if (this.toiletMarkers) {
      map.removeLayer(this.toiletMarkers);
      this.toiletMarkers = null;
    }

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
          iconSize: CLUSTER_SIZE,
          iconAnchor: CLUSTER_ANCHOR,
        });
      },
    });

    const toiletIcon = L.icon({
      iconUrl: ICONS.toilet,
      iconSize: MARKER_SIZE,
      iconAnchor: MARKER_ANCHOR,
    });

    this.api.getToilets(filters).subscribe({
      next: (toilets) => {
        toilets.forEach((t: ToiletList) => {
          if (t.lat && t.lon) {
            const marker = L.marker([t.lat, t.lon], { icon: toiletIcon });

            marker.on('click', () => {
              if (isAdminPreview()) return;
              this.api.getToiletsById(t.toilet_id).subscribe({
                next: (fullToilet) => onToiletClick(fullToilet),
                error: (err) => console.error(err),
              });
            });
            markers.addLayer(marker);
          }
        });

        map.addLayer(markers);
        this.toiletMarkers = markers;
      },
      error: (err) => console.error(err),
    });
  }

  showCurrentPosition(map: L.Map, latlng: L.LatLng) {
    if (this.currentPosMarker) {
      map.removeLayer(this.currentPosMarker);
    }

    this.currentPosMarker = L.marker(latlng, {
      icon: L.icon({
        iconUrl: ICONS.currentPosition,
        iconSize: MARKER_SIZE,
      }),
      zIndexOffset: 2000,
    }).addTo(map);
  }

  showAdminPreview(map: L.Map, pos: L.LatLngExpression): L.Marker {
    this.removeAdminPreview(map);

    const previewIcon = L.icon({
      iconUrl: ICONS.toiletNew,
      iconSize: MARKER_SIZE,
      iconAnchor: MARKER_ANCHOR,
      popupAnchor: POPUP_ANCHOR,
    });

    this.adminPreviewMarker = L.marker(pos, {
      icon: previewIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    return this.adminPreviewMarker;
  }

  removeAdminPreview(map: L.Map) {
    if (this.adminPreviewMarker) {
      map.removeLayer(this.adminPreviewMarker);
      this.adminPreviewMarker = null;
    }
  }
}
