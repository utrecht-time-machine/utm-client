import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'utm-source-tooltip',
  templateUrl: './source-tooltip.component.html',
  styleUrls: ['./source-tooltip.component.scss'],
})
export class SourceTooltipComponent implements OnInit {
  @Input() source = '';
  @Input() author = '';
  @Input() date = '';

  constructor() {}

  ngOnInit() {}
}
