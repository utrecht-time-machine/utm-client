import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { SourceTooltipComponent } from './source-tooltip.component';
import { NgxPopperModule } from 'ngx-popper';
import { CommonModule } from '@angular/common';
import { ShortenTextPipe } from '../../pipes/shorten-text.pipe';

@NgModule({
  imports: [IonicModule, NgxPopperModule, CommonModule],
  declarations: [SourceTooltipComponent, ShortenTextPipe],
})
export class SourceTooltipModule {}
