import { Component, Input, OnInit } from '@angular/core';
import { ApiSearchResponse } from '../../../../models/api-search-response.model';

@Component({
  selector: 'utm-api-search-result',
  templateUrl: './api-search-result.component.html',
  styleUrls: ['./api-search-result.component.scss'],
})
export class ApiSearchResultComponent implements OnInit {
  @Input() searchResult: ApiSearchResponse;

  constructor() {}

  ngOnInit() {}
}
