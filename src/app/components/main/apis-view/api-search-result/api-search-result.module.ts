import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiSearchResultComponent } from './api-search-result.component';

@NgModule({
  declarations: [ApiSearchResultComponent],
  imports: [CommonModule, IonicModule],
  exports: [ApiSearchResultComponent],
})
export class ApiSearchResultModule {}
