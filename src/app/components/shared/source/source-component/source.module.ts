import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceDirective } from '../source.directive';
import { SourceComponent } from './source.component';

@NgModule({
  declarations: [SourceDirective, SourceComponent],
  imports: [CommonModule],
  exports: [SourceDirective, SourceComponent],
})
export class SourceModule {}
