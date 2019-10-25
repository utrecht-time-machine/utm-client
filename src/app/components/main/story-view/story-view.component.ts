import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'utm-explore-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss'],
})
export class StoryViewComponent implements OnInit {
  contentSliderOptions = {
    initialSlide: 0,
    speed: 400,
    autoHeight: true,
  };

  authorSelectionOptions: any = {
    header: 'Authors',
  };

  allAuthors: BehaviorSubject<any[]>;
  selectedAuthors: BehaviorSubject<any[]>;
  stories: BehaviorSubject<any[]>;

  slideContentChanged() {
    console.log('Slide content change');
  }

  async loadAuthors() {
    const authors: any = await this.http
      .get('assets/data-models/authors.json')
      .toPromise();
    this.allAuthors.next(authors);
    this.selectedAuthors.next(authors);
  }

  async loadStories() {
    const story = await this.http
      .get('assets/data-models/story.json')
      .toPromise();
    this.stories.next([story, story, story]);
  }

  ngOnInit() {}

  constructor(private http: HttpClient) {
    this.allAuthors = new BehaviorSubject<any[]>([]);
    this.selectedAuthors = new BehaviorSubject<any[]>([]);
    this.stories = new BehaviorSubject<any[]>([]);

    this.loadAuthors();
    this.loadStories();
  }

  selectedAuthorsChanged(newAuthorIds) {
    const authors = this.allAuthors.getValue();

    authors.forEach(author => {
      // For each newly selected id...
      if (newAuthorIds.includes(author['@id'])) {
        // ... Add it to the list of selected authors
        authors.push(author);
      }
    });
    this.selectedAuthors.next(authors);
  }
}
