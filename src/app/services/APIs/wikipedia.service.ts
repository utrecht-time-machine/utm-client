import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SourceMetadata } from '../../models/source-metadata.model';
import { WikiService } from './wiki.service';

@Injectable({
  providedIn: 'root',
})
export class WikipediaService {
  constructor(private http: HttpClient, private wikiService: WikiService) {}

  async requestByUrl(wikipediaUrl: string) {
    const wikipediaTitle = this.getTitleByUrl(wikipediaUrl);
    const language = this.getLanguageByUrl(wikipediaUrl);

    return this.request(wikipediaTitle, language);
  }

  async request(wikipediaTitle: string, language: string) {
    if (wikipediaTitle === undefined) {
      return Promise.reject(
        new Error('Tried to query undefined Wikipedia name.')
      );
    }

    // Parse response
    const result = await this.requestData(wikipediaTitle, language);
    let response = result;
    if (response['continue'] || response['batchcomplete']) {
      response = response['query'];
    }
    response = response['pages'] ? response['pages'][0] : undefined;
    if (!response) {
      return Promise.reject(`Could not parse data for ${wikipediaTitle}`);
    }

    const imageFileName = response.pageprops.page_image_free;
    const revisionDate = response.revisions[0].timestamp; // TODO: Check if the first revision is always the latest

    const metadata: SourceMetadata = {
      name: response.title,
      author: response.revisions[0].user,
      description: response.description,
      date: new Date(revisionDate),
      imageUrl: imageFileName
        ? this.wikiService.getImageUrlByFilename(imageFileName)
        : undefined,
    };

    return Promise.resolve(metadata);
  }

  private requestData(wikipediaTitle: string, language: string): Promise<any> {
    const params = new HttpParams()
      .set('action', 'query')
      .set(
        'prop',
        'categories|revisions|description|pageprops|images|contributors'
      )
      .set('titles', wikipediaTitle)
      .set('formatversion', '2')
      .set('format', 'json')
      .set('origin', '*');

    return this.http
      .get(`https://${language}.wikipedia.org/w/api.php`, { params })
      .toPromise();
  }

  private getTitleByUrl(wikipediaUrl: string): string {
    // TODO: Ensure this is a valid wikipedia URL
    // TODO: Properly extract the name from the URL
    wikipediaUrl = wikipediaUrl.replace('https://en.wikipedia.org/wiki/', '');
    wikipediaUrl = wikipediaUrl.replace('https://nl.wikipedia.org/wiki/', '');
    return wikipediaUrl;
  }

  private getLanguageByUrl(wikipediaUrl: string): string {
    // TODO: Ensure this is a valid wikipedia URL
    // TODO: Properly extract the language from the URL
    return wikipediaUrl.substr(8, 2);
  }
}
