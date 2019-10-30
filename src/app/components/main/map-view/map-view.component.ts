import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LngLat, LngLatBounds, Marker, MercatorCoordinate } from 'mapbox-gl';
import { Feature, Point } from 'geojson';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Plugins, GeolocationPosition } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { MeshLambertMaterial } from 'three';

const { Geolocation } = Plugins;

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

@Component({
  selector: 'utm-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  static defaultMaterial: MeshLambertMaterial = new THREE.MeshLambertMaterial({
    color: 0xfbefcf,
  });

  @ViewChild('mapboxContainer', { static: true }) mapboxContainer: ElementRef;
  map: mapboxgl.Map;
  scene: Record<string, THREE.Scene> = {};
  camera: THREE.Camera;
  renderer: THREE.Renderer;

  playerPosition: BehaviorSubject<GeolocationPosition>;
  playerPositionMarker: Marker;
  playerPositionRadius: BehaviorSubject<number>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private angularRenderer: Renderer2
  ) {
    this.playerPosition = new BehaviorSubject<GeolocationPosition>(null);
    this.playerPositionRadius = new BehaviorSubject<number>(
      environment.defaultPlayerPositionRadius
    );
  }

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

      this.watchPlayerPosition();
      this.watchPlayerPositionRadius();

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
        // Create the first radius object here
        const playerPositionRadiusRaw: any = createGeoJSONCircle(
          `player-position-radius`,
          currentPlayerPosition,
          this.playerPositionRadius.getValue(),
          24,
          'blue',
          0.2
        );

        this.playerPositionMarker = new Marker(mainMarker, {})
          .setLngLat(currentPlayerPosition)
          .addTo(this.map);
        this.map.addLayer(playerPositionRadiusRaw);
      } else {
        this.playerPositionMarker.setLngLat(currentPlayerPosition);
        this.updatePlayerPositionRadius();
      }
    });
  }

  watchPlayerPositionRadius() {
    this.playerPositionRadius.subscribe(playerPositionRadius => {
      if (!playerPositionRadius || !this.playerPositionMarker) {
        return;
      }
      this.updatePlayerPositionRadius();
    });
  }

  updatePlayerPositionRadius() {
    const playerPosition = this.playerPosition.getValue();
    const playerPositionCoords: LngLat = new LngLat(
      playerPosition.coords.longitude,
      playerPosition.coords.latitude
    );

    const playerPositionRadiusRaw: any = createGeoJSONCircle(
      `player-position-radius`,
      playerPositionCoords,
      this.playerPositionRadius.getValue(),
      24,
      'blue',
      0.2
    );
    // @ts-ignore
    this.map
      .getSource('player-position-radius')
      // @ts-ignore
      .setData(playerPositionRadiusRaw.source.data);
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
}

/**
 * Returns a geojson object describing a polygonal circle that can be projected on the map.
 * Adapted from: https://stackoverflow.com/a/39006388
 *
 * @param id
 * @param center
 * @param radiusInMeter
 * @param points
 * @param color
 * @param opacity
 * @returns geojson
 */
function createGeoJSONCircle(
  id,
  center,
  radiusInMeter,
  points,
  color,
  opacity
) {
  if (!points) {
    points = 64;
  }

  const coords = {
    latitude: center.lat,
    longitude: center.lng,
  };

  const km = radiusInMeter / 1000;

  const ret = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  let theta, x, y;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    id: id,
    type: 'fill',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ret],
        },
      },
    },
    layout: {},
    paint: {
      'fill-color': color,
      'fill-opacity': opacity,
    },
  };
}
