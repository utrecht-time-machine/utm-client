import { Component } from '@angular/core';
import { StoriesService } from '../../services/stories.service';

@Component({
  selector: 'utm-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss'],
})
export class TabsComponent {
  constructor(public stories: StoriesService) {}
}
