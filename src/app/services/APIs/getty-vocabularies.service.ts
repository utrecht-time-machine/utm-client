import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SourceMetadata } from '../../models/source-metadata.model';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root',
})
export class GettyVocabulariesService {
  constructor(private http: HttpClient, private constants: ConstantsService) {}

  async requestByUrl(url: string): Promise<SourceMetadata> {
    const result = await this.http
      .get(this.constants.corsProxyUrl + url + '.json', {})
      .toPromise()
      .catch(err => {
        return Promise.reject(err);
      });

    if (!result['results']) {
      return Promise.reject('Could not parse result from server.');
    }

    const title = result['results']['bindings'].find(triple => {
      const object = triple['Object'];
      return object['xml:lang'] === 'en' && object['type'] === 'literal';
    });

    const metadata: SourceMetadata = {
      name: title['Object']['value'],
    };

    return Promise.resolve(metadata);
  }
}
