import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CardComponent } from './generated/figma-relay-card/figma-relay-card.component';
import { CounterComponent } from './generated/figma-relay-counter/figma-relay-counter.component';
import { HelloCardComponent } from './generated/figma-relay-hello-card/figma-relay-hello-card.component';
import { PolygonComponent } from './generated/figma-relay-polygon/figma-relay-polygon.component';
import { StarComponent } from './generated/figma-relay-star/figma-relay-star.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloCardComponent,
    CounterComponent,
    StarComponent,
    PolygonComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
