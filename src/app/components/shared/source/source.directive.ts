import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[utmSource]',
})
export class SourceDirective implements OnInit {
  constructor(private elRef: ElementRef) {}

  @HostListener('mouseenter') mouseOver(event: Event) {}

  @HostListener('mouseleave') mouseLeave(event: Event) {}

  ngOnInit() {}
}
