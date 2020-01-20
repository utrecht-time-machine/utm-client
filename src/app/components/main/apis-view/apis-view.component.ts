import { Component, OnInit } from '@angular/core';
import { OpenCultuurDataService } from '../../../services/APIs/open-cultuur-data.service';
import { ApiSearchResponse } from '../../../models/api-search/api-search-response.model';
import { ApiSearchSource } from '../../../models/api-search/api-search-source.model';

@Component({
  selector: 'utm-apis-view',
  templateUrl: './apis-view.component.html',
  styleUrls: ['./apis-view.component.scss'],
})
export class ApisViewComponent implements OnInit {
  private queryString = '';
  private queryResults: ApiSearchResponse[] = [];
  private querying = false;

  private maxQueryResults = 10;

  private sources: ApiSearchSource[] = [];
  private selectedSourceIds: string[] = [];
  private sourceSelectionOptions: any = {
    header: 'Sources',
  };

  constructor(private openCultuurData: OpenCultuurDataService) {}

  onQueryInputChange($event: Event) {
    this.executeQuery();
  }

  onSelectedSourcesChanged($event: Event) {
    this.executeQuery();
  }

  private executeQuery() {
    // TODO: Cancel (or ignore) previous request(s) if we have executed a new request.
    if (this.queryString === '') {
      this.queryResults = [];
      return;
    }

    this.querying = true;
    this.queryResults = [];

    this.openCultuurData
      .getQueryResults(
        this.queryString,
        this.maxQueryResults,
        this.selectedSourceIds
      )
      .then(results => {
        this.querying = false;
        this.queryResults = results;

        // console.log(this.queryResults);
      })
      .catch(error => {
        this.querying = false;
        console.error(error);
      });
  }

  ngOnInit() {
    this.executeQuery();

    this.openCultuurData.getAllSources().then(sources => {
      this.sources = sources;
    });
  }
}
