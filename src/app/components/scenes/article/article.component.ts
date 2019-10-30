import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'utm-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {
  markdown = `Loading Article...`;
  storyUrl = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.storyUrl = this.route.snapshot.paramMap.get('story');

    // Make sure story URL is set
    if (this.storyUrl != null) {
      this.loadArticle();
    }
  }

  async loadArticle() {
    // Retrieve a sample story
    // TODO: Check if this has serious security consequences
    const markdown = await this.http
      .get('assets/data-models/stories/' + this.storyUrl + '.md', {
        responseType: 'text',
      })
      .toPromise();

    // Update the current markdown code for this article
    this.markdown = markdown;
  }
}
