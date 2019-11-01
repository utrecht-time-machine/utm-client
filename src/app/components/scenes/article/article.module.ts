import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleComponent } from './article.component';
import { IonicModule } from '@ionic/angular';
import { MarkdownModule } from 'ngx-markdown';
import { NgxAudioPlayerModule } from 'ngx-audio-player';

@NgModule({
  declarations: [ArticleComponent],
  imports: [
    CommonModule,
    IonicModule,
    MarkdownModule.forRoot(),
    NgxAudioPlayerModule,
  ],
})
export class ArticleModule {}
