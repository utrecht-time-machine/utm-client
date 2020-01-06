import { Injectable } from '@angular/core';
import { SourceMetadata } from '../../models/source-metadata.model';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UtrechtArchivesService {
  apiKey = 'b29fb3e4-5302-11e6-8975-2b551e9b96f4';

  constructor(private http: HttpClient) {}

  async requestByUrl(archiveUrl: string): Promise<SourceMetadata> {
    const archiveGuid = this.getGuidByUrl(archiveUrl);

    if (archiveGuid === undefined) {
      //  || archiveGuid.length !== 32
      return Promise.reject('Tried to query invalid Utrecht Archives GUID.');
    }

    const metadata = await this.getMetadata(archiveGuid, archiveUrl);

    return Promise.resolve(metadata);
  }

  private parseBeeldbankMetadata(response): SourceMetadata {
    // Parse metadata
    const responseMetadata = response.media[0].metadata;
    let description: string,
      creator: string,
      earliestDate: Date,
      latestDate: Date;
    for (let i = 0; i < responseMetadata.length; i++) {
      const field = responseMetadata[i].field;
      const value = responseMetadata[i].value;
      if (field === 'beschrijving') {
        description = value;
      }
      if (field === 'vervaardiger') {
        creator = value;
      }
      if (field === 'datering_vroegst') {
        earliestDate = this.getDateFromDutchDate(value);
      }
      if (field === 'datering_laatst') {
        latestDate = this.getDateFromDutchDate(value);
      }
    }

    const metadata: SourceMetadata = {
      creator: creator,
      description: description,
      earliestDate: earliestDate,
      latestDate: latestDate,
    };

    return metadata;
  }

  private parseGeneralMetadata(resopnse): SourceMetadata {
    // Parse page as HTML
    const httpParser = new DOMParser();
    const parsedResponse: Document = httpParser.parseFromString(
      resopnse,
      'text/html'
    );

    // Find the meta tags
    const metaTags = parsedResponse.getElementsByTagName('meta');

    let title: string, description: string;
    for (let metaTagIdx = 0; metaTagIdx < metaTags.length; metaTagIdx++) {
      const metaTag = metaTags[metaTagIdx];
      if (metaTag.name === 'og:title') {
        title = metaTag.content;
      }
      if (metaTag.name === 'og:description') {
        description = metaTag.content;
      }
    }

    const metadata: SourceMetadata = {
      name: title,
      description: description,
    };

    return metadata;
  }

  private getDateFromDutchDate(dutchDate): Date {
    const dateParts = dutchDate.split('-');
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  }

  private async getMetadata(
    archiveGuid: string,
    originalUrl: string
  ): Promise<any> {
    const params = new HttpParams();
    const headers = new HttpHeaders();

    if (archiveGuid !== originalUrl) {
      // Beeldbank
      const beeldbankResponse = await this.http
        .get(
          `https://webservices.picturae.com/mediabank/media/${archiveGuid}?apiKey=${this.apiKey}`,
          { params }
        )
        .toPromise()
        .catch(err => {
          // console.warn('Could not retrieve Utrecht Archives data from Beeldbank.');
        });

      const beeldbankMetadata = this.parseBeeldbankMetadata(beeldbankResponse);
      return Promise.resolve(beeldbankMetadata);
    }

    // General metadata of page
    const generalMetadataResponse = await this.http
      .get(originalUrl, {
        headers: headers,
        params: params,
        responseType: 'text',
      })
      .toPromise()
      .catch(err => {
        Promise.reject('Could not retrieve Utrecht Archives general metadata.');
      });

    const generalMetadata = this.parseGeneralMetadata(generalMetadataResponse);
    return Promise.resolve(generalMetadata);
  }

  private getGuidByUrl(url: string) {
    // TODO: Ensure this is a valid Utrecht Archives URL
    // TODO: Properly extract the ID from the URL
    return url.replace(
      'https://hetutrechtsarchief.nl/beeldmateriaal/detail/',
      ''
    );
  }
}
