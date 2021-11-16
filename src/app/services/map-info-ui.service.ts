import { Injectable } from '@angular/core';
import { RoutesService } from './routes.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root',
})
export class MapInfoUIService {
  public readonly mapInfoNavBarHeight = 64; // pixels
  private readonly mapInfoHeights = {
    mobile: { noDetails: 320, details: 420 },
    nonMobile: { noDetails: 320, details: 420 },
  };
  public detailsShown = false;

  constructor(
    private routes: RoutesService,
    private device: DeviceDetectorService
  ) {}

  public toggleDetailsVisibility() {
    this.detailsShown = !this.detailsShown;
  }

  public getMapInfoElemHeight(): number {
    if (this.device.isMobile()) {
      return this.detailsShown
        ? this.mapInfoHeights.mobile.details
        : this.mapInfoHeights.mobile.noDetails;
    }

    return this.detailsShown
      ? this.mapInfoHeights.nonMobile.details
      : this.mapInfoHeights.nonMobile.noDetails;
  }
}
