import { NgModule } from '@angular/core';
import { ShortenTextPipe } from './shorten-text.pipe';

@NgModule({
  imports: [],
  declarations: [ShortenTextPipe],
  exports: [ShortenTextPipe],
})
export class ShortenTextModule {}
