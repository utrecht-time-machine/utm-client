import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from './map-view.component';
import { IonicModule } from '@ionic/angular';
import { RoutesOverlayComponent } from '../routes-overlay/routes-overlay.component';

@NgModule({
  declarations: [MapViewComponent, RoutesOverlayComponent],
  imports: [CommonModule, IonicModule],
})
export class MapViewModule {}
