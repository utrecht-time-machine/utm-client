import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ArticleComponent } from './components/scenes/article/article.component';
import { DialogueComponent } from './components/scenes/dialogue/dialogue.component';

const routes: Routes = [
  { path: 'article', component: ArticleComponent },
  { path: 'dialogue', component: DialogueComponent },
  {
    path: '',
    loadChildren: () =>
      import('./components/main/tabs.module').then(m => m.TabsPageModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
