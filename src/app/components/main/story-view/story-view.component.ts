import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthorsService } from '../../../services/authors.service';
import { StoriesService } from '../../../services/stories.service';
import { Router } from '@angular/router';
import { SeqType, Story, TimeSliderSeq } from '../../../models/story.model';
import { Plugins } from '@capacitor/core';
import { TimePeriod } from '../../../models/time-period.model';
import { TimePeriodService } from '../../../services/time-period.service';
import { TagsService } from '../../../services/tags.service';

const { Browser } = Plugins;

@Component({
  selector: 'utm-explore-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss'],
})
export class StoryViewComponent implements OnInit {
  @ViewChild('authorSelect', { static: true }) authorSelect: any;
  @ViewChild('contentSlider', { static: false }) contentSlider: any;

  public SeqType = SeqType;

  contentSliderOptions = {
    initialSlide: 0,
  };

  authorSelectionOptions: any = {
    header: 'Authors',
  };

  constructor(
    public authors: AuthorsService,
    public stories: StoriesService,
    public tags: TagsService,
    public timePeriod: TimePeriodService,
    private route: Router
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
    switch (firstSeqItem['@type']) {
      case SeqType.Article:
        this.route.navigate([
          '/article',
          { storyId: story['@id'], seqId: firstSeqItem['@id'] },
        ]);
        break;
      case SeqType.Dialogue:
        this.route.navigate([
          '/dialogue',
          { storyId: story['@id'], seqId: firstSeqItem['@id'] },
        ]);
        break;
      case SeqType.External:
        Browser.open({ url: firstSeqItem['content'] });
        break;
      case SeqType.TimeSlider:
        this.route.navigate([
          '/timeslider',
          { storyId: story['@id'], seqId: firstSeqItem['@id'] },
        ]);
        break;
      default:
        console.error('Unsupported story type', firstSeqItem['@type']);
        break;
    }
  }

  openAuthorSelectionPopup() {
    this.authorSelect.open();
  }

  onSelectedAuthorsChanged($event) {
    const newAuthorIds: string[] = $event.target.value;
    this.authors.selectAuthors(newAuthorIds);
  }

  onTimeRangeChanged($event) {
    const newTimePeriodYears: { lower: number; upper: number } =
      $event.target.value;
    const startYear: string = newTimePeriodYears.lower.toString();
    const endYear: string = newTimePeriodYears.upper.toString();

    this.timePeriod.filterRange.next({
      start: new Date(startYear),
      end: new Date(endYear),
    });
  }
}
