import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { SourceDirective } from '../source.directive';

@Component({
  selector: 'utm-source',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss'],
})
export class SourceComponent implements OnInit {
  @Input() sourceUrl: string;
  @Input() container: ElementRef;

  constructor() {}

  ngOnInit() {}
}
