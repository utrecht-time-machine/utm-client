import { NgModule } from '@angular/core';
import { ApisViewComponent } from './apis-view.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiSearchResultModule } from './api-search-result/api-search-result.module';

@NgModule({
  declarations: [ApisViewComponent],
  imports: [CommonModule, IonicModule, FormsModule, ApiSearchResultModule],
})
export class ApisViewModule {}
