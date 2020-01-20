import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { SourceTooltipComponent } from './source-tooltip.component';
import { NgxPopperModule } from 'ngx-popper';
import { CommonModule } from '@angular/common';
import { ShortenTextPipe } from '../../pipes/shorten-text.pipe';
import { ShortenTextModule } from '../../pipes/shorten-text.module';

@NgModule({
  imports: [IonicModule, NgxPopperModule, CommonModule, ShortenTextModule],
  declarations: [SourceTooltipComponent],
})
export class SourceTooltipModule {}
