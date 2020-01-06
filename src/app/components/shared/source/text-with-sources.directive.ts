import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { indexes } from '../../../helpers/string.helper';
import { SourceTooltipComponent } from './source-tooltip/source-tooltip.component';
import { SourceComponent } from './source-component/source.component';
import { SourcesFromPlaintextService } from '../../../services/sources-from-plaintext.service';
import { source } from '@angular-devkit/schematics';

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

  createHtmlForFullText() {
    const textElem = this.renderer.createText(this.plainTextWithSources);
    this.renderer.appendChild(this.elRef.nativeElement, textElem);
  }

  ngOnInit() {
    this.sourcesFromPlainText
      .parseSourceHtmlTagsFromPlainText(this.plainTextWithSources)
      .then(sourceElems => {
        console.log(this.plainTextWithSources);
        const textsBetweenSources: string[] = this.sourcesFromPlainText.getTextContentsBetweenSourceTags(
          this.plainTextWithSources,
          sourceElems
        );
        console.log(textsBetweenSources);
        this.sourcesFromPlainText.renderHtmlWithSources(
          this.renderer,
          this.elRef,
          this.vc,
          textsBetweenSources,
          sourceElems
        );
      })
      .catch(err => {
        console.warn(err);

        this.createHtmlForFullText();
      });
  }
}
