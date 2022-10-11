import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewChatsPage } from './view-chats.page';

const routes: Routes = [
  {
    path: '',
    component: ViewChatsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewChatsPageRoutingModule {}
