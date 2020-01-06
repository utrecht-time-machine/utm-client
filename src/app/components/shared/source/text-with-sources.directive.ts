import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { SourcesFromHtmlService } from '../../../services/sources-from-html.service';

@Directive({
  selector: '[utmTextWithSources]',
})
export class TextWithSourcesDirective implements OnInit {
  @Input('utmTextWithSources') plainTextWithSources: string;

  constructor(
    private sourcesFromHtml: SourcesFromHtmlService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef
  ) {}

  ngOnInit() {
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
