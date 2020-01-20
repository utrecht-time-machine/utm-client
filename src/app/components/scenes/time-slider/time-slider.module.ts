import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TimeSliderComponent } from './time-slider.component';
import { TimeSliderDirective } from './time-slider.directive';

@NgModule({
  declarations: [TimeSliderComponent, TimeSliderDirective],
  imports: [CommonModule, IonicModule],
})
export class TimeSliderModule {}
