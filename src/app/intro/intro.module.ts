import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { IntroPageRoutingModule } from './intro-routing.module';
import { IntroPage } from './intro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    Ng2SearchPipeModule,
    IntroPageRoutingModule,
  ],
  declarations: [IntroPage],
})
export class IntroPageModule {}
