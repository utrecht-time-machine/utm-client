import { Component, OnInit } from '@angular/core';
import { OpenCultuurDataService } from '../../../services/APIs/open-cultuur-data.service';
import { ApiSearchResponse } from '../../../models/api-search-response.model';

@Component({
  selector: 'utm-apis-view',
  templateUrl: './apis-view.component.html',
  styleUrls: ['./apis-view.component.scss'],
})
export class ApisViewComponent implements OnInit {
  private queryString = 'Test';

  private queryResults: ApiSearchResponse[];

  constructor(private openCultuurData: OpenCultuurDataService) {}

  onQueryInputChange($event: Event) {
    if (this.queryString === '') {
      return;
    }

    this.getQueryResults(this.queryString);
  }

  private async getQueryResults(query: string) {
    this.queryResults = await this.openCultuurData.searchAllCollections(query);
  }

  ngOnInit() {}
}
