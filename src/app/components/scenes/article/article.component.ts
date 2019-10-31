import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ArticleSeq } from '../../../models/story.model';
import { StoriesService } from '../../../services/stories.service';
import { trimStoryId } from '../../../helpers/string.helper';
import { skipWhile } from 'rxjs/operators';

@Component({
  selector: 'utm-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {
  markdown = 'Loading Article...';

  storyId: string;
  seqId: string;
  seq: ArticleSeq;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location,
    private stories: StoriesService
  ) {}

  ngOnInit() {
    this.storyId = this.route.snapshot.paramMap.get('storyId');
    this.seqId = this.route.snapshot.paramMap.get('seqId');

    // Make sure story URL is set
    if (!this.storyId || !this.seqId) {
      // TODO: add toast with error
      this.location.back();
      return;
    }

    this.loadArticle();
  }

  loadArticle() {
    // check if stories are already loaded; if not, await
    this.stories.all
      .pipe(skipWhile(val => val.length < 1))
      .subscribe(async () => {
        const myStory = this.stories.getByStoryId(this.storyId);
        this.seq = myStory.seq.find(seq => {
          return seq['@id'] === this.seqId;
        }) as ArticleSeq;

        this.markdown = await this.http
          .get(
            `assets/data-models/stories/${trimStoryId(myStory['@id'])}/${
              this.seq.content
            }.md`,
            {
              responseType: 'text',
            }
          )
          .toPromise();
      });
  }
}
