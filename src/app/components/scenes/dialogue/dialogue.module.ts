import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogueComponent } from './dialogue.component';
import { IonicModule } from '@ionic/angular';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [DialogueComponent],
  imports: [CommonModule, IonicModule, MarkdownModule],
  exports: [DialogueComponent],
})
export class DialogueModule {}
