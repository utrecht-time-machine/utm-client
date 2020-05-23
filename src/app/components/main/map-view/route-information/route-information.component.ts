import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../../../../services/routes.service';
import { StoriesService } from '../../../../services/stories.service';
import { SeqType, Story } from '../../../../models/story.model';
import { TagsService } from '../../../../services/tags.service';
import { AuthorsService } from '../../../../services/authors.service';
import { MapInfoUIService } from '../../../../services/map-info-ui.service';

@Component({
  selector: 'utm-route-information',
  templateUrl: './route-information.component.html',
  styleUrls: ['./route-information.component.scss'],
})
export class RouteInformationComponent implements OnInit {
  story: Story;

  constructor(
    public routes: RoutesService,
    public mapInfoUI: MapInfoUIService
  ) {}

  ngOnInit() {
    this.routes.all.subscribe(_ => {
      this.story = this.routes.getSelectedStory();
    });
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
