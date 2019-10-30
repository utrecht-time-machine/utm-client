import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AuthorsService } from '../../../services/authors.service';
import { StoriesService } from '../../../services/stories.service';
import { Router } from '@angular/router';

@Component({
  selector: 'utm-explore-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss'],
})
export class StoryViewComponent implements OnInit {
  @ViewChild('authorSelect', { static: true }) authorSelect: any;

  contentSliderOptions = {
    initialSlide: 0,
    speed: 400,
    autoHeight: true,
  };

  authorSelectionOptions: any = {
    header: 'Authors',
  };

  constructor(
    public authors: AuthorsService,
    public stories: StoriesService,
    private route: Router
  ) {}

  ngOnInit() {}

  startStory() {
    this.route.navigate(['/article', { story: 'neude_thinker-on-a-rock' }]);
  }

  openAuthorSelectionPopup() {
    this.authorSelect.open();
  }

  selectedAuthorsChanged(newAuthorIds: string[]) {
    this.authors.selectAuthors(newAuthorIds);
  }
}
