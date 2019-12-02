import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryViewComponent } from './story-view.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SourceDirective } from '../../shared/source/source.directive';
import { NgxPopperModule } from 'ngx-popper';

@NgModule({
  declarations: [StoryViewComponent, SourceDirective],
  imports: [CommonModule, IonicModule, FormsModule, NgxPopperModule],
})
export class StoryViewModule {}
