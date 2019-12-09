import { ComponentRef, ElementRef, Injectable } from '@angular/core';
import { SourceTooltipComponent } from '../components/shared/source/source-tooltip/source-tooltip.component';

@Injectable({
  providedIn: 'root',
})
export class SourceTooltipService {
  private tooltips: ComponentRef<SourceTooltipComponent>[] = [];

  public addTooltip(tooltip: ComponentRef<SourceTooltipComponent>) {
    this.tooltips.push(tooltip);
  }

  public removeTooltip(tooltip: ComponentRef<SourceTooltipComponent>) {
    const tooltipIdx = this.tooltips.indexOf(tooltip);
    if (tooltipIdx !== -1) {
      this.tooltips.splice(tooltipIdx, 1);
    }
  }

  public showTooltip(tooltip: ComponentRef<SourceTooltipComponent>) {
    const tooltipIdx = this.tooltips.indexOf(tooltip);
    if (tooltipIdx === -1) {
      // Tooltip does not exist
      return;
    }

    // Hide all other tooltips, and show this one
    for (let idx = 0; idx < this.tooltips.length; idx++) {
      const currentTooltip = this.tooltips[idx].instance;
      const showThisTooltip = idx === tooltipIdx;
      currentTooltip.setVisibility(showThisTooltip);
    }
  }
}
