import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[utmTimeSlider]',
})
export class TimeSliderDirective implements OnInit, OnDestroy {
  @Input() presentImageUrl;
  @Input() historicalImageUrl;

  private phoneEl: ElementRef;
  private screenEl: ElementRef;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  updateImages() {
    this.renderer.setStyle(
      this.elRef.nativeElement,
      'background-image',
      "url('" + this.presentImageUrl + "')"
    );

    this.renderer.setStyle(
      this.screenEl,
      'background-image',
      "url('" + this.historicalImageUrl + "')"
    );
  }

  ngOnInit() {
    // Create phone
    this.phoneEl = this.renderer.createElement('div');
    this.phoneEl.nativeElement = this.phoneEl;

    this.renderer.setAttribute(this.phoneEl, 'id', 'phone');

    // Create screen
    this.screenEl = this.renderer.createElement('div');
    this.screenEl.nativeElement = this.screenEl;

    this.renderer.setAttribute(this.screenEl, 'id', 'screen');
    this.renderer.appendChild(this.phoneEl, this.screenEl);

    // Add phone to screen
    this.renderer.appendChild(this.elRef.nativeElement, this.phoneEl);

    this.updateImages();
  }

  @HostListener('mousemove', ['$event']) onHover(event: Event) {
    const mouseX: number = event['clientX'];
    const mouseY: number = event['clientY'];

    const bgX =
      (2 + mouseX - this.screenEl.nativeElement.offsetWidth * 0.5) * -1;
    const bgY =
      (4 + mouseY - this.screenEl.nativeElement.offsetHeight * 0.5) * -1;

    const phoneTransform =
      'translate('
      + (mouseX - this.phoneEl.nativeElement.offsetWidth * 0.5)
      + 'px, '
      + (mouseY - this.phoneEl.nativeElement.offsetHeight * 0.5)
      + 'px)';
    this.renderer.setStyle(
      this.phoneEl.nativeElement,
      'transform',
      phoneTransform
    );

    this.renderer.setStyle(
      this.screenEl.nativeElement,
      'background-position',
      bgX + 'px ' + bgY + 'px'
    );
  }

  ngOnDestroy() {}
}
