import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root',
})
export class WikidataService {
  constructor(private http: HttpClient) {}

  async requestByUrl(wikidataUrl: string) {
    const wikidataId = this.getIdByUrl(wikidataUrl);
    return this.request(wikidataId);
  }

  async request(wikidataId: string) {
    if (wikidataId === undefined) {
      return Promise.reject(new Error('Tried to query undefined Wikidata ID.'));
    }

    // Execute the server request
    const params = new HttpParams()
      .set('action', 'wbgetentities')
      .set('ids', wikidataId)
      .set('props', 'info|labels|descriptions|claims') // labels|descriptions|claims|sitelinks/urls etc.
      .set('languages', 'nl|en')
      .set('formatversion', '2')
      .set('format', 'json');
    const result = await this.http
      .get('https://www.wikidata.org/w/api.php', { params })
      .toPromise();

    // Check if the request returned an error
    if (Object.keys(result)[0] === 'error') {
      return Promise.reject(result);
    }

    // Parse response data
    const response = result['entities'][wikidataId];
    const imageFileName =
      response['claims']['P18'][0]['mainsnak']['datavalue']['value'];
    const imageUrl = this.getImageUrlByFilename(imageFileName);
    console.log(response);

    // TODO: Use Source Metadata model here (somehow does not import properly yet)
    const metadata = {
      name: response['labels']['en']['value'],
      author: undefined, // TODO: Find the name of the person that has last revised the article
      description: response['descriptions']['en']['value'],
      date: Date.parse(response['modified']),
      imageUrl: imageUrl,
    };
    console.log(metadata);
    return Promise.resolve(metadata);
  }

  private getIdByUrl(url: string): string {
    // TODO: Ensure this is a valid wikidata URL
    // TODO: Properly extract the ID from the URL
    return url.replace('https://www.wikidata.org/wiki/', '');
  }

  private getImageUrlByFilename(fileName: string): string {
    // Replace spaces by underscores
    fileName = fileName.replace(/ /g, '_');

    // Use MD5 hash to find the image URL
    const md5 = Md5.hashStr(fileName);
    return (
      'https://upload.wikimedia.org/wikipedia/commons/'
      + md5[0]
      + '/'
      + md5[0]
      + md5[1]
      + '/'
      + fileName
    );
  }
}
