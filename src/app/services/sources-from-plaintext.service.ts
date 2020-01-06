import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injectable,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { indexes } from '../helpers/string.helper';
import { SourceComponent } from '../components/shared/source/source-component/source.component';

@Injectable({
  providedIn: 'root',
})
export class SourcesFromPlaintextService {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  private sourceTag = 'utm-source';
  private sourceClosingTagHtml = '</' + this.sourceTag + '>';

  private getSourceOpenTagIndices(plainTextWithSources: string): number[] {
    return indexes(plainTextWithSources, '<' + this.sourceTag);
  }

  private getSourceCloseTagIndices(plainTextWithSources: string): number[] {
    return indexes(plainTextWithSources, this.sourceClosingTagHtml);
  }

  private plainTextContainsValidSourceTags(
    plainTextWithSources: string
  ): boolean {
    // Find the source tag indices
    const sourceTagOpenIndices = this.getSourceOpenTagIndices(
      plainTextWithSources
    );
    const sourceTagCloseIndices = this.getSourceCloseTagIndices(
      plainTextWithSources
    );

    // Ensure that there are no unclosed or unopened tags
    return sourceTagOpenIndices.length === sourceTagCloseIndices.length;
  }

  public getTextContentsBetweenSourceTags(
    plainTextWithSources: string,
    sourceElems: HTMLCollection
  ): string[] {
    // Find the source tag indices
    const sourceTagOpenIndices = this.getSourceOpenTagIndices(
      plainTextWithSources
    );
    const sourceTagCloseIndices = this.getSourceCloseTagIndices(
      plainTextWithSources
    );

    // Find the text content before and after the source tags
    const textsBetweenSources: string[] = [];
    for (
      let sourceTagIdx = 0;
      sourceTagIdx <= sourceElems.length;
      sourceTagIdx++
    ) {
      let startIdx = 0;
      if (sourceTagIdx !== 0) {
        // This text segment starts after the previous source tag was closed
        startIdx =
          sourceTagCloseIndices[sourceTagIdx - 1]
          + this.sourceClosingTagHtml.length;
      }

      // If the final source tag has been handled, this text segment continues to the end
      let textLength = plainTextWithSources.length - startIdx;
      if (sourceTagIdx !== sourceElems.length) {
        // There are still source tags to be processed
        // This text segment continues to the next source tag
        textLength = sourceTagOpenIndices[sourceTagIdx] - startIdx;
      }

      // Find the text content of this element
      const textBetweenSources = plainTextWithSources.substr(
        startIdx,
        textLength
      );

      textsBetweenSources.push(textBetweenSources);
    }

    return textsBetweenSources;
  }

  public parseSourceHtmlTagsFromPlainText(
    plainTextWithSources: string
  ): Promise<HTMLCollection> {
    // Parse the text as HTML
    const htmlParser = new DOMParser();
    const parsedText: Document = htmlParser.parseFromString(
      plainTextWithSources,
      'text/html'
    );

    // Find all the source tags in the HTML
    const sourceElems: HTMLCollection = parsedText.getElementsByTagName(
      this.sourceTag
    );

    if (sourceElems.length === 0) {
      return Promise.reject('No source tags found in plain text.');
    }

    if (!this.plainTextContainsValidSourceTags(plainTextWithSources)) {
      return Promise.reject(
        'UTM Source tag was not correctly opened or closed. Did not correctly parse sources.'
      );
    }

    // Found source tags, parsed successfully
    return Promise.resolve(sourceElems);
  }

  public renderHtmlWithSources(
    renderer: Renderer2,
    elRef: ElementRef,
    vc: ViewContainerRef,
    textsBetweenSources: string[],
    sourceElems: HTMLCollection
  ) {
    for (
      let sourceTagIdx = 0;
      sourceTagIdx <= sourceElems.length;
      sourceTagIdx++
    ) {
      // Create the plain text elements between the source tags
      const textBetweenTags = textsBetweenSources[sourceTagIdx];
      // TODO: Is there a way to insert this HTML through the renderer directly?
      elRef.nativeElement.insertAdjacentHTML('beforeend', textBetweenTags);

      if (sourceTagIdx !== sourceElems.length) {
        // Create the source component factory
        const sourceFactory: ComponentFactory<SourceComponent> = this.componentFactoryResolver.resolveComponentFactory(
          SourceComponent
        );

        // Create the source component
        const sourceText = sourceElems[sourceTagIdx].textContent;
        const sourceTextElem = renderer.createText(sourceText);
        const sourceComponent: ComponentRef<SourceComponent> = vc.createComponent(
          sourceFactory,
          0,
          undefined,
          [[sourceTextElem]]
        );

        // Set source details
        sourceComponent.instance.sourceUrl = sourceElems[
          sourceTagIdx
        ].getAttribute('sourceUrl');

        // TODO: Find a less hacky way to do this
        sourceComponent.instance.container = elRef.nativeElement.parentElement;

        // Add source component to the DOM
        const sourceElem: HTMLElement = sourceComponent.location.nativeElement;
        renderer.appendChild(elRef.nativeElement, sourceElem);
      }
    }
  }
}
