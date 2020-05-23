import { Injectable } from '@angular/core';
import { RoutesService } from './routes.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({
  providedIn: 'root',
})
export class MapInfoUIService {
  public readonly mapInfoNavBarHeight = 64; // pixels
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
      return this.detailsShown ? 340 : 220;
    }

    return this.detailsShown ? 400 : 300;
  }
}
