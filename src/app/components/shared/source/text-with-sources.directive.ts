import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { indexes } from '../../../helpers/string.helper';

@Directive({
  selector: '[utmTextWithSources]',
})
export class TextWithSourcesDirective implements OnInit {
  @Input() utmTextWithSources: string;

  sourceElems: HTMLCollection;
  sourceTagOpenIndices: number[];
  sourceTagCloseIndices: number[];
  sourceTag = 'utm-source';

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  private underlineSource(elem: HTMLElement) {
    this.renderer.setStyle(elem, 'text-decoration-line', 'underline');
    this.renderer.setStyle(elem, 'text-decoration-style', 'dashed'); // solid, wavy, dotted, dashed, double
    this.renderer.setStyle(elem, 'text-decoration-color', '#157dbf');
    this.renderer.setStyle(elem, 'font-style', 'italic');
    this.renderer.setStyle(elem, 'cursor', 'pointer');
  }

  createHtmlForFullText() {
    const textElem = this.renderer.createText(this.utmTextWithSources);
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
      let textLength = this.utmTextWithSources.length - startIdx;
      if (sourceTagIdx !== this.sourceElems.length) {
        // There are still source tags to be processed
        // This text segment continues to the next source tag
        textLength = this.sourceTagOpenIndices[sourceTagIdx] - startIdx;
      }

      // Create the text content element
      const textContent = this.utmTextWithSources.substr(startIdx, textLength);
      const textElem = this.renderer.createText(textContent);
      this.renderer.appendChild(this.elRef.nativeElement, textElem);

      if (sourceTagIdx !== this.sourceElems.length) {
        // Create this source element
        const sourceElem: HTMLElement = this.renderer.createElement('span');
        const sourceElemText = this.renderer.createText(
          this.sourceElems[sourceTagIdx].textContent
        );
        this.renderer.appendChild(sourceElem, sourceElemText);

        // Add the source element to the DOM
        this.renderer.appendChild(this.elRef.nativeElement, sourceElem);

        // Underline the source element
        this.underlineSource(sourceElem);
      }
    }
  }

  parseAsHtml(): boolean {
    // Parse the text as HTML
    const htmlParser = new DOMParser();
    const parsedText: Document = htmlParser.parseFromString(
      this.utmTextWithSources,
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
      this.utmTextWithSources,
      '<' + this.sourceTag
    );
    this.sourceTagCloseIndices = indexes(
      this.utmTextWithSources,
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
