import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewDeviceForRecyclePage } from './view-device-for-recycle.page';

const routes: Routes = [
  {
    path: '',
    component: ViewDeviceForRecyclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewDeviceForRecyclePageRoutingModule {}
