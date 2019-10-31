import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Story } from '../models/story.model';
import { Feature, Point } from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class StoriesService {
  all: BehaviorSubject<Story[]>;
  selected: BehaviorSubject<Story[]>;
  currentlyViewed: BehaviorSubject<Story>;

  constructor(private http: HttpClient) {
    this.all = new BehaviorSubject<any[]>([]);
    this.selected = new BehaviorSubject<any[]>([]);
    this.currentlyViewed = new BehaviorSubject<Story>(null);
    this.update();
  }

  async update() {
    const stories: any = await this.http
      .get('assets/data-models/stories.json')
      .toPromise();
    this.all.next(stories);
    this.selected.next([]); // Reset, in case the current selection contains deleted items
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

  setCurrentlyViewedStory(storyViewed: Story) {
    this.currentlyViewed.next(storyViewed);
  }

  setSelectedStations(selectedStories: Story[]) {
    this.selected.next(selectedStories);
  }

  selectAll() {
    this.selected.next(this.all.getValue());
  }
}
