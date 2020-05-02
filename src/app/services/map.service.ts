import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import * as THREE from 'three';
import * as mapboxgl from 'mapbox-gl';
import { LngLat, LngLatBounds, MercatorCoordinate } from 'mapbox-gl';
import { Feature, Point } from 'geojson';
import { MeshLambertMaterial } from 'three';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  GeolocationWatcherHelper,
  UserPosition,
} from '../helpers/geolocation-watcher.helper';
import { environment } from '../../environments/environment';
import { MapTouchPitcherHelper } from '../helpers/map-touch-pitcher.helper';
import { Story } from '../models/story.model';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { mergeDedupe } from '../helpers/merge-array-dedupe.helper';
import { Router } from '@angular/router';
import { StationsService } from './stations.service';
import { HttpClient } from '@angular/common/http';
import { StoriesService } from './stories.service';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { skipWhile } from 'rxjs/operators';
import { RoutesService } from './routes.service';
import { RouteModel } from '../models/route.model';

interface Custom3dModel {
  url: string;
  scale: number;
  rotate: number; // in degrees
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

@Injectable({
  providedIn: 'root',
})
export class MapService {
  static defaultMaterial: MeshLambertMaterial = new THREE.MeshLambertMaterial({
    color: 0xfbefcf,
  });

  isInit: BehaviorSubject<boolean>;
  mapContainer: HTMLElement;

  private elementRenderer: Renderer2;

  private map: mapboxgl.Map;
  private scene: Record<string, THREE.Scene> = {};
  private camera: THREE.Camera;
  private renderer: THREE.Renderer;

  private geolocationWatcherSub: Subscription;
  private geolocationWatcher: GeolocationWatcherHelper;

  constructor(
    private rendererFactory: RendererFactory2,
    private stations: StationsService,
    private router: Router,
    private http: HttpClient,
    private stories: StoriesService,
    private routes: RoutesService
  ) {
    this.isInit = new BehaviorSubject<boolean>(null);
  }

  private static generateDefaultWaypoint(
    station
  ): { scene: THREE.Scene; meshTransform: ModelTransform } {
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

    const mesh = new THREE.Mesh(geometry, material);

    return {
      scene: new THREE.Scene().add(mesh),
      meshTransform: this.generateMeshTransform(
        modelOrigin,
        modelRotate,
        modelScale
      ),
    };
  }

  private static async generateCustomWaypoint(
    station: Feature<Point>
  ): Promise<{ scene: THREE.Scene; meshTransform: ModelTransform }> {
    const loader = new GLTFLoader();
    const meshProperties: Custom3dModel = station.properties['3d-model'];
    return new Promise((resolve, reject) => {
      loader.load(
        meshProperties.url,
        gltf => {
          // Change transform in individual items in scene
          // This allows the assumption that all /scenes/ have the same orientation and scale,
          // e.g., to add lighting from the same direction.
          const scale = station.properties['3d-model'].scale;
          const rotate = station.properties['3d-model'].rotate;
          for (const sceneItem of gltf.scene.children) {
            // only look at direct children
            // console.log(sceneItem); // DEBUG
            if (
              sceneItem.type === 'Mesh'
              || sceneItem.type === 'Group'
              || sceneItem.type === 'Object3D'
            ) {
              if (scale) {
                sceneItem.scale.set(scale, scale, scale);
              }
              if (rotate) {
                sceneItem.rotateY(THREE.Math.degToRad(meshProperties.rotate));
              }
            }
            // Also remove any lighting, if left in the model.
            if (sceneItem.type.toLowerCase().includes('light')) {
              gltf.scene.remove(sceneItem);
            }
          }

          // Set default material // TODO: if meaningful material data is available, it should not overwrite
          gltf.scene.traverse(node => {
            // Traverse all children
            // @ts-ignore // if exists, then equals mesh
            if (node.isMesh) {
              // @ts-ignore // If mesh, should always have material set
              node.material = this.defaultMaterial;
            }
          });

          // parameters to ensure the model is georeferenced correctly on the map
          const modelOrigin: MercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            new LngLat(
              station.geometry.coordinates[0],
              station.geometry.coordinates[1]
            ),
            0
          );
          const modelRotate = [Math.PI / 2, 0, 0];
          // @ts-ignore
          const modelScale = modelOrigin.meterInMercatorCoordinateUnits();

          MapService.addDefaultLightingToScene(gltf.scene);

          resolve({
            scene: gltf.scene,
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

  private static addDefaultLightingToScene(scene: THREE.Scene) {
    const baseLightIntensity = 1.1;

    const pointLight = new THREE.PointLight(0xffffff, 0.1 * baseLightIntensity);
    pointLight.position.set(-10, 4, -10);
    scene.add(pointLight);

    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff,
      0xfbf2da,
      0.3 * baseLightIntensity
    );
    scene.add(hemisphereLight);

    const directionalLight1 = new THREE.DirectionalLight(
      0xffffff,
      0.6 * baseLightIntensity
    );
    directionalLight1.position.set(500, 1000, 200).normalize();
    scene.add(directionalLight1);

    // DEBUG
    // const pointLightHelper =  new THREE.PointLightHelper(pointLight);
    // scene.add(pointLightHelper);
    // const helper = new THREE.DirectionalLightHelper(directionalLight1, 5, 0x000000);
    // scene.add(helper);
  }

  private static generateMeshTransform(
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

  init() {
    if (this.isInit.getValue() !== null) {
      console.error('You tried to reinitialise the map, which is not allowed.');
      return;
    }
    this.isInit.next(false);

    this.elementRenderer = this.rendererFactory.createRenderer(null, null);
    this.mapContainer = this.elementRenderer.createElement('div');

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
      container: this.mapContainer,
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
      this.isInit.next(true);

      this.addStations();
      this.updateRouteLines();

      // Update route lines when a new route has been selected
      this.routes.selected.subscribe(() => {
        this.updateRouteLines();
      });

      this.map.addControl(
        new mapboxgl.NavigationControl({
          // @ts-ignore
          visualizePitch: true,
        }),
        'bottom-right'
      );

      // Listen to pitch touch gestures
      const mapTouchPitcher = new MapTouchPitcherHelper(this.map);
      mapTouchPitcher.enable();

      // Listen to user movement events
      this.geolocationWatcher = new GeolocationWatcherHelper(this.map);
      this.geolocationWatcher.enable();

      // Update selection of stories if radius changes
      // Note that this can be much optimised, especially given a specialised back-end
      this.geolocationWatcherSub = this.geolocationWatcher.playerPosition
        .pipe(skipWhile(userPosition => !userPosition))
        .subscribe((userPosition: UserPosition) => {
          const selectedStories: Story[][] = [];
          for (const station of this.stations.all.getValue()) {
            // If point in radius, add stories of that station to selection
            if (booleanPointInPolygon(station, userPosition.radiusPolygon)) {
              // Add all stories with that station
              selectedStories.push(this.stories.getAllWithStation(station));
            }
          }
          this.stories.setSelectedStations(mergeDedupe(selectedStories));
        });
    });
  }

  bindTo(mapWrapper: HTMLElement) {
    this.elementRenderer.appendChild(mapWrapper, this.mapContainer);
  }

  startGeolocation() {
    this.geolocationWatcher.enable();
  }

  stopGeolocation() {
    this.geolocationWatcher.disable();
  }

  resize() {
    this.map.resize();
  }

  /**
   * Displays route lines between stations on the map
   * Adopted from https://docs.mapbox.com/mapbox-gl-js/example/geojson-line/
   */
  public async updateRouteLines() {
    // console.log('Updating route lines');

    // Retrieve route
    const route: RouteModel = this.routes.selected.getValue();
    const routeStationCoordinates = this.routes.getRouteStationCoordinates(
      route
    );

    // Remove previous route lines
    if (this.map.getLayer('route')) {
      this.map.removeLayer('route');
    }

    if (this.map.getSource('route')) {
      this.map.removeSource('route');
    }

    // Add new route lines
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeStationCoordinates,
        },
      },
    });

    const lineLayer: any = {
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': route.properties.color,
        'line-width': 4,
      },
    };

    this.map.addLayer(lineLayer);
  }

  /**
   * Displays stations as 3d cones on the map/
   * Adopted from https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
   */
  private async addStations() {
    // NOTE: Due to the for-loop, the scene is rendered multiple times with the same cone object,
    // rather than rendered once with multiple cone objects.
    for (const station of this.stations.all.getValue()) {
      // Generate new scene for each station, as each needs a unique transformation
      const currentCamera = this.camera;

      // Create scene to hold map object
      let currentScene: THREE.Scene;
      let modelTransform;
      let waypointResult;
      if (station.properties['3d-model']) {
        // custom waypoint
        waypointResult = await MapService.generateCustomWaypoint(station);
      } else {
        // default waypoint
        waypointResult = MapService.generateDefaultWaypoint(station);
      }
      currentScene = waypointResult.scene;
      modelTransform = waypointResult.meshTransform;

      this.scene[station.id] = currentScene;

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
