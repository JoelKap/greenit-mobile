import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { LostItemService } from '../service/device.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  isFoundUser = false;
  foundDocs = [];
  constructor(
    private router: Router,
    public modalController: ModalController,
    public alertController: AlertController,
    public loadingController: LoadingController
  ) {}

  async ngOnInit(): Promise<void> {}
}
