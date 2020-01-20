import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiSearchResultComponent } from './api-search-result.component';
import { ShortenTextModule } from '../../../shared/pipes/shorten-text.module';

@NgModule({
  declarations: [ApiSearchResultComponent],
  imports: [CommonModule, IonicModule, ShortenTextModule],
  exports: [ApiSearchResultComponent],
})
export class ApiSearchResultModule {}
