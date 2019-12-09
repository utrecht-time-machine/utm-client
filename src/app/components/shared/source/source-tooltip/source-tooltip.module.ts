import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { SourceTooltipComponent } from './source-tooltip.component';
import { NgxPopperModule } from 'ngx-popper';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [IonicModule, NgxPopperModule, CommonModule],
  declarations: [SourceTooltipComponent],
})
export class SourceTooltipModule {}
