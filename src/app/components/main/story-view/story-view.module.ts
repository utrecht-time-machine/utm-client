import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryViewComponent } from './story-view.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [StoryViewComponent],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class StoryViewModule {}
