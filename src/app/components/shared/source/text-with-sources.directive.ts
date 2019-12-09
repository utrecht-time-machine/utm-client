import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { indexes } from '../../../helpers/string.helper';

@Directive({
  selector: '[utmTextWithSources]',
})
export class TextWithSourcesDirective implements OnInit {
  @Input() utmTextWithSources: string;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  private underlineSource(elem: HTMLElement) {
    this.renderer.setStyle(elem, 'text-decoration-line', 'underline');
    this.renderer.setStyle(elem, 'text-decoration-style', 'dashed'); // solid, wavy, dotted, dashed, double
    this.renderer.setStyle(elem, 'text-decoration-color', '#157dbf');
    this.renderer.setStyle(elem, 'font-style', 'italic');
    this.renderer.setStyle(elem, 'cursor', 'pointer');
  }

  ngOnInit(): void {
    // Parse the HTML
    const htmlParser = new DOMParser();
    const parsedText: Document = htmlParser.parseFromString(
      this.utmTextWithSources,
      'text/html'
    );

    // Find all the source tags
    const sourceElems = parsedText.getElementsByTagName('utmSource');

    if (sourceElems.length === 0) {
      // No source tags found, simply show the text
      const textElem = this.renderer.createText(this.utmTextWithSources);
      this.renderer.appendChild(this.elRef.nativeElement, textElem);
      return;
    }

    // Find the source tag indices
    const sourceTagOpenIndices = indexes(this.utmTextWithSources, '<utmSource');
    const closeTag = '</utmSource>';
    const sourceTagCloseIndices = indexes(this.utmTextWithSources, closeTag);

    // Ensure that there are no unclosed or unopened tags
    if (sourceTagOpenIndices.length !== sourceTagCloseIndices.length) {
      // TODO: Duplicated code from above
      console.warn(
        'UTM Source tag was not correctly opened or closed. Did not correctly parse sources.'
      );

      // Show the full text (including potentially incorrect source tags)
      const textElem = this.renderer.createText(this.utmTextWithSources);
      this.renderer.appendChild(this.elRef.nativeElement, textElem);
      return;
    }

    // Find all the text elements between the source tags
    for (
      let sourceTagIdx = 0;
      sourceTagIdx <= sourceElems.length;
      sourceTagIdx++
    ) {
      let startIdx = 0;
      if (sourceTagIdx !== 0) {
        // This text segment starts after the previous source tag was closed
        startIdx = sourceTagCloseIndices[sourceTagIdx - 1] + closeTag.length;
      }

      // If the final source tag has been handled, this text segment continues to the end
      let textLength = this.utmTextWithSources.length - startIdx;
      if (sourceTagIdx !== sourceElems.length) {
        // There are still source tags to be processed
        // This text segment continues to the next source tag
        textLength = sourceTagOpenIndices[sourceTagIdx] - startIdx;
      }

      // Create the text content element
      const textContent = this.utmTextWithSources.substr(startIdx, textLength);
      const textElem = this.renderer.createText(textContent);
      this.renderer.appendChild(this.elRef.nativeElement, textElem);

      if (sourceTagIdx !== sourceElems.length) {
        // Create this source element
        const sourceElem: HTMLElement = this.renderer.createElement('span');
        const sourceElemText = this.renderer.createText(
          sourceElems[sourceTagIdx].textContent
        );
        this.renderer.appendChild(sourceElem, sourceElemText);

        // Add the source element to the DOM
        this.renderer.appendChild(this.elRef.nativeElement, sourceElem);

        // Underline the source element
        this.underlineSource(sourceElem);
      }
    }
  }
}
