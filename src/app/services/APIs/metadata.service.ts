import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WikidataService } from './wikidata.service';
import { WikipediaService } from './wikipedia.service';
import { UtrechtArchivesService } from './utrechtarchives.service';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  constructor(
    private http: HttpClient,
    private wikidataService: WikidataService,
    private wikipediaService: WikipediaService,
    private utrechtArchivesService: UtrechtArchivesService
  ) {}

  async getMetadata(url: string) {
    // TODO: Is there a library that gets the domain of the URL?
    // PSL (Public Suffix List) package?
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    const domain = matches && matches[1];

    // TODO: Properly on the domain here
    if (domain.includes('wikidata')) {
      return this.wikidataService.requestByUrl(url);
    } else if (domain.includes('wikipedia')) {
      return this.wikipediaService.requestByUrl(url);
    } else if (domain.includes('hetutrechtsarchief')) {
      return this.utrechtArchivesService.requestByUrl(url);
    } else {
      const rejectionError =
        'Could not match domain ' + domain + ' with any known domains.';
      return Promise.reject(rejectionError);
    }
  }
}
