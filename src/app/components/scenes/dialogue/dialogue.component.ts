import { Component, OnInit } from '@angular/core';
import { StoryPlayerService } from '../../../services/story-player.service';

@Component({
  selector: 'utm-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss'],
})
export class DialogueComponent implements OnInit {
  constructor(private storyPlayer: StoryPlayerService) {}

  ngOnInit() {}
}
