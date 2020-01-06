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

  private getDateFromDutchDate(dutchDate): Date {
    const dateParts = dutchDate.split('-');
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  }

  private async getMetadata(
    archiveGuid: string,
    originalUrl: string
  ): Promise<any> {
    if (archiveGuid !== originalUrl) {
      // Beeldbank
      const beeldbankResponse = await this.http
        .get(
          `https://webservices.picturae.com/mediabank/media/${archiveGuid}?apiKey=${this.apiKey}`,
          {}
        )
        .toPromise()
        .catch(err => {
          Promise.reject(
            'Could not retrieve metadata from the Utrecht Archives beeldbank.'
          );
        });

      const beeldbankMetadata = this.parseBeeldbankMetadata(beeldbankResponse);
      return Promise.resolve(beeldbankMetadata);
    }

    return Promise.reject(
      'Could not retrieve metadata from the Utrecht Archives.'
    );
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
