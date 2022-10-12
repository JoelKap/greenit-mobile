import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RepairDevicePage } from './repair-device.page';

const routes: Routes = [
  {
    path: '',
    component: RepairDevicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepairDevicePageRoutingModule {}
