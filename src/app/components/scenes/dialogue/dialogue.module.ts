import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogueComponent } from './dialogue.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [DialogueComponent],
  imports: [CommonModule, IonicModule],
  exports: [DialogueComponent],
})
export class DialogueModule {}
