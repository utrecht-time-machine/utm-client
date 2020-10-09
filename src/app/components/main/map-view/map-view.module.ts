import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from './map-view.component';
import { IonicModule } from '@ionic/angular';
import { RouteSelectionOverlayComponent } from './route-selection-overlay/route-selection-overlay.component';
import { RouteInformationComponent } from './route-information/route-information.component';
import { StoryViewModule } from '../story-view/story-view.module';
import { SourceModule } from '../../shared/source/source-component/source.module';
import { StoryInformationModule } from '../story-information/story-information.module';
import { InventoryButtonComponent } from './inventory-button/inventory-button.component';

@NgModule({
  declarations: [
    MapViewComponent,
    RouteSelectionOverlayComponent,
    RouteInformationComponent,
    InventoryButtonComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    StoryViewModule,
    SourceModule,
    StoryInformationModule,
  ],
})
export class MapViewModule {}
