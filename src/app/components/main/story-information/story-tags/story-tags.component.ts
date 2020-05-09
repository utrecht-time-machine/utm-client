import { Component, Input, OnInit } from '@angular/core';
import { TagsService } from '../../../../services/tags.service';
import { TagId } from '../../../../models/tag.model';

@Component({
  selector: 'utm-story-tags',
  templateUrl: './story-tags.component.html',
  styleUrls: ['./story-tags.component.scss'],
})
export class StoryTagsComponent implements OnInit {
  @Input() tagIds: TagId[];

  constructor(public tags: TagsService) {}

  ngOnInit() {}
}
