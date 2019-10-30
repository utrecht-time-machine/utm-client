import { AuthorId } from './author.model';
import { StationId } from './station.model';
import { TimePeriod } from './time-period.model';

export interface Story {
  '@id': string; // url
  '@type': string; // url
  title: string;
  lang: string; // e.g., nl, en, de
  description: string;
  'featured-image': string; // url
  authors: AuthorId[];
  stations: StationId[];
  'time-period': TimePeriod;
  seq: any[]; // to be defined
}
