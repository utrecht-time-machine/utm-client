import { Story } from './story.model';

export interface RouteModel {
  '@id': string;
  storyIds: string[];
  stories?: Story[];
  properties: {
    title: string;
    description: string;
    color: string;
  };
}
