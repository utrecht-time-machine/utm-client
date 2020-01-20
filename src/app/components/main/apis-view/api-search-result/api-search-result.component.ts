import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ApiSearchResponse } from '../../../../models/api-search/api-search-response.model';

@Component({
  selector: 'utm-api-search-result',
  templateUrl: './api-search-result.component.html',
  styleUrls: ['./api-search-result.component.scss'],
})
export class ApiSearchResultComponent implements OnInit {
  @Input() searchResult: ApiSearchResponse;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {}
}
