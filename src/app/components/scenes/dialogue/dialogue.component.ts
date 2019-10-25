import { Component, OnInit } from '@angular/core';
import {
  StoryNode,
  StoryPlayerService,
} from '../../../services/story-player.service';
import { Router } from '@angular/router';

@Component({
  selector: 'utm-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss'],
})
export class DialogueComponent implements OnInit {
  storyScene: StoryNode;

  constructor(
    private storyPlayer: StoryPlayerService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storyPlayer.load('./assets/data-models/dialogue_test.json');
    this.storyScene = this.storyPlayer.next();
  }

  next(storyId: string) {
    this.storyScene = this.storyPlayer.next(storyId);
  }

  returnToStories() {
    this.router.navigate(['story']);
  }
}
