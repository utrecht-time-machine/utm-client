import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LngLat, LngLatBounds, Marker, MercatorCoordinate } from 'mapbox-gl';
import { Feature, Point } from 'geojson';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

const { Geolocation } = Plugins;

interface Custom3dModel {
  url: string;
  scale: number;
  rotate: number[];
  altitude: number;
}

interface ModelTransform {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  /* Since our 3D model is in real world meters, a scale transform needs to be
   * applied since the CustomLayerInterface expects units in MercatorCoordinates.
   */
  scale: number;
}

@Component({
  selector: 'utm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  @ViewChild('mapboxContainer', { static: true }) mapboxContainer: ElementRef;
  map: mapboxgl.Map;
  scene: Record<string, THREE.Scene> = {};
  camera: THREE.Camera;
  renderer: THREE.Renderer;

  playerPosition: BehaviorSubject<GeolocationPosition>;
  playerPositionMarker: Marker;

  constructor(private router: Router, private http: HttpClient) {
    this.playerPosition = new BehaviorSubject(null);

    this.startRefreshListener();
  }

  static generateDefaultMesh(
    station
  ): { mesh: THREE.Mesh; meshTransform: ModelTransform } {
    const coneHeight = 6;
    const geometry = new THREE.ConeGeometry(2, coneHeight, 3);
    const material = new THREE.MeshBasicMaterial({ color: 0x9d1f1f });

    // parameters to ensure the model is georeferenced correctly on the map
    const modelOrigin: MercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      new LngLat(
        station.geometry.coordinates[0],
        station.geometry.coordinates[1]
      ),
      coneHeight / 2
    );
    const modelRotate = [Math.PI / 2, 0, 0];
    // @ts-ignore
    const modelScale = modelOrigin.meterInMercatorCoordinateUnits();

    return {
      mesh: new THREE.Mesh(geometry, material),
      meshTransform: this.generateMeshTransform(
        modelOrigin,
        modelRotate,
        modelScale
      ),
    };
  }

  static async generateCustomMesh(
    station: Feature<Point>
  ): Promise<{ mesh: THREE.Mesh; meshTransform: ModelTransform }> {
    const loader = new STLLoader();
    const meshProperties: Custom3dModel = station.properties['3d-model'];
    return new Promise((resolve, reject) => {
      loader.load(
        meshProperties.url,
        geometry => {
          geometry.scale(
            meshProperties.scale,
            meshProperties.scale,
            meshProperties.scale
          );
          const material = new THREE.MeshLambertMaterial({ color: 0x353a37 });

          // parameters to ensure the model is georeferenced correctly on the map
          const modelOrigin: MercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            new LngLat(
              station.geometry.coordinates[0],
              station.geometry.coordinates[1]
            ),
            0
          );
          const modelRotate = meshProperties.rotate;
          // @ts-ignore
          const modelScale = modelOrigin.meterInMercatorCoordinateUnits();

          resolve({
            mesh: new THREE.Mesh(geometry, material),
            meshTransform: this.generateMeshTransform(
              modelOrigin,
              modelRotate,
              modelScale
            ),
          });
        },
        progress => {},
        error => {
          reject(`Failed to download 3D model of ${station.id}: ${error}`);
        }
      );
    });
  }

  static generateMeshTransform(
    modelAsMercatorCoordinate: MercatorCoordinate,
    modelRotate: number[],
    modelScale: number
  ) {
    // transformation parameters to position, rotate and scale the 3D model onto the map
    return {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelScale,
    };
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
          }, 2000);
        }
      }
    });
  }

  initMap() {
    const mapBounds: LngLatBounds = new LngLatBounds(
      new LngLat(
        environment.defaultCenter.lng - environment.mapBoundsOffset,
        environment.defaultCenter.lat - environment.mapBoundsOffset
      ), // Southwest coordinates
      new LngLat(
        environment.defaultCenter.lng + environment.mapBoundsOffset,
        environment.defaultCenter.lat + environment.mapBoundsOffset
      ) // Northeast coordinates
    );

    (mapboxgl as any).accessToken = environment.mapboxToken;
    this.map = new mapboxgl.Map({
      container: this.mapboxContainer.nativeElement,
      style: 'mapbox://styles/edushifts/ck24sb7330d2h1cl78hj19tmw',
      center: environment.defaultCenter,
      zoom: environment.initialZoom,
      pitch: 45,
      maxZoom: environment.maxZoom,
      minZoom: environment.minZoom,
      maxBounds: mapBounds,
    });

    // use the Mapbox GL JS map canvas for three.js
    this.camera = new THREE.Camera();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.map.getCanvas(),
      antialias: true,
    });

    this.map.on('load', () => {
      this.addStations();

      this.watchPlayerPosition();

      this.map.addControl(
        new mapboxgl.NavigationControl({
          // @ts-ignore
          visualizePitch: true,
        }),
        'bottom-right'
      );
    });
  }

  watchPlayerPosition() {
    // TODO: subscription management
    Geolocation.watchPosition(
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

    // TODO: subscription management
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
        this.playerPositionMarker = new Marker(mainMarker, {})
          .setLngLat(currentPlayerPosition)
          .addTo(this.map);
      } else {
        this.playerPositionMarker.setLngLat(currentPlayerPosition);
      }
    });
  }

  /**
   * Displays stations as 3d cones on the map/
   * Adopted from https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
   */
  async addStations() {
    const stations = await this.http
      .get<Feature<Point>[]>('./assets/data-models/stations.json')
      .toPromise();

    // NOTE: Due to the for-loop, the scene is rendered multiple times with the same cone object,
    // rather than rendered once with multiple cone objects.
    for (const station of stations) {
      // Generate new scene for each station, as each needs a unique transformation
      this.scene[station.id] = new THREE.Scene();
      const currentScene = this.scene[station.id];
      const currentCamera = this.camera;

      // create two three.js lights to illuminate the model
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(0, -70, 100).normalize();
      currentScene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff);
      directionalLight2.position.set(0, 300, 50).normalize();
      currentScene.add(directionalLight2);

      // Add mesh
      let mesh: THREE.Mesh;
      let modelTransform;
      if (station.properties['3d-model']) {
        const meshResult = await MapViewComponent.generateCustomMesh(station);
        mesh = meshResult.mesh;
        modelTransform = meshResult.meshTransform;
      } else {
        const meshResult = MapViewComponent.generateDefaultMesh(station);
        mesh = meshResult.mesh;
        modelTransform = meshResult.meshTransform;
      }

      currentScene.add(mesh);

      // @ts-ignore
      this.renderer.autoClear = false;

      // configuration of the custom layer for a 3D model per the CustomLayerInterface
      const customLayer = {
        id: `station-${station.id}`,
        type: 'custom',
        renderingMode: '3d',
        render: (gl, matrix) => {
          const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX
          );
          const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY
          );
          const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelTransform.rotateZ
          );

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              modelTransform.translateX,
              modelTransform.translateY,
              modelTransform.translateZ
            )
            .scale(
              new THREE.Vector3(
                modelTransform.scale,
                -modelTransform.scale,
                modelTransform.scale
              )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          currentCamera.projectionMatrix = m.multiply(l);

          // @ts-ignore
          this.renderer.state.reset();
          this.renderer.render(currentScene, currentCamera);
        },
      };
      this.map.triggerRepaint();
      // @ts-ignore
      this.map.addLayer(customLayer, 'building 3D');
    }
  }
}
