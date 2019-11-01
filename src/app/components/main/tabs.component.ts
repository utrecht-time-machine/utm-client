import { Component } from '@angular/core';
import { StoriesService } from '../../services/stories.service';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'utm-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss'],
})
export class TabsComponent {
  constructor(public stories: StoriesService, private mapService: MapService) {
    // If false, map service started its initialisation process
    // but did not complete it.
    if (this.mapService.isInit.getValue() === null) {
      this.mapService.init();
    }
  }
}
