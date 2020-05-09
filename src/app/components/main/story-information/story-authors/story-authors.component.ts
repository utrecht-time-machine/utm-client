import { Component, Input, OnInit } from '@angular/core';
import { AuthorsService } from '../../../../services/authors.service';
import { AuthorId } from '../../../../models/author.model';

@Component({
  selector: 'utm-story-authors',
  templateUrl: './story-authors.component.html',
  styleUrls: ['./story-authors.component.scss'],
})
export class StoryAuthorsComponent implements OnInit {
  @Input() authorIds: AuthorId[];

  constructor(public authors: AuthorsService) {}

  ngOnInit() {}
}
