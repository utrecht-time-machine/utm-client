import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LngLat, LngLatBounds, MercatorCoordinate } from 'mapbox-gl';
import { Feature, Point, Polygon } from 'geojson';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshLambertMaterial } from 'three';
import { StationsService } from '../../../services/stations.service';
import { StoriesService } from '../../../services/stories.service';
import { MapTouchPitcherHelper } from '../../../helpers/map-touch-pitcher.helper';
import {
  GeolocationWatcherHelper,
  UserPosition,
} from '../../../helpers/geolocation-watcher.helper';
import { Story } from '../../../models/story.model';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { mergeDedupe } from '../../../helpers/merge-array-dedupe.helper';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';

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

enum ExplorationMode {
  Immersive,
  Overview,
}

@Component({
  selector: 'utm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnDestroy {
  static defaultMaterial: MeshLambertMaterial = new THREE.MeshLambertMaterial({
    color: 0xfbefcf,
  });

  @ViewChild('mapboxContainer', { static: true }) mapboxContainer: ElementRef;
  map: mapboxgl.Map;
  scene: Record<string, THREE.Scene> = {};
  camera: THREE.Camera;
  renderer: THREE.Renderer;

  geolocationWatcherSub: Subscription;
  routerEventSub: Subscription;
  geolocationWatcher: GeolocationWatcherHelper;

  currentExplorationMode: ExplorationMode = ExplorationMode.Immersive;

  constructor(
    private router: Router,
    private http: HttpClient,
    private stations: StationsService,
    private stories: StoriesService,
    private angularRenderer: Renderer2,
    private toast: ToastController
  ) {}

  static generateDefaultWaypoint(
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

  static async generateCustomWaypoint(
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

          MapViewComponent.addDefaultLightingToScene(gltf.scene);

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

  static addDefaultLightingToScene(scene: THREE.Scene) {
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

  startMapResizeListener() {
    // When page is loaded, resize map.
    this.routerEventSub = this.router.events.subscribe((event: RouterEvent) => {
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
      this.map.resize(); // May otherwise not display in full on first load
      this.angularRenderer.setStyle(
        this.mapboxContainer.nativeElement,
        'opacity',
        1
      );
      this.startMapResizeListener();
      this.addStations();

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
      this.geolocationWatcherSub = this.geolocationWatcher.playerPosition.subscribe(
        (userPosition: UserPosition) => {
          const selectedStories: Story[][] = [];
          for (const station of this.stations.all.getValue()) {
            // If point in radius, add stories of that station to selection
            if (booleanPointInPolygon(station, userPosition.radiusPolygon)) {
              // Add all stories with that station
              selectedStories.push(this.stories.getAllWithStation(station));
            }
          }
          this.stories.setSelectedStations(mergeDedupe(selectedStories));
        }
      );
    });
  }

  async toggleExplorationMode() {
    if (this.currentExplorationMode === ExplorationMode.Immersive) {
      this.setExplorationMode(ExplorationMode.Overview);
      const toast = await this.toast.create({
        header: 'Overview mode enabled',
        position: 'top',
        message:
          'You now have access to all stories without needing to be close to stations.',
        duration: 3000,
      });
      toast.present();
    } else {
      this.setExplorationMode(ExplorationMode.Immersive);
      const toast = await this.toast.create({
        header: 'Immersive mode enabled',
        position: 'top',
        message:
          'In order to experience stories, you need to explore the world and find them around you.',
        duration: 3000,
      });
      toast.present();
    }
  }

  private setExplorationMode(mode: ExplorationMode) {
    switch (mode) {
      case ExplorationMode.Immersive:
        if (this.currentExplorationMode === ExplorationMode.Immersive) {
          return;
        }
        this.geolocationWatcher.enable();
        this.currentExplorationMode = ExplorationMode.Immersive;
        break;
      case ExplorationMode.Overview:
        if (this.currentExplorationMode === ExplorationMode.Overview) {
          return;
        }
        this.geolocationWatcher.disable();
        this.stories.selectAll();
        this.currentExplorationMode = ExplorationMode.Overview;
        break;
    }
  }

  /**
   * Displays stations as 3d cones on the map/
   * Adopted from https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
   */
  async addStations() {
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
        waypointResult = await MapViewComponent.generateCustomWaypoint(station);
      } else {
        // default waypoint
        waypointResult = MapViewComponent.generateDefaultWaypoint(station);
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

  ngOnDestroy() {
    if (this.geolocationWatcherSub) {
      this.geolocationWatcherSub.unsubscribe();
    }
    if (this.routerEventSub) {
      this.routerEventSub.unsubscribe();
    }
  }
}
