export const environment = {
  production: true,

  // Map-related parameters
  initialZoom: 17.5,
  maxZoom: 20,
  minZoom: 5,
  // defaultCenter: { lng: 5.11867, lat: 52.09328 }, // Neude, Utrecht
  defaultCenter: { lng: 5.121309, lat: 52.090698 }, // Dom Tower, Utrecht
  mapboxToken:
    'pk.eyJ1IjoidGltYW5nZXZhcmUiLCJhIjoiY2tmMHpmODI4MGc2YTJzbWppd2w0NzF2OCJ9.xGfrOagKWT1nowqOj32zNA',
  // 'pk.eyJ1IjoiZWR1c2hpZnRzIiwiYSI6ImNrMjNidGN0NTAyaW4zZHA5dDBnaDR0bXkifQ.z0gAOXzO4aB124GsVP2rOg',
  mapBoundsOffset: 0.025,
  defaultPlayerPositionRadius: 25,
  corsProxyUrl: 'https://cors-anywhere.herokuapp.com/',
};
