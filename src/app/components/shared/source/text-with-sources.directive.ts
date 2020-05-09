import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { SourcesFromHtmlService } from '../../../services/sources-from-html.service';

@Directive({
  selector: '[utmTextWithSources]',
})
export class TextWithSourcesDirective implements OnInit, OnChanges {
  @Input('utmTextWithSources') plainTextWithSources: string;

  constructor(
    private sourcesFromHtml: SourcesFromHtmlService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.plainTextWithSources) {
      this.sourcesFromHtml
        .renderHtmlWithSources(
          this.renderer,
          this.elRef,
          this.vc,
          this.plainTextWithSources
        )
        .then(r => {})
        .catch(err => {
          console.warn(err);
        });
    }
  }
}
