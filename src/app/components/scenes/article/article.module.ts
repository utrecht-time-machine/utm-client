import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleComponent } from './article.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [ArticleComponent],
  imports: [CommonModule, IonicModule],
})
export class ArticleModule {}
