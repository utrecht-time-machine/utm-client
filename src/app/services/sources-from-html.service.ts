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
export class SourcesFromHtmlService {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  private sourceTag = 'utm-source';
  private sourceClosingTagHtml = '</' + this.sourceTag + '>';

  public getSourceTag() {
    return this.sourceTag;
  }

  private plainTextContainsValidSourceTags(
    plainTextWithSources: string
  ): boolean {
    // Find the source tag indices
    const sourceTagOpenIndices = indexes(
      plainTextWithSources,
      '<' + this.sourceTag
    );
    const sourceTagCloseIndices = indexes(
      plainTextWithSources,
      this.sourceClosingTagHtml
    );

    // Ensure that there are no unclosed or unopened tags
    return sourceTagOpenIndices.length === sourceTagCloseIndices.length;
  }

  private createSourceElem(
    renderer: Renderer2,
    vc: ViewContainerRef,
    elRef: ElementRef,
    sourceContent: Node,
    sourceUrl: string
  ): HTMLElement {
    // Create the source component factory
    const sourceFactory: ComponentFactory<SourceComponent> = this.componentFactoryResolver.resolveComponentFactory(
      SourceComponent
    );

    // TODO: Extend so a source tag can contain more than one HTML element
    let sourceNode: any = sourceContent.firstChild;
    if (!sourceNode) {
      // If the source has no content, use a default text value
      sourceNode = renderer.createText('Source');
    }

    // Create the source component
    const sourceComponent: ComponentRef<SourceComponent> = vc.createComponent(
      sourceFactory,
      0,
      undefined,
      [[sourceNode]]
    );

    // Set source details
    sourceComponent.instance.sourceUrl = sourceUrl;

    // TODO: Find a less hacky way to do this
    sourceComponent.instance.container = elRef.nativeElement.parentElement;

    // Create source element
    const sourceElem: HTMLElement = sourceComponent.location.nativeElement;
    return sourceElem;
  }

  private parseSourceHtmlTagsFromPlainText(
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

  public async renderHtmlWithSources(
    renderer: Renderer2,
    elRef: ElementRef,
    vc: ViewContainerRef,
    html: string
  ): Promise<boolean> {
    elRef.nativeElement.innerHTML = '';

    // Render original HTML
    elRef.nativeElement.insertAdjacentHTML('beforeend', html);

    // Find source tags
    const sourceTagsInHtml: NodeList = elRef.nativeElement.querySelectorAll(
      this.sourceTag
    );

    if (sourceTagsInHtml.length === 0) {
      // No source tags found, so the rendered HTML should suffice
      return Promise.resolve(true);
    }

    const sourceElems = await this.parseSourceHtmlTagsFromPlainText(html);

    if (sourceTagsInHtml.length !== sourceElems.length) {
      return Promise.reject(
        'The amount of source tags found in the HTML should match the amount of source tags that were parsed.'
      );
    }

    for (let sourceIdx = 0; sourceIdx < sourceElems.length; sourceIdx++) {
      // Retrieve source information
      const sourceContent: Node = sourceElems[sourceIdx];
      const sourceUrl = sourceElems[sourceIdx].getAttribute('sourceUrl');

      // Create source element
      const sourceElem = this.createSourceElem(
        renderer,
        vc,
        elRef,
        sourceContent,
        sourceUrl
      );

      // Insert source element to DOM
      const sourceTag: Node = sourceTagsInHtml[sourceIdx];
      renderer.insertBefore(sourceTag.parentNode, sourceElem, sourceTag);

      // Remove original source tag from DOM
      renderer.removeChild(sourceTag.parentNode, sourceTag);
    }

    return Promise.resolve(true);
  }
}
