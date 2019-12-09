import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import Popper from 'popper.js';
import { SourceTooltipComponent } from './source-tooltip/source-tooltip.component';

@Directive({
  selector: '[utmSource]',
})
export class SourceDirective implements OnInit, OnDestroy {
  @Input() sourceUrl: string;
  @Input() sourceAuthor: string;
  @Input() sourceDate: string;

  tooltipRef: ComponentRef<SourceTooltipComponent>;
  tooltipPopper: Popper;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  private createTooltipElem() {
    // Create tooltip based on tooltip component
    const tooltipFactory: ComponentFactory<
      SourceTooltipComponent
    > = this.componentFactoryResolver.resolveComponentFactory(
      SourceTooltipComponent
    );
    this.tooltipRef = this.vc.createComponent(tooltipFactory);

    // Set the source for the tooltip
    this.tooltipRef.instance.source = this.sourceUrl;
    this.tooltipRef.instance.author = this.sourceAuthor;
    this.tooltipRef.instance.date = this.sourceDate;

    // Hide the tooltip
    this.setTooltipVisibility(false);
  }

  private underlineSource() {
    this.renderer.setStyle(
      this.elRef.nativeElement,
      'text-decoration-line',
      'underline'
    );
    this.renderer.setStyle(
      this.elRef.nativeElement,
      'text-decoration-style',
      'dashed'
    ); // solid, wavy, dotted, dashed, double
    this.renderer.setStyle(
      this.elRef.nativeElement,
      'text-decoration-color',
      '#157dbf'
    );
    this.renderer.setStyle(this.elRef.nativeElement, 'font-style', 'italic');
    this.renderer.setStyle(this.elRef.nativeElement, 'cursor', 'pointer');
  }

  private setTooltipVisibility(visible: boolean) {
    const tooltipElem = this.tooltipRef.location.nativeElement;

    // Enable animation
    this.renderer.addClass(tooltipElem, 'animated');
    this.renderer.removeClass(tooltipElem, 'fadeIn');
    this.renderer.removeClass(tooltipElem, 'fadeOut');

    // Set fading speed (in seconds)
    const fadeSpeed = 0.15;
    this.renderer.setStyle(tooltipElem, 'animation-duration', fadeSpeed + 's');

    // Start animation
    this.renderer.addClass(tooltipElem, visible ? 'fadeIn' : 'fadeOut');

    // Show/hide the tooltip
    if (visible) {
      // Show tooltip
      this.renderer.setStyle(tooltipElem, 'display', 'block');
    } else {
      // Hide tooltip after fadeout
      setTimeout(() => {
        this.renderer.setStyle(tooltipElem, 'display', 'none');
      }, fadeSpeed * 1000);
    }
  }

  @HostListener('click') onClick(event: Event) {
    if (this.tooltipPopper === undefined) {
      // Use Popper to place the tooltip in the right place relative to the source element
      this.tooltipPopper = new Popper(
        this.elRef.nativeElement,
        this.tooltipRef.location.nativeElement,
        {
          placement: 'top',
        }
      );
    }

    // Show the tooltip
    this.setTooltipVisibility(true);
  }

  @HostListener('document:click', ['$event.target']) onClickDocument(target) {
    const clickedSource = this.elRef.nativeElement.contains(target);
    const clickedTooltip = this.tooltipRef.location.nativeElement.contains(
      target
    );

    if (!clickedSource && !clickedTooltip) {
      // Clicked outside both the source and the tooltip
      // Hide the tooltip
      this.setTooltipVisibility(false);
    }
  }

  ngOnInit() {
    this.createTooltipElem();
    this.underlineSource();
  }

  ngOnDestroy() {
    if (this.tooltipRef) {
      this.tooltipRef.destroy();
    }
    if (this.tooltipPopper) {
      this.tooltipPopper.destroy();
    }
  }
}
