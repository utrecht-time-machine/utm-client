import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'utm-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {
  markdown = `Loading Markdown...`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadArticle();
  }

  async loadArticle() {
    // Retrieve a sample story
    const data = await this.http
      .get('assets/data-models/story.json')
      .toPromise();
    // Update the current markdown code for this article
    this.markdown = data['seq'][0]['content'];
  }
}
