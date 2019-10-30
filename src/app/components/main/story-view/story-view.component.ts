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
  @ViewChild('contentSlider', { static: false }) contentSlider: any;

  contentSliderOptions = {
    initialSlide: 0,
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

  async slideChanged() {
    const storyIndex = await this.contentSlider.getActiveIndex();
    const story = this.stories.selected.value[storyIndex];
    this.stories.setCurrentlyViewedStory(story);
  }

  startStory() {
    // TODO: Implement actual sequence logic here
    // TODO: Select the right url based on the content type here
    this.route.navigate([
      '/article',
      { story: this.stories.currentlyViewed.value.seq[0].content },
    ]);
  }

  openAuthorSelectionPopup() {
    this.authorSelect.open();
  }

  selectedAuthorsChanged(newAuthorIds: string[]) {
    this.authors.selectAuthors(newAuthorIds);
  }
}
