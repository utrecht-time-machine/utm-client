import {
  Component,
  ContentChildren,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ArticleSeq } from '../../../models/story.model';
import { StoriesService } from '../../../services/stories.service';
import { trimStoryId } from '../../../helpers/string.helper';
import { skipWhile } from 'rxjs/operators';
import { SourcesFromHtmlService } from '../../../services/sources-from-html.service';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'utm-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {
  @ViewChild('articleContent', { static: false })
  articleContentElRef: ElementRef;

  markdown = 'Loading Article...';

  storyId: string;
  seqId: string;
  seq: ArticleSeq;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private location: Location,
    private stories: StoriesService,
    private markdownService: MarkdownService,
    private sourcesFromHtml: SourcesFromHtmlService,
    private renderer: Renderer2,
    private vc: ViewContainerRef
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
        // Retrieve story article
        const myStory = this.stories.getByStoryId(this.storyId);
        this.seq = myStory.seq.find(seq => {
          return seq['@id'] === this.seqId;
        }) as ArticleSeq;

        // Retrieve markdown file for this story
        const markdownFile = await this.http
          .get(
            `assets/data-models/stories/${trimStoryId(myStory['@id'])}/${
              this.seq.content
            }.md`,
            {
              responseType: 'text',
            }
          )
          .toPromise();

        // Compile the markdown to HTML
        const compiledHtml = this.markdownService.compile(markdownFile);

        // Render HTML with sources
        this.sourcesFromHtml.renderHtmlWithSources(
          this.renderer,
          this.articleContentElRef,
          this.vc,
          compiledHtml
        );
      });
  }
}
