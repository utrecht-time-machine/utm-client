import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiSearchResponse } from '../../models/api-search-response.model';

@Injectable({
  providedIn: 'root',
})
export class OpenCultuurDataService {
  // TODO: Stop using CORS anywhere here, we should be able to make POST requests to the API with the right headers
  private readonly apiUrl =
    'https://cors-anywhere.herokuapp.com/http://api.opencultuurdata.nl/v0/search';

  constructor(private http: HttpClient) {}

  async searchAllCollections(query: string): Promise<ApiSearchResponse[]> {
    const headers: HttpHeaders = new HttpHeaders({});
    const params: HttpParams = new HttpParams();
    const httpOptions = { headers: headers, params: params };

    const body = { query: query };

    const response = await this.http
      .post(this.apiUrl, body, httpOptions)
      .toPromise();
    // TODO: Handle errors
    // ...

    const hits: Array<Object> = response['hits']['hits'];

    // Parse response
    const searchResults: ApiSearchResponse[] = [];

    for (const hit of hits) {
      const source = hit['_source'];

      const searchResult: ApiSearchResponse = {
        '@id': hit['_id'],
        title: source['title'],
        authors: source['authors'],
        description: source['description'],
        collection: source['meta']['collection'],
      };

      const hasImage = Object.entries(source['enrichments']).length !== 0;
      if (hasImage) {
        // TODO: Support multiple images, instead of just the first one
        searchResult.imageUrl =
          source['enrichments']['media_urls'][0]['original_url'];
      }

      searchResults.push(searchResult);
    }

    return Promise.resolve(searchResults);
  }
}
