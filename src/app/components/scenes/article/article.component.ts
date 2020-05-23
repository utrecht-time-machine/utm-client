import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ArticleSeq } from '../../../models/story.model';
import { StoriesService } from '../../../services/stories.service';
import { trimStoryId } from '../../../helpers/string.helper';
import { skipWhile } from 'rxjs/operators';
import { SourcesFromHtmlService } from '../../../services/sources-from-html.service';
import { MarkdownService, MarkedRenderer } from 'ngx-markdown';
import { DeviceDetectorService } from 'ngx-device-detector';

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
    private vc: ViewContainerRef,
    public device: DeviceDetectorService
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

  private compileMarkdownToHtml(markdownFileContent: string): string {
    const compiledHtml = this.markdownService.compile(markdownFileContent);

    const htmlParser = new DOMParser();
    const parsedHtml: Document = htmlParser.parseFromString(
      compiledHtml,
      'text/html'
    );

    // Make sure we also compile images and other markdown elements inside the source tags
    const sourceTags = parsedHtml.getElementsByTagName(
      this.sourcesFromHtml.getSourceTag()
    );
    for (
      let sourceTagIdx = 0;
      sourceTagIdx < sourceTags.length;
      sourceTagIdx++
    ) {
      const sourceTag = sourceTags[sourceTagIdx];

      // Create custom markdown renderer to prevent the generation of redundant p tags inside the source tags
      const renderer = new MarkedRenderer();
      renderer.paragraph = (text: string) => {
        return text;
      };

      // Compile HTML inside the source tag
      sourceTag.innerHTML = this.markdownService.compile(
        sourceTag.innerHTML,
        false,
        {
          renderer: renderer,
        }
      );
    }

    return parsedHtml.getElementsByTagName('body')[0].innerHTML;
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
        const markdownFileContent = await this.http
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
        const compiledHtml = this.compileMarkdownToHtml(markdownFileContent);

        // Render HTML with sources
        await this.sourcesFromHtml.renderHtmlWithSources(
          this.renderer,
          this.articleContentElRef,
          this.vc,
          compiledHtml
        );
      });
  }
}
