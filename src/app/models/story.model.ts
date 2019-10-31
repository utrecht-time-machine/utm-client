import { AuthorId } from './author.model';
import { StationId } from './station.model';
import { TimePeriod } from './time-period.model';

export enum SeqType {
  Article = 'https://utrechttimemachine.nl/scene-types/article',
  Dialogue = 'https://utrechttimemachine.nl/scene-types/dialogue',
}

export interface Seq {
  '@id': string; // url
  '@type': SeqType;
}

export interface ArticleSeq extends Seq {
  content: string; // contains URL to markdown file
}

export interface Story {
  '@id': string; // url
  '@type': 'https://utrechttimemachine.nl/ontology/story';
  title: string;
  lang: string; // e.g., nl, en, de
  description: string;
  'featured-image': string; // url
  authors: AuthorId[];
  stations: StationId[];
  'time-period': TimePeriod;
  seq: Seq[]; // to be defined
}
