import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditDevicePageRoutingModule } from './edit-device-routing.module';

import { EditDevicePage } from './edit-device.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditDevicePageRoutingModule
  ],
  declarations: [EditDevicePage]
})
export class EditDevicePageModule {}
