import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {
  StoryNode,
  StoryPlayerService,
} from '../../../services/story-player.service';
import { ActivatedRoute, Router } from '@angular/router';
import { skipWhile } from 'rxjs/operators';
import { DialogueSeq } from '../../../models/story.model';
import { StoriesService } from '../../../services/stories.service';
import { Location } from '@angular/common';

@Component({
  selector: 'utm-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss'],
})
export class DialogueComponent implements OnInit {
  storyScene: StoryNode;

  storyId: string;
  seqId: string;
  seq: DialogueSeq;

  constructor(
    private storyPlayer: StoryPlayerService,
    private router: Router,
    private stories: StoriesService,
    private route: ActivatedRoute,
    private location: Location,
    private renderer: Renderer2,
    private host: ElementRef
  ) {}

  async ngOnInit() {
    this.storyId = this.route.snapshot.paramMap.get('storyId');
    this.seqId = this.route.snapshot.paramMap.get('seqId');

    // Make sure story URL is set
    if (!this.storyId || !this.seqId) {
      // TODO: add toast with error
      this.location.back();
      return;
    }

    await this.loadDialogue();
    this.setStyling();

    this.storyScene = this.storyPlayer.next();
  }

  async loadDialogue(): Promise<void> {
    return new Promise(resolve => {
      // check if stories are already loaded; if not, await
      this.stories.all
        .pipe(skipWhile(val => val.length < 1))
        .subscribe(async () => {
          const myStory = this.stories.getByStoryId(this.storyId);
          this.seq = myStory.seq.find(seq => {
            return seq['@id'] === this.seqId;
          }) as DialogueSeq;

          this.storyPlayer.load(this.seq.yarn);
          resolve();
        });
    });
  }

  next(storyId: string) {
    this.storyScene = this.storyPlayer.next(storyId);
  }

  returnToStories() {
    this.router.navigate(['story']);
  }

  setStyling() {
    // TODO; do through Renderer, which declined my request; probably due to sanitation policy
    if (this.seq['color-scheme']) {
      this.host.nativeElement.style.setProperty(
        '--dialogue-scene-bg',
        `var(--ion-color-${this.seq['color-scheme']})`
      );
      this.host.nativeElement.style.setProperty(
        '--dialogue-scene-bg-contrast',
        `var(--ion-color-${this.seq['color-scheme']}-contrast)`
      );
    }

    if (this.seq.background.image) {
      this.host.nativeElement.style.setProperty(
        '--dialogue-scene-bg-image',
        `url(${this.seq.background.image}`
      );
    }
  }
}
