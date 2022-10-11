import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewDeviceForRecyclePageRoutingModule } from './view-device-for-recycle-routing.module';

import { ViewDeviceForRecyclePage } from './view-device-for-recycle.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Ng2SearchPipeModule,
    ViewDeviceForRecyclePageRoutingModule,
  ],
  declarations: [ViewDeviceForRecyclePage],
})
export class ViewDeviceForRecyclePageModule {}
