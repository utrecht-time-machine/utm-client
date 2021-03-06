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
import { SourceTooltipService } from '../../../services/source-tooltip.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MetadataService } from '../../../services/APIs/metadata.service';

@Directive({
  selector: '[utmSource]',
})
export class SourceDirective implements OnInit, OnDestroy {
  @Input() sourceUrl: string;
  @Input() container: HTMLElement;

  private tooltipRef: ComponentRef<SourceTooltipComponent>;
  private tooltipPopper: Popper;
  private timeBeforeHidingTooltip = 200; // ms
  private tryToHideTooltipLoop: ReturnType<typeof setInterval>;

  private repositionPopperInterval = 25; // ms
  private repositionPopperLoop: ReturnType<typeof setInterval>;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vc: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private tooltipService: SourceTooltipService,
    private deviceService: DeviceDetectorService,
    private metadataService: MetadataService
  ) {}

  ngOnInit() {
    this.underlineSource();
  }

  ngOnDestroy() {
    if (this.tooltipRef) {
      this.tooltipService.removeTooltip(this.tooltipRef);
      this.tooltipRef.destroy();
    }
    if (this.tooltipPopper) {
      this.tooltipPopper.destroy();
    }
  }

  private createTooltip() {
    if (this.tooltipRef) {
      return;
    }

    // Create tooltip based on tooltip component
    const tooltipFactory: ComponentFactory<SourceTooltipComponent> = this.componentFactoryResolver.resolveComponentFactory(
      SourceTooltipComponent
    );
    this.tooltipRef = this.vc.createComponent(tooltipFactory);

    // Save the tooltip reference
    this.tooltipService.addTooltip(this.tooltipRef);

    // Set the source for the tooltip
    this.tooltipRef.instance.source = this.sourceUrl;

    this.createTooltipPopper();

    this.metadataService
      .getMetadata(this.sourceUrl)
      .then(res => {
        this.tooltipRef.instance.metadata = res;

        // Re-position the popper since new data has been added
        this.tooltipPopper.scheduleUpdate();
      })
      .catch(err => {
        console.warn(err);
        this.tooltipRef.instance.metadata = {};
      });

    // Hide the tooltip
    this.tooltipRef.instance.setVisibility(false, true);
  }

  private createTooltipPopper() {
    if (!this.tooltipRef) {
      return;
    }

    // Use Popper to place the tooltip in the right place relative to the source element
    this.tooltipPopper = new Popper(
      this.elRef.nativeElement,
      this.tooltipRef.location.nativeElement,
      {
        placement: 'top',
        modifiers: {
          preventOverflow: {
            enabled: true,
            boundariesElement: this.container ? this.container : 'viewport',
          },
        },
      }
    );

    this.startTooltipRepositioningLoop();
    this.tooltipPopper.enableEventListeners();
  }

  private stopTooltipRepositioningLoop() {
    clearInterval(this.repositionPopperLoop);
  }

  private startTooltipRepositioningLoop() {
    this.stopTooltipRepositioningLoop();

    this.repositionPopperLoop = setInterval(() => {
      if (this.tooltipRef.instance.isVisible) {
        this.tooltipPopper.scheduleUpdate();
      }
    }, this.repositionPopperInterval);
  }

  private showTooltip() {
    this.stopHidingTooltip();
    this.startTooltipRepositioningLoop();
    this.createTooltip();
    this.tooltipService.showTooltip(this.tooltipRef);
  }

  private stopHidingTooltip() {
    clearInterval(this.tryToHideTooltipLoop);
  }

  private hideTooltip() {
    this.tooltipService.hideTooltip(this.tooltipRef);
    this.stopHidingTooltip();
    this.stopTooltipRepositioningLoop();
  }

  private underlineSource() {
    const elem = this.elRef.nativeElement;
    this.renderer.setStyle(elem, 'text-decoration-line', 'underline');
    this.renderer.setStyle(elem, 'font-style', 'italic');
    this.renderer.setStyle(elem, 'cursor', 'pointer');
    this.renderer.setStyle(elem, 'text-decoration-color', '#157dbf');
    this.renderer.setStyle(elem, 'text-decoration-style', 'double'); // solid, wavy, dotted, dashed, double
  }

  @HostListener('mouseenter', ['$event']) onMouseEnter(event: Event) {
    if (!this.deviceService.isDesktop()) {
      // Only enable hover on desktop devices
      return;
    }

    this.showTooltip();
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(event: Event) {
    if (!this.deviceService.isDesktop()) {
      // Only enable hover on desktop devices
      return;
    }

    this.stopHidingTooltip();

    // Keep trying to hide the tooltip
    this.tryToHideTooltipLoop = setInterval(() => {
      if (this.tooltipRef && !this.tooltipRef.instance.mouseIsOverElem) {
        // Only hide the tooltip if the cursor is not on the element
        this.hideTooltip();
      }
    }, this.timeBeforeHidingTooltip);
  }

  @HostListener('click', ['$event']) onClick(event: Event) {
    this.showTooltip();

    event.stopPropagation();
  }

  @HostListener('document:click', ['$event']) onClickDocument(event: Event) {
    const clickedOnSource = this.elRef.nativeElement.contains(event.target);

    if (!clickedOnSource) {
      this.hideTooltip();
    }
  }
}
