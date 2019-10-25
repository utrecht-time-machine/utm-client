import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AuthorsService } from '../../../services/authors.service';
import { StoriesService } from '../../../services/stories.service';

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

  constructor(public authors: AuthorsService, public stories: StoriesService) {}

  ngOnInit() {}

  selectedAuthorsChanged(newAuthorIds: string[]) {
    this.authors.selectAuthors(newAuthorIds);
  }
}
