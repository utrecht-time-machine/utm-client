import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs.router.module';

import { TabsPage } from './tabs.page';
import { ExploreViewModule } from './explore-view/explore-view.module';
import { MapViewModule } from './map-view/map-view.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    ExploreViewModule,
    MapViewModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
