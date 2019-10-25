import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  allAuthors: any = true;
  selectedAuthors: any = true;
  stories: any = true;

  slideContentChanged() {
    console.log('Slide content change');
  }

  async loadAuthors() {
    const authors = await this.http
      .get('assets/data-models/authors.json')
      .toPromise();
    this.allAuthors = authors;
    this.selectedAuthors = authors;
    console.log(this.allAuthors);
  }

  async loadStories() {
    const story = await this.http
      .get('assets/data-models/story.json')
      .toPromise();
    this.stories = [story, story, story];
    console.log(this.stories);
  }

  ngOnInit() {}

  constructor(private http: HttpClient) {
    this.loadAuthors();
    this.loadStories();
  }

  selectedAuthorsChanged(newAuthorIds) {
    // Clear the selected authors
    this.selectedAuthors = [];

    this.allAuthors.forEach(function(author) {
      // For each newly selected id...
      if (newAuthorIds.includes(author['@id'])) {
        // ... Add it to the list of selected authors
        this.selectedAuthors.push(author);
      }
    }, this);
  }
}
