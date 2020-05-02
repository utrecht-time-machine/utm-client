export interface RouteModel {
  '@id': string;
  stations: {
    '@id': string;
  }[];
  stories: RouteStoryModel[];
  properties: {
    title: string;
    description: string;
    color: string;
  };
}

export interface RouteStoryModel {
  title: string;
  subtitle: string;
  story: string;
}
