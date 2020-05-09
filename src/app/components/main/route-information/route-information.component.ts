import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../../../services/routes.service';
import { StoriesService } from '../../../services/stories.service';
import { SeqType, Story } from '../../../models/story.model';
import { TagsService } from '../../../services/tags.service';
import { AuthorsService } from '../../../services/authors.service';

@Component({
  selector: 'utm-route-information',
  templateUrl: './route-information.component.html',
  styleUrls: ['./route-information.component.scss'],
})
export class RouteInformationComponent implements OnInit {
  story: Story;

  public SeqType = SeqType;

  constructor(
    public routes: RoutesService,
    public stories: StoriesService,
    public tags: TagsService,
    public authors: AuthorsService
  ) {}

  ngOnInit() {
    this.routes.selectedStoryIdx.subscribe(selectedStoryIdx => {
      this.story = this.routes.getSelectedStory();
    });
  }

  onPrevPage() {
    this.routes.selectPrevStory();
  }

  onNextPage() {
    this.routes.selectNextStory();
  }

  onSelectFirstPage() {
    this.routes.selectFirstStory();
  }

  onSelectLastPage() {
    this.routes.selectLastStory();
  }
}
