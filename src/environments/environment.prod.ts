export const environment = {
  production: true,

  // Map-related parameters
  initialZoom: 16.2,
  maxZoom: 23,
  minZoom: 15,
  defaultCenter: { lng: 5.11867, lat: 52.09328 }, // Neude, Utrecht
  mapboxToken:
    'pk.eyJ1IjoiZWR1c2hpZnRzIiwiYSI6ImNrMjNidGN0NTAyaW4zZHA5dDBnaDR0bXkifQ.z0gAOXzO4aB124GsVP2rOg',
  mapBoundsOffset: 0.025,
  defaultPlayerPositionRadius: 25,
  corsProxyUrl: 'https://cors-anywhere.herokuapp.com/',
};
