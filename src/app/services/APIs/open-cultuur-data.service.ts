import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiSearchResponse } from '../../models/api-search/api-search-response.model';
import { ApiSearchSource } from '../../models/api-search/api-search-source.model';

@Injectable({
  providedIn: 'root',
})
export class OpenCultuurDataService {
  // Documentation: http://docs.opencultuurdata.nl/user/api.html

  // TODO: Stop using CORS anywhere here, we should be able to make POST requests to the API with the right headers
  private readonly apiUrl =
    'https://cors-anywhere.herokuapp.com/http://api.opencultuurdata.nl/v0/search';
  private readonly apiSourcedUrl = 'http://api.opencultuurdata.nl/v0/sources';

  constructor(private http: HttpClient) {}

  async getQueryResults(
    query: string,
    amtResults: number = 10,
    sourceIds?: string[]
  ): Promise<ApiSearchResponse[]> {
    const headers: HttpHeaders = new HttpHeaders({});
    const params: HttpParams = new HttpParams();
    const httpOptions = { headers: headers, params: params };

    const body = {
      query: query,
      size: Math.min(amtResults, 100),
      facets: { collection: {} },
    }; // "sort": "date"

    if (sourceIds && sourceIds.length !== 0) {
      body['filters'] = {
        source_id: { terms: sourceIds },
      };
    }

    const response = await this.http
      .post(this.apiUrl, body, httpOptions)
      .toPromise()
      .catch(error => {
        return Promise.reject(error);
      });

    const hits: Object[] = response['hits']['hits'];
    const searchResults: ApiSearchResponse[] = this.parseServerResponse(
      hits,
      sourceIds
    );

    return Promise.resolve(searchResults);
  }

  async getAllSources(): Promise<ApiSearchSource[]> {
    const result = await this.http
      .get('http://api.opencultuurdata.nl/v0/sources')
      .toPromise();
    if (!result['sources']) {
      return Promise.reject(
        'Could not retrieve sources from Open Cultuur Data'
      );
    }

    return result['sources'] as ApiSearchSource[];
  }

  private parseServerResponse(
    response: Object[],
    sourceIds?: string[]
  ): ApiSearchResponse[] {
    const searchResults: ApiSearchResponse[] = [];

    for (const hit of response) {
      const source = hit['_source'];

      const searchResult: ApiSearchResponse = {
        '@id': hit['_id'],
        title: source['title'],
        authors: source['authors'],
        description: source['description'],
        collection: source['meta']['collection'],
        notes: source['notes'],
      };

      const hasImage = Object.entries(source['enrichments']).length !== 0;
      if (hasImage) {
        // TODO: Support multiple images, instead of just the first one
        searchResult.imageUrl =
          source['enrichments']['media_urls'][0]['original_url'];
      }

      const hasOriginalUrl = Object.entries(
        source['meta']['original_object_urls'].length !== 0
      );
      if (hasOriginalUrl) {
        searchResult.originalUrl =
          source['meta']['original_object_urls']['html'];
      }

      searchResults.push(searchResult);
    }

    return searchResults;
  }
}
