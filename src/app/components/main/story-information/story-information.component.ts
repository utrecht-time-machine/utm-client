import { Component, Input, OnInit } from '@angular/core';
import { SeqType, Story } from '../../../models/story.model';
import { StoriesService } from '../../../services/stories.service';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'utm-story-information',
  templateUrl: './story-information.component.html',
  styleUrls: ['./story-information.component.scss'],
})
export class StoryInformationComponent implements OnInit {
  @Input() story: Story;
  hidden = true;

  constructor(
    public stories: StoriesService,
    public platform: Platform,
    public router: Router
  ) {}

  ngOnInit() {}

  toggleHidden() {
    this.hidden = !this.hidden;
  }

  startStory(story: Story) {
    // TODO: Implement actual sequence logic here
    // For now, only load first sequence item
    const firstSeqItem = story.seq[0];
    switch (firstSeqItem['@type']) {
      case SeqType.Article:
        this.router.navigate([
          '/article',
          { storyId: story['@id'], seqId: firstSeqItem['@id'] },
        ]);
        break;
      case SeqType.Dialogue:
        this.router.navigate([
          '/dialogue',
          { storyId: story['@id'], seqId: firstSeqItem['@id'] },
        ]);
        break;
      case SeqType.External:
        Browser.open({ url: firstSeqItem['content'] });
        break;
      case SeqType.TimeSlider:
        this.router.navigate([
          '/timeslider',
          { storyId: story['@id'], seqId: firstSeqItem['@id'] },
        ]);
        break;
      default:
        console.error('Unsupported story type', firstSeqItem['@type']);
        break;
    }
  }

  getHeightStoryInformation() {
    if (this.platform.is('mobile')) {
      return 250;
    }
    return 400;
  }
}
