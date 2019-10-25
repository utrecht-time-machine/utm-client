import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryViewComponent } from './story-view.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DialogueModule } from '../../scenes/dialogue/dialogue.module';

@NgModule({
  declarations: [StoryViewComponent],
  imports: [CommonModule, IonicModule, FormsModule, DialogueModule],
})
export class StoryViewModule {}
