export interface RouteModel {
  stations: {
    '@id': string;
  }[];
  properties: {
    title: string;
    description: string;
    color: string;
  };
}
