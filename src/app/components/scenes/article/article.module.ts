import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleComponent } from './article.component';
import { IonicModule } from '@ionic/angular';
import { MarkdownModule } from 'ngx-markdown';
import { VgCoreModule } from 'videogular2/compiled/src/core/core';
import { VgControlsModule } from 'videogular2/compiled/src/controls/controls';

@NgModule({
  declarations: [ArticleComponent],
  imports: [
    CommonModule,
    IonicModule,
    MarkdownModule.forRoot(),
    VgCoreModule,
    VgControlsModule,
  ],
})
export class ArticleModule {}
