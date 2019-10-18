import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';
import { MapViewComponent } from './map-view/map-view.component';
import { ExploreViewComponent } from './explore-view/explore-view.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: 'map', component: MapViewComponent },
      { path: 'explore', component: ExploreViewComponent },
      { path: '', redirectTo: '/map', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
