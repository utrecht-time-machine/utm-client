import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';
import { MapViewComponent } from './map-view/map-view.component';
import { StoryViewComponent } from './story-view/story-view.component';
import { ArticleComponent } from '../scenes/article/article.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: 'map', component: MapViewComponent },
      { path: 'story', component: StoryViewComponent },
      { path: 'article', component: ArticleComponent },
      { path: '', redirectTo: '/map', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
