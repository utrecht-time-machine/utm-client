import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SeqType, Story } from '../models/story.model';
import { Feature, Point } from 'geojson';
import { Author } from '../models/author.model';
import { AuthorsService } from './authors.service';

@Injectable({
  providedIn: 'root',
})
export class StoriesService {
  all: BehaviorSubject<Story[]>;
  selected: BehaviorSubject<Story[]>;
  filtered: BehaviorSubject<Story[]>;
  currentlyViewed: BehaviorSubject<Story>;

  constructor(private http: HttpClient, private authors: AuthorsService) {
    this.all = new BehaviorSubject<any[]>([]);
    this.selected = new BehaviorSubject<any[]>([]);
    this.filtered = new BehaviorSubject<any[]>([]);
    this.currentlyViewed = new BehaviorSubject<Story>(null);
    this.update();
  }

  async update() {
    const stories: any = await this.http
      .get('assets/data-models/stories.json')
      .toPromise();
    this.all.next(stories);
    this.selected.next([]); // Reset, in case the current selection contains deleted items
    this.filtered.next([]); // Reset, in case the current selection contains deleted items
    this.currentlyViewed.next(null);
  }

  // Note that currently only point features are supported. TODO: extend this.
  getAllWithStation(pickedStation: Feature<Point>): Story[] {
    return this.all.getValue().filter(story => {
      return story.stations.find(station => {
        return pickedStation.id === station['@id'];
      });
    });
  }

  getByStoryId(id: string): Story {
    return this.all.getValue().find(story => story['@id'] === id);
  }

  getStorySequenceTypes(story: Story): SeqType[] {
    const sequenceTypes: SeqType[] = [];

    story.seq.forEach(seq => {
      sequenceTypes.push(seq['@type']);
    });

    return sequenceTypes;
  }

  storyContainsAudio(story: Story): boolean {
    let storyHasAudio = false;

    for (const seq of story.seq) {
      const isArticle = seq['@type'] === SeqType.Article;
      const seqHasAudio = 'audio' in seq;

      if (isArticle && seqHasAudio) {
        storyHasAudio = true;
        break;
      }
    }

    return storyHasAudio;
  }

  setCurrentlyViewedStory(storyViewed: Story) {
    this.currentlyViewed.next(storyViewed);
  }

  setSelectedStations(selectedStories: Story[]) {
    selectedStories = selectedStories.filter(story => !story.hidden);
    this.selected.next(selectedStories);

    // Filter selected stories on author
    const filteredStories = this.getFilteredStoriesByAuthorIds(
      selectedStories,
      this.authors.selected.getValue()
    );
    this.filtered.next(filteredStories);

    this.setCurrentlyViewedStory(selectedStories[0]);
  }

  updateSelectedStories() {
    this.setSelectedStations(this.selected.getValue());
  }

  private getFilteredStoriesByAuthorIds(
    selectedStories: Story[],
    selectedAuthors: Author[]
  ): Story[] {
    const selectedAuthorIds: string[] = selectedAuthors.map(author => {
      return author['@id'];
    });
    const isAuthorIdSelected = authorId =>
      selectedAuthorIds.includes(authorId['@id']);
    const isStorySelectedByAuthor = story =>
      story.authors.some(authorId => isAuthorIdSelected(authorId));
    return selectedStories.filter(isStorySelectedByAuthor);
  }

  selectAll() {
    this.setSelectedStations(this.all.getValue());
  }
}
