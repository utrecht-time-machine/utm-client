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

@Directive({
  selector: '[utmTextWithSources]',
})
export class TextWithSourcesDirective implements OnInit {
  @Input('utmTextWithSources') plainTextWithSources: string;

  sourceElems: HTMLCollection;
  sourceTagOpenIndices: number[];
  sourceTagCloseIndices: number[];
  sourceTag = 'utm-source';

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  createHtmlForFullText() {
    const textElem = this.renderer.createText(this.plainTextWithSources);
    this.renderer.appendChild(this.elRef.nativeElement, textElem);
  }

  createHtmlWithSources() {
    for (
      let sourceTagIdx = 0;
      sourceTagIdx <= this.sourceElems.length;
      sourceTagIdx++
    ) {
      let startIdx = 0;
      if (sourceTagIdx !== 0) {
        // This text segment starts after the previous source tag was closed
        startIdx =
          this.sourceTagCloseIndices[sourceTagIdx - 1]
          + this.getSourceClosingTag().length;
      }

      // If the final source tag has been handled, this text segment continues to the end
      let textLength = this.plainTextWithSources.length - startIdx;
      if (sourceTagIdx !== this.sourceElems.length) {
        // There are still source tags to be processed
        // This text segment continues to the next source tag
        textLength = this.sourceTagOpenIndices[sourceTagIdx] - startIdx;
      }

      // Create the text content element
      const textContent = this.plainTextWithSources.substr(
        startIdx,
        textLength
      );
      const textElem = this.renderer.createText(textContent);
      this.renderer.appendChild(this.elRef.nativeElement, textElem);

      if (sourceTagIdx !== this.sourceElems.length) {
        // Create the source component factory
        const sourceFactory: ComponentFactory<
          SourceComponent
        > = this.componentFactoryResolver.resolveComponentFactory(
          SourceComponent
        );

        // Create the source component
        const sourceText = this.sourceElems[sourceTagIdx].textContent;
        const sourceTextElem = this.renderer.createText(sourceText);
        const sourceComponent: ComponentRef<
          SourceComponent
        > = this.vc.createComponent(sourceFactory, 0, undefined, [
          [sourceTextElem],
        ]);

        // Set source details
        sourceComponent.instance.sourceUrl = this.sourceElems[
          sourceTagIdx
        ].getAttribute('sourceUrl');
        sourceComponent.instance.sourceAuthor = this.sourceElems[
          sourceTagIdx
        ].getAttribute('sourceAuthor');
        sourceComponent.instance.sourceDate = this.sourceElems[
          sourceTagIdx
        ].getAttribute('sourceDate');

        // Add source component to the DOM
        const sourceElem: HTMLElement = sourceComponent.location.nativeElement;
        this.renderer.appendChild(this.elRef.nativeElement, sourceElem);
      }
    }
  }

  parseAsHtml(): boolean {
    // Parse the text as HTML
    const htmlParser = new DOMParser();
    const parsedText: Document = htmlParser.parseFromString(
      this.plainTextWithSources,
      'text/html'
    );

    // Find all the source tags in the HTML
    this.sourceElems = parsedText.getElementsByTagName(this.sourceTag);

    if (this.sourceElems.length === 0) {
      // No source tags found, no further parse necessary
      return false;
    }

    // Find the source tag indices
    this.sourceTagOpenIndices = indexes(
      this.plainTextWithSources,
      '<' + this.sourceTag
    );
    this.sourceTagCloseIndices = indexes(
      this.plainTextWithSources,
      this.getSourceClosingTag()
    );

    // Ensure that there are no unclosed or unopened tags
    if (
      this.sourceTagOpenIndices.length !== this.sourceTagCloseIndices.length
    ) {
      console.warn(
        'UTM Source tag was not correctly opened or closed. Did not correctly parse sources.'
      );
      return false;
    }

    // Found source tags, parsed successfully
    return true;
  }

  getSourceClosingTag(): string {
    return '</' + this.sourceTag + '>';
  }

  ngOnInit(): void {
    const parsedSuccessfully = this.parseAsHtml();
    if (parsedSuccessfully) {
      this.createHtmlWithSources();
    } else {
      this.createHtmlForFullText();
    }
  }
}
