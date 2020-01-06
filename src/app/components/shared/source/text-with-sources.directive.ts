import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { SourcesFromPlaintextService } from '../../../services/sources-from-plaintext.service';

@Directive({
  selector: '[utmTextWithSources]',
})
export class TextWithSourcesDirective implements OnInit {
  @Input('utmTextWithSources') plainTextWithSources: string;

  constructor(
    private sourcesFromPlainText: SourcesFromPlaintextService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef
  ) {}

  ngOnInit() {
    this.sourcesFromPlainText
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
