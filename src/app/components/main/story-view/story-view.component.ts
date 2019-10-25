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

  authors: any = true;
  stories: any = true;

  addAuthor() {
    // TODO: Pick manually
    const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const sampleAuthor = {
      name: 'Utrecht Archive',
      icon: 'business',
      color: 'secondary',
      id: randomId,
    };
    this.authors.push(sampleAuthor);
  }

  removeAuthor(authorId: Element) {
    // Find the author to remove
    this.authors.forEach(function(author, index, object) {
      if (author.id === authorId) {
        // Remove from author list
        object.splice(index, 1);
      }
    });
  }

  slideContentChanged() {
    console.log('Slide content change');
  }

  async loadAuthors() {
    const authors = await this.http
      .get('assets/data-models/authors.json')
      .toPromise();
    this.authors = authors;
    console.log(this.authors);
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
}
