import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { SourceTooltipComponent } from './source-tooltip.component';
import { NgxPopperModule } from 'ngx-popper';

@NgModule({
  imports: [IonicModule, NgxPopperModule],
  declarations: [SourceTooltipComponent],
})
export class SourceTooltipModule {}
