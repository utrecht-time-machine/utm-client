import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Md5 } from 'ts-md5';
import { SourceMetadata } from '../../models/source-metadata.model';
import { WikiService } from './wiki.service';

@Injectable({
  providedIn: 'root',
})
export class WikidataService {
  constructor(private http: HttpClient, private wikiService: WikiService) {}

  async requestByUrl(wikidataUrl: string): Promise<SourceMetadata> {
    const wikidataId = this.getIdByUrl(wikidataUrl);
    return this.request(wikidataId);
  }

  async request(wikidataId: string): Promise<SourceMetadata> {
    if (wikidataId === undefined) {
      return Promise.reject(new Error('Tried to query undefined Wikidata ID.'));
    }

    const result = await this.requestEntityData(wikidataId);

    // Check if the request returned an error
    if (Object.keys(result)[0] === 'error') {
      return Promise.reject(result);
    }

    // Parse response data
    const response = result.entities ? result.entities[wikidataId] : undefined;
    const imageFileName = response.claims.P18
      ? response.claims.P18[0].mainsnak.datavalue.value
      : undefined;

    const metadata: SourceMetadata = {
      name: response.labels.en.value,
      author: undefined, // TODO: Find the name of the person that has last revised the article, though this might not be available on wikidata
      description: response.descriptions.en.value,
      // date: new Date(response['modified']),
      imageUrl: imageFileName
        ? this.wikiService.getImageUrlByFilename(imageFileName)
        : undefined,
    };
    return Promise.resolve(metadata);
  }

  private requestEntityData(wikidataId: string): Promise<any> {
    const params = new HttpParams()
      .set('action', 'wbgetentities')
      .set('ids', wikidataId)
      .set('props', 'info|labels|descriptions|claims') // labels|descriptions|claims|sitelinks/urls etc.
      .set('languages', 'nl|en')
      .set('formatversion', '2')
      .set('format', 'json')
      .set('origin', '*');

    return this.http
      .get('https://www.wikidata.org/w/api.php', { params })
      .toPromise();
  }

  private getIdByUrl(url: string): string {
    // TODO: Ensure this is a valid wikidata URL
    // TODO: Properly extract the ID from the URL
    return url.replace('https://www.wikidata.org/wiki/', '');
  }
}
