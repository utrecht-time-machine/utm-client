import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryViewComponent } from './story-view.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgxPopperModule } from 'ngx-popper';
import { TextWithSourcesDirective } from '../../shared/source/text-with-sources.directive';
import { SourceModule } from '../../shared/source/source-component/source.module';

@NgModule({
  declarations: [StoryViewComponent, TextWithSourcesDirective],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NgxPopperModule,
    SourceModule,
  ],
})
export class StoryViewModule {}
