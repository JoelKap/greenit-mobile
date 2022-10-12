import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepairDevicePageRoutingModule } from './repair-device-routing.module';

import { RepairDevicePage } from './repair-device.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Ng2SearchPipeModule,
    RepairDevicePageRoutingModule,
  ],
  declarations: [RepairDevicePage],
})
export class RepairDevicePageModule {}
