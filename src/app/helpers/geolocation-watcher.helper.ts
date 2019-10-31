import { GeolocationPosition, Plugins } from '@capacitor/core';
import * as mapboxgl from 'mapbox-gl';
import { LngLat, Marker } from 'mapbox-gl';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { createGeoJSONCircle } from './geojson-circle-generator.helper';
import { GeoJSONSourceRaw } from 'mapbox-gl';
import { Feature, Polygon } from 'geojson';

const { Geolocation } = Plugins;

export interface UserPosition {
  position: GeolocationPosition;
  radiusPolygon: Feature<Polygon>;
}

export class GeolocationWatcherHelper {
  public playerPosition: BehaviorSubject<UserPosition>;

  private playerPositionRadiusLayer: mapboxgl.Layer;
  private playerPositionMarker: Marker;
  private playerPositionRadius: number =
    environment.defaultPlayerPositionRadius;
  private geoWatcherId: string;

  private readonly map: mapboxgl.Map;

  constructor(map: mapboxgl.Map) {
    this.playerPosition = new BehaviorSubject<UserPosition>(null);
    this.map = map;
  }

  public enable() {
    this.startPlayerWatch();
  }

  public disable() {
    this.stopPlayerWatch();

    this.playerPositionMarker.remove();
    this.playerPositionMarker = null;

    this.map.removeLayer(this.playerPositionRadiusLayer.id);
    this.map.removeSource(this.playerPositionRadiusLayer.id);
    this.playerPositionRadiusLayer = null;
  }

  public setPlayerPositionRadius(radius: number) {
    if (!this.playerPositionRadius || !this.playerPositionMarker) {
      return;
    }
    this.playerPositionRadius = radius;
    this.updatePlayerPositionRadius(this.playerPosition.getValue().position);
  }

  private startPlayerWatch() {
    this.geoWatcherId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
      },
      (position, err) => {
        if (err) {
          console.error(err);
          return;
        }
        this.visualisePlayerPosition(position);

        // Get coordinates of radius
        const source = this.playerPositionRadiusLayer
          .source as GeoJSONSourceRaw;
        const radiusPolygon: Feature<Polygon> = source.data as Feature<Polygon>;

        this.playerPosition.next({
          position: position,
          radiusPolygon: radiusPolygon,
        });
      }
    );
  }

  private stopPlayerWatch() {
    Geolocation.clearWatch({ id: this.geoWatcherId });
  }

  private visualisePlayerPosition(position: GeolocationPosition) {
    if (!position) {
      return;
    }

    const mainMarker = document.createElement('div');
    mainMarker.className = 'mapboxgl-user-location-dot';

    const currentPlayerPosition: LngLat = new LngLat(
      position.coords.longitude,
      position.coords.latitude
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
      this.updatePlayerPositionRadius(position);
    }
  }

  private updatePlayerPositionRadius(position: GeolocationPosition) {
    const playerPositionCoords: LngLat = new LngLat(
      position.coords.longitude,
      position.coords.latitude
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
