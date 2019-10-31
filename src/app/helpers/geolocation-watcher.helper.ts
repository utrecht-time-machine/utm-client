import { GeolocationPosition, Plugins } from '@capacitor/core';
import * as mapboxgl from 'mapbox-gl';
import { LngLat, Marker } from 'mapbox-gl';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { createGeoJSONCircle } from './geojson-circle-generator.helper';

const { Geolocation } = Plugins;

export class GeolocationWatcherHelper {
  public playerPosition: BehaviorSubject<GeolocationPosition>;
  public playerPositionRadiusLayer: mapboxgl.Layer;

  private playerPositionMarker: Marker;
  private playerPositionRadius: number =
    environment.defaultPlayerPositionRadius;
  private geoWatcherId: string;

  private readonly map: mapboxgl.Map;

  constructor(map: mapboxgl.Map) {
    this.playerPosition = new BehaviorSubject<GeolocationPosition>(null);
    this.map = map;
    this.subscribePlayerPosition();
  }

  public enable() {
    this.watchPlayerPosition();
  }

  public disable() {
    console.log(this.geoWatcherId);
    Geolocation.clearWatch({ id: this.geoWatcherId });
  }

  private watchPlayerPosition() {
    this.geoWatcherId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
      },
      (position, err) => {
        if (err) {
          console.error(err);
          return;
        }
        this.playerPosition.next(position);
      }
    );
  }

  private subscribePlayerPosition() {
    // Never unsubscribed, as will never live longer than class itself.
    this.playerPosition.subscribe((playerPosition: GeolocationPosition) => {
      if (!playerPosition) {
        return;
      }

      const mainMarker = document.createElement('div');
      mainMarker.className = 'mapboxgl-user-location-dot';

      const currentPlayerPosition: LngLat = new LngLat(
        playerPosition.coords.longitude,
        playerPosition.coords.latitude
      );

      if (!this.playerPositionMarker) {
        // Create the first radius object here
        this.playerPositionRadiusLayer = createGeoJSONCircle(
          `player-position-radius`,
          currentPlayerPosition,
          this.playerPositionRadius,
          24,
          'blue',
          0.2
        );

        this.playerPositionMarker = new Marker(mainMarker, {})
          .setLngLat(currentPlayerPosition)
          .addTo(this.map);
        this.map.addLayer(this.playerPositionRadiusLayer);
      } else {
        this.playerPositionMarker.setLngLat(currentPlayerPosition);
        this.updatePlayerPositionRadius();
      }
    });
  }

  setPlayerPositionRadius(radius: number) {
    if (!this.playerPositionRadius || !this.playerPositionMarker) {
      return;
    }
    this.playerPositionRadius = radius;
    this.updatePlayerPositionRadius();
  }

  private updatePlayerPositionRadius() {
    const playerPosition = this.playerPosition.getValue();
    const playerPositionCoords: LngLat = new LngLat(
      playerPosition.coords.longitude,
      playerPosition.coords.latitude
    );

    this.playerPositionRadiusLayer = createGeoJSONCircle(
      `player-position-radius`,
      playerPositionCoords,
      this.playerPositionRadius,
      24,
      'blue',
      0.2
    );
    // @ts-ignore
    this.map
      .getSource('player-position-radius')
      // @ts-ignore
      .setData(this.playerPositionRadiusLayer.source.data);
  }
}
