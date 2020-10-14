import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from './map-view.component';
import { IonicModule } from '@ionic/angular';
import { StoryViewModule } from '../story-view/story-view.module';
import { SourceModule } from '../../shared/source/source-component/source.module';
import { InventoryButtonComponent } from './inventory-button/inventory-button.component';
import { MarkerPopupComponent } from './marker-popup/marker-popup.component';

@NgModule({
  declarations: [MapViewComponent, InventoryButtonComponent, MarkerPopupComponent],
  imports: [CommonModule, IonicModule, StoryViewModule, SourceModule],
})
export class MapViewModule {}
