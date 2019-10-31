import * as mapboxgl from 'mapbox-gl';

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
export function createGeoJSONCircle(
  id,
  center,
  radiusInMeter,
  points,
  color,
  opacity
): mapboxgl.Layer {
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
        properties: [],
      },
    },
    layout: {},
    paint: {
      'fill-color': color,
      'fill-opacity': opacity,
    },
  };
}
