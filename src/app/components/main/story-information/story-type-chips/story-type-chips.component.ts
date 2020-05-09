import { Component, Input, OnInit } from '@angular/core';
import { StoriesService } from '../../../../services/stories.service';
import { SeqType, Story } from 'src/app/models/story.model';

@Component({
  selector: 'utm-story-type-chips',
  templateUrl: './story-type-chips.component.html',
  styleUrls: ['./story-type-chips.component.scss'],
})
export class StoryTypeChipsComponent implements OnInit {
  public SeqType = SeqType;
  @Input() story: Story;

  constructor(public stories: StoriesService) {}

  ngOnInit() {}
}
