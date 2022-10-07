import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../environments/environment';

import { Tab1PageRoutingModule } from './tab1-routing.module';

import { AddLostItemPageModule } from '../add-device/add-device.module';
import { Camera } from '@ionic-native/camera/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    AddLostItemPageModule,
    Ng2SearchPipeModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [Camera],
  declarations: [Tab1Page],
})
export class Tab1PageModule {}
