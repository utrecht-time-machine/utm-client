import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GeoJSONSourceRaw } from 'mapbox-gl';
import { Feature } from 'geojson';

@Component({
  selector: 'utm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @ViewChild('mapboxContainer', { static: true }) mapboxContainer: ElementRef;
  map: mapboxgl.Map;

  constructor(private router: Router, private http: HttpClient) {
    this.startRefreshListener();
  }

  ngOnInit() {
    if (!this.map) {
      this.initMap();
    }
  }

  startRefreshListener() {
    // When page is loaded, resize map.
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/map') {
          // Execute multiple times, to ensure fast and slower devices get correct experience
          setTimeout(() => {
            this.map.resize();
          }, 100);
          setTimeout(() => {
            this.map.resize();
          }, 500);
          setTimeout(() => {
            this.map.resize();
          }, 1000);
        }
      }
    });
  }

  async initMap() {
    (mapboxgl as any).accessToken = environment.mapboxToken;
    this.map = new mapboxgl.Map({
      container: this.mapboxContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: environment.defaultCenter,
      zoom: environment.initialZoom,
      pitch: 45,
      maxZoom: environment.maxZoom,
      minZoom: environment.minZoom,
    });

    const stations = await this.http
      .get<Feature[]>('./assets/data-models/stations.json')
      .toPromise();

    // Load all available stations
    // TODO: make compatible with alternatives to Point types
    for (const station of stations) {
      // Load all available stations
      this.map.on('load', () => {
        const stationSource: GeoJSONSourceRaw = {
          type: 'geojson',
          data: station,
        };
        this.map.addSource('stations', stationSource);
        this.map.addLayer({
          id: 'neude-stations',
          type: 'circle',
          source: 'stations',
          paint: {
            'circle-radius': 9,
            'circle-color': '#B42222',
          },
        });
      });
    }
  }
}
