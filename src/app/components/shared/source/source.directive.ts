import {
  AfterViewInit,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ContentChild,
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

  private tooltipRef: ComponentRef<SourceTooltipComponent>;
  private tooltipPopper: Popper;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  private createTooltipElem() {
    // TODO: Perhaps instead of creating the tooltip element once, create and destroy every time on a new click, to ensure correct positioning on screen
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
    this.tooltipRef.instance.setVisibility(false, true);
  }

  private underlineSource() {
    const elem = this.elRef.nativeElement;
    this.renderer.setStyle(elem, 'text-decoration-line', 'underline');
    this.renderer.setStyle(elem, 'text-decoration-style', 'dashed'); // solid, wavy, dotted, dashed, double
    this.renderer.setStyle(elem, 'text-decoration-color', '#157dbf');
    this.renderer.setStyle(elem, 'font-style', 'italic');
    this.renderer.setStyle(elem, 'cursor', 'pointer');
  }

  @HostListener('click', ['$event']) onClick(event: Event) {
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
    this.tooltipRef.instance.setVisibility(true);

    event.stopPropagation();
  }

  @HostListener('document:click', ['$event']) onClickDocument(event: Event) {
    const clickedSource = this.elRef.nativeElement.contains(event.target);

    if (!clickedSource) {
      // Clicked outside the source, hide the tooltip
      this.tooltipRef.instance.setVisibility(false);
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
