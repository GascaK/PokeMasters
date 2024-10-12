import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { InfoComponent } from './components/info/info.component';
import { ActiveComponent } from './components/active/active.component';
import { PokedexComponent } from './components/pokedex/pokedex.component';
import { EncounterComponent } from './components/encounter/encounter.component';
import { ShopComponent } from './components/shop/shop.component';
import { BackpackComponent } from './components/backpack/backpack.component';
import { BattleComponent } from './components/battle/battle.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomepageComponent,
    InfoComponent,
    ActiveComponent,
    PokedexComponent,
    EncounterComponent,
    ShopComponent,
    BackpackComponent,
    BattleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
