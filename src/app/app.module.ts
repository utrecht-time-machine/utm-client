import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { DialogueModule } from './components/scenes/dialogue/dialogue.module';
import { ArticleModule } from './components/scenes/article/article.module';

import 'hammerjs';
import { NgxPopperModule } from 'ngx-popper';
import { SourceTooltipModule } from './components/shared/source/source-tooltip/source-tooltip.module';
import { SourceTooltipComponent } from './components/shared/source/source-tooltip/source-tooltip.component';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [SourceTooltipComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ArticleModule,
    DialogueModule,
    SourceTooltipModule,
    NgxPopperModule.forRoot({}),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
