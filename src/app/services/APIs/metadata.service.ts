import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WikidataService } from './wikidata.service';
import { WikipediaService } from './wikipedia.service';
import { UtrechtArchivesService } from './utrechtarchives.service';
import { SourceMetadata } from '../../models/source-metadata.model';
import { OpenCultuurDataService } from './open-cultuur-data.service';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  constructor(
    private http: HttpClient,
    private wikidataService: WikidataService,
    private wikipediaService: WikipediaService,
    private utrechtArchivesService: UtrechtArchivesService,
    private openCultuurDataService: OpenCultuurDataService
  ) {}

  private async getOpenGraphMetadata(url: string): Promise<SourceMetadata> {
    // Retrieve page content
    const pageHtml = await this.http
      .get('https://cors-anywhere.herokuapp.com/' + url, {
        responseType: 'text',
      })
      .toPromise()
      .catch(err => {
        return Promise.reject(
          'Could not retrieve a page with this URL: ' + url
        );
      });

    // Parse page as HTML
    const httpParser = new DOMParser();
    const parsedResponse: Document = httpParser.parseFromString(
      pageHtml,
      'text/html'
    );

    // Find the meta tags
    const metaTags = parsedResponse.getElementsByTagName('meta');

    // Parse to the correct format
    let title: string, description: string, imageUrl: string;
    for (let metaTagIdx = 0; metaTagIdx < metaTags.length; metaTagIdx++) {
      const metaTag = metaTags[metaTagIdx];
      const metaProperty = metaTag.getAttribute('property');

      if (metaTag.name === 'og:title' || metaProperty === 'og:title') {
        title = metaTag.content;
      }
      if (
        metaTag.name === 'og:description'
        || metaProperty === 'og:description'
      ) {
        description = metaTag.content;
      }
      if (metaTag.name === 'og:image' || metaProperty === 'og:image') {
        imageUrl = metaTag.content;
      }
    }

    const metadata: SourceMetadata = {
      name: title,
      description: description,
      imageUrl: imageUrl,
    };

    return Promise.resolve(metadata);
  }

  async getMetadata(url: string) {
    // TODO: Is there a library that gets the domain of the URL?
    // PSL (Public Suffix List) package?
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    const domain = matches && matches[1];

    // TODO: Properly match on the domain here
    if (domain.includes('wikidata')) {
      return await this.wikidataService
        .requestByUrl(url)
        .catch(err => this.getOpenGraphMetadata(url));
    } else if (domain.includes('wikipedia')) {
      return await this.wikipediaService
        .requestByUrl(url)
        .catch(err => this.getOpenGraphMetadata(url));
    } else if (domain.includes('hetutrechtsarchief')) {
      return await this.utrechtArchivesService
        .requestByUrl(url)
        .catch(err => this.getOpenGraphMetadata(url));
    } else {
      // console.warn('Could not match domain ' + domain + ' with any known domains.');

      // Not a known domain, try to find OpenGraph metadata
      const ogMetadata = await this.getOpenGraphMetadata(url);
      return Promise.resolve(ogMetadata);
    }
  }
}
