import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';
import { MapViewComponent } from './map-view/map-view.component';
import { StoryViewComponent } from './story-view/story-view.component';
import { ApisViewComponent } from './apis-view/apis-view.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: 'map', component: MapViewComponent },
      // { path: 'story', component: StoryViewComponent },
      { path: 'apis', component: ApisViewComponent },
      { path: '', redirectTo: '/map', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
