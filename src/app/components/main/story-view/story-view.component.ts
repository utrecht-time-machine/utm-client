import { Component, OnInit, ViewChild } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AuthorsService } from '../../../services/authors.service';
import { StoriesService } from '../../../services/stories.service';
import { Router } from '@angular/router';
import { Story, SeqType } from '../../../models/story.model';

@Component({
  selector: 'utm-explore-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss'],
})
export class StoryViewComponent implements OnInit {
  @ViewChild('authorSelect', { static: true }) authorSelect: any;
  @ViewChild('contentSlider', { static: false }) contentSlider: any;

  contentSliderOptions = {
    initialSlide: 0,
    autoHeight: true,
  };

  authorSelectionOptions: any = {
    header: 'Authors',
  };

  constructor(
    public authors: AuthorsService,
    public stories: StoriesService,
    private route: Router,
    private iab: InAppBrowser
  ) {}

  ngOnInit() {}

  async slideChanged() {
    const storyIndex = await this.contentSlider.getActiveIndex();
    const story = this.stories.selected.value[storyIndex];
    this.stories.setCurrentlyViewedStory(story);
  }

  startStory(story: Story) {
    // TODO: Implement actual sequence logic here
    // For now, only load first sequence item
    const firstSeqItem = story.seq[0];
    if (firstSeqItem['@type'] === SeqType.Article) {
      this.route.navigate([
        '/article',
        { storyId: story['@id'], seqId: firstSeqItem['@id'] },
      ]);
    } else if (firstSeqItem['@type'] === SeqType.Dialogue) {
      this.route.navigate([
        '/dialogue',
        { storyId: story['@id'], seqId: firstSeqItem['@id'] },
      ]);
    } else if (firstSeqItem['@type'] === SeqType.External) {
      this.iab.create(firstSeqItem['content']);
    } else {
      console.error('Unsupported story type', firstSeqItem['@type']);
    }
  }

  openAuthorSelectionPopup() {
    this.authorSelect.open();
  }

  selectedAuthorsChanged(newAuthorIds: string[]) {
    this.authors.selectAuthors(newAuthorIds);
  }
}
