import { Component, OnInit } from '@angular/core';
import { OpenCultuurDataService } from '../../../services/APIs/open-cultuur-data.service';
import { ApiSearchResponse } from '../../../models/api-search-response.model';

@Component({
  selector: 'utm-apis-view',
  templateUrl: './apis-view.component.html',
  styleUrls: ['./apis-view.component.scss'],
})
export class ApisViewComponent implements OnInit {
  private queryString = '';
  private queryResults: ApiSearchResponse[] = [];
  private querying = false;

  constructor(private openCultuurData: OpenCultuurDataService) {}

  onQueryInputChange($event: Event) {
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
      .searchAllCollections(this.queryString)
      .then(results => {
        this.querying = false;
        this.queryResults = results;

        console.log(this.queryResults);
      })
      .catch(error => {
        this.querying = false;
        console.error(error);
      });
  }

  ngOnInit() {
    this.executeQuery();
  }
}
