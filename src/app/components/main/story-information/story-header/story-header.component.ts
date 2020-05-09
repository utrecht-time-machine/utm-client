import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../../../models/story.model';

@Component({
  selector: 'utm-story-header',
  templateUrl: './story-header.component.html',
  styleUrls: ['./story-header.component.scss'],
})
export class StoryHeaderComponent implements OnInit {
  @Input() story: Story;
  @Input() centered: boolean;

  constructor() {}

  ngOnInit() {}
}
