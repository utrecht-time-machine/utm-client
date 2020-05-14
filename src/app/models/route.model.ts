import { Story, StoryId } from './story.model';

export interface RouteModel {
  '@id': string;
  storyIds: StoryId[];
  stories?: Story[];
  properties: {
    title: string;
    description: string;
    color: string;
    hideLines: boolean;
  };
}
