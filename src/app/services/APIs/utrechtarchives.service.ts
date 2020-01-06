import { Injectable } from '@angular/core';
import { SourceMetadata } from '../../models/source-metadata.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UtrechtArchivesService {
  apiKey = 'b29fb3e4-5302-11e6-8975-2b551e9b96f4';

  constructor(private http: HttpClient) {}

  async requestByUrl(archiveUrl: string): Promise<SourceMetadata> {
    const archiveGuid = this.getGuidByUrl(archiveUrl);
    return this.request(archiveGuid);
  }

  async request(archiveGuid: string): Promise<SourceMetadata> {
    if (archiveGuid === undefined) {
      //  || archiveGuid.length !== 32
      return Promise.reject('Tried to query invalid Utrecht Archives GUID.');
    }

    const result = await this.requestData(archiveGuid);

    // Parse metadata
    const responseMetadata = result.media[0].metadata;
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
    return Promise.resolve(metadata);
  }

  private getDateFromDutchDate(dutchDate): Date {
    const dateParts = dutchDate.split('-');
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  }

  private requestData(archiveGuid: string): Promise<any> {
    const params = new HttpParams();

    return this.http
      .get(
        `https://webservices.picturae.com/mediabank/media/${archiveGuid}?apiKey=${this.apiKey}`,
        { params }
      )
      .toPromise();
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
