import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { tryCatch } from 'rxjs/internal-compatibility';

@Component({
  selector: 'utm-source-tooltip',
  templateUrl: './source-tooltip.component.html',
  styleUrls: ['./source-tooltip.component.scss'],
})
export class SourceTooltipComponent implements OnInit {
  @Input() source = '';
  @Input() author = '';
  @Input() date = '';

  public mouseIsOverElem = false;
  private fadeSpeed = 0.15;
  private hideAfterFading: ReturnType<typeof setTimeout>;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {}

  @HostListener('mouseenter', ['$event']) onMouseEnter(event: Event) {
    this.mouseIsOverElem = true;
  }

  @HostListener('mouseleave', ['$event']) onMouseLeave(event: Event) {
    this.mouseIsOverElem = false;
  }

  @HostListener('click', ['$event']) onClick(event: Event) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event']) onClickDocument(event: Event) {
    const clickedTooltip = this.elRef.nativeElement.contains(event.target);

    if (!clickedTooltip) {
      this.setVisibility(false);
    }
  }

  public setVisibility(visible: boolean, immediate: boolean = false) {
    const elem = this.elRef.nativeElement;

    // Enable animation
    this.renderer.addClass(elem, 'animated');

    // Cancel current animations
    this.renderer.removeClass(elem, 'fadeIn');
    this.renderer.removeClass(elem, 'fadeOut');
    clearTimeout(this.hideAfterFading);

    // Set fading speed (in seconds)
    this.renderer.setStyle(elem, 'animation-duration', this.fadeSpeed + 's');

    // Start animation
    this.renderer.addClass(elem, visible ? 'fadeIn' : 'fadeOut');

    // Show/hide the tooltip
    if (visible) {
      // Show tooltip
      this.renderer.setStyle(elem, 'display', 'block');
    } else {
      // Hide tooltip after fadeout
      this.hideAfterFading = setTimeout(
        () => {
          this.renderer.setStyle(elem, 'display', 'none');
        },
        immediate ? 0 : this.fadeSpeed * 1000
      );
    }
  }
}
