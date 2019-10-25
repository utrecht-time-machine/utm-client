import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StoriesService {
  all: BehaviorSubject<any[]>;
  selected: BehaviorSubject<any[]>;

  constructor(private http: HttpClient) {
    this.all = new BehaviorSubject<any[]>([]);
    this.selected = new BehaviorSubject<any[]>([]);
    this.update();
  }

  async update() {
    const stories: any = await this.http
      .get('assets/data-models/story.json')
      .toPromise();
    this.all.next(stories);
    this.selected.next([stories[0], stories[0], stories[0]]); // TODO: Replace later with proper functionality
  }
}
