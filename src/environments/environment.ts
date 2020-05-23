// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // Map-related parameters
  initialZoom: 16.2,
  maxZoom: 20,
  minZoom: 5,
  defaultCenter: { lng: 5.11867, lat: 52.09328 }, // Neude, Utrecht
  mapboxToken:
    'pk.eyJ1IjoiZWR1c2hpZnRzIiwiYSI6ImNrMjNidGN0NTAyaW4zZHA5dDBnaDR0bXkifQ.z0gAOXzO4aB124GsVP2rOg',
  mapBoundsOffset: 0.025,
  defaultPlayerPositionRadius: 25,
  corsProxyUrl: 'https://cors-anywhere.herokuapp.com/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
