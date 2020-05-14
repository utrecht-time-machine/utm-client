import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgxPopperModule } from 'ngx-popper';
import { SourceModule } from '../../shared/source/source-component/source.module';
import { StoryInformationComponent } from './story-information.component';
import { StoryViewModule } from '../story-view/story-view.module';
import { StoryTagsComponent } from './story-tags/story-tags.component';
import { StoryTypeChipsComponent } from './story-type-chips/story-type-chips.component';
import { StoryAuthorsComponent } from './story-authors/story-authors.component';
import { StoryHeaderComponent } from './story-header/story-header.component';
import { StoryRecommendedRouteComponent } from './story-recommended-route/story-recommended-route.component';

@NgModule({
  declarations: [
    StoryInformationComponent,
    StoryTagsComponent,
    StoryTypeChipsComponent,
    StoryAuthorsComponent,
    StoryHeaderComponent,
    StoryRecommendedRouteComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    NgxPopperModule,
    SourceModule,
    StoryViewModule,
  ],
  exports: [StoryInformationComponent],
})
export class StoryInformationModule {}
