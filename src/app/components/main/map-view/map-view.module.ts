import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from './map-view.component';
import { IonicModule } from '@ionic/angular';
import { RouteSelectionOverlayComponent } from '../route-selection-overlay/route-selection-overlay.component';
import { RouteInformationComponent } from '../route-information/route-information.component';

@NgModule({
  declarations: [
    MapViewComponent,
    RouteSelectionOverlayComponent,
    RouteInformationComponent,
  ],
  imports: [CommonModule, IonicModule],
})
export class MapViewModule {}
