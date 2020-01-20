import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TimeSliderDirective } from './time-slider.directive';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { skipWhile } from 'rxjs/operators';
import { DialogueSeq, TimeSliderSeq } from '../../../models/story.model';
import { YarnItem } from '../../../models/yarn-item.model';
import { StoriesService } from '../../../services/stories.service';

@Component({
  selector: 'utm-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.scss'],
})
export class TimeSliderComponent implements OnInit, AfterViewInit {
  @ViewChild(TimeSliderDirective, { static: false })
  timeSliderDirective: TimeSliderDirective;

  storyId: string;
  seqId: string;
  seq: TimeSliderSeq;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private stories: StoriesService
  ) {}

  ngOnInit() {}

  async loadImages(): Promise<void> {
    return new Promise(resolve => {
      // check if stories are already loaded; if not, await
      this.stories.all
        .pipe(skipWhile(val => val.length < 1))
        .subscribe(async () => {
          const myStory = this.stories.getByStoryId(this.storyId);
          this.seq = myStory.seq.find(seq => {
            return seq['@id'] === this.seqId;
          }) as TimeSliderSeq;

          this.timeSliderDirective.historicalImageUrl = this.seq.historicalImageUrl;
          this.timeSliderDirective.presentImageUrl = this.seq.presentImageUrl;
          this.timeSliderDirective.updateImages();

          resolve();
        });
    });
  }

  ngAfterViewInit(): void {
    this.storyId = this.route.snapshot.paramMap.get('storyId');
    this.seqId = this.route.snapshot.paramMap.get('seqId');

    // Make sure story URL is set
    if (!this.storyId || !this.seqId) {
      // TODO: add toast with error
      this.location.back();
      return;
    }

    this.loadImages();
  }
}
