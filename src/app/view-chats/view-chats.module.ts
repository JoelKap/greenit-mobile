import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewChatsPageRoutingModule } from './view-chats-routing.module';

import { ViewChatsPage } from './view-chats.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    Ng2SearchPipeModule,
    ViewChatsPageRoutingModule,
  ],
  declarations: [ViewChatsPage],
})
export class ViewChatsPageModule {}
