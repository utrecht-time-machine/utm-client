export interface RouteModel {
  '@id': string;
  stations: {
    '@id': string;
  }[];
  properties: {
    title: string;
    description: string;
    color: string;
  };
}
