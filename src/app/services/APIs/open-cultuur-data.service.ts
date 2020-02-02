import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiSearchResponse } from '../../models/api-search/api-search-response.model';
import { ApiSearchSource } from '../../models/api-search/api-search-source.model';
import { ApiSearchFilter } from '../../models/api-search/api-search-filter.model';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root',
})
export class OpenCultuurDataService {
  // Documentation: http://docs.opencultuurdata.nl/user/api.html

  // TODO: Stop using CORS proxy here, we should be able to make POST requests to the API with the right headers
  private readonly apiUrl =
    this.constants.corsProxyUrl + 'http://api.opencultuurdata.nl/v0/search';
  private readonly apiSourcesUrl =
    this.constants.corsProxyUrl + 'http://api.opencultuurdata.nl/v0/sources';

  constructor(private http: HttpClient, private constants: ConstantsService) {}

  async getQueryResults(
    query: string,
    filter: ApiSearchFilter
  ): Promise<ApiSearchResponse[]> {
    const params = {
      query: query,
      size: Math.min(filter.maxAmountResults, 100),
      facets: { collection: {} },
      filters: {},
    }; // "sort": "date"

    // Filter by source
    if (filter.sourceIds && filter.sourceIds.length !== 0) {
      params['filters'] = {
        source_id: { terms: filter.sourceIds },
      };
    }

    // Filter only images
    if (filter.onlyIncludeImages) {
      params['filters']['media_content_type'] = {
        terms: ['image/jpeg', 'image/png'],
      };
    }

    const response = await this.http
      .post(this.apiUrl, params)
      .toPromise()
      .catch(error => {
        return Promise.reject(error);
      });

    const hits: Object[] = response['hits']['hits'];
    const searchResults: ApiSearchResponse[] = this.parseServerResponse(hits);

    return Promise.resolve(searchResults);
  }

  async getAllSources(): Promise<ApiSearchSource[]> {
    const result = await this.http.get(this.apiSourcesUrl).toPromise();
    if (!result['sources']) {
      return Promise.reject(
        'Could not retrieve sources from Open Cultuur Data'
      );
    }

    return result['sources'] as ApiSearchSource[];
  }

  private parseServerResponse(response: Object[]): ApiSearchResponse[] {
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

      if (source['date']) {
        searchResult.date = new Date(source['date']);
      }

      const hasEnrichmentImage =
        source['enrichments']
        && Object.entries(source['enrichments']).length !== 0;
      if (hasEnrichmentImage) {
        // TODO: Support multiple images, instead of just the first one
        searchResult.imageUrl =
          source['enrichments']['media_urls'][0]['original_url'];
      }

      const hasMediaImage =
        source['media_urls']
        && Object.entries(source['media_urls']).length !== 0;
      if (hasMediaImage) {
        // TODO: Support multiple images and video
        for (const media of source['media_urls']) {
          const mediaIsImage =
            media['content_type'] === 'image/jpeg'
            || media['content_type'] === 'image/png';
          if (mediaIsImage) {
            searchResult.imageUrl = media['url'];
            break;
          }
        }
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
