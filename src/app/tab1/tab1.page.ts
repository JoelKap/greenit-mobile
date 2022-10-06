import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { LostItemService } from '../service/device.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AuthenticationService } from '../services/authentication.service';
import * as _ from 'lodash';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  devices$: any;
  term = '';
  photo: any;
  pipe = new DatePipe('en-US');
  devices: any[] = [];
  devicesLodash: any[] = [];
  selectedDoc: any = {};
  constructor(
    public firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private navCtrl: NavController,
    private router: Router,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private authService: AuthenticationService,
    private lostServ: LostItemService
  ) {}

  async ngOnInit(): Promise<void> {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    const email = localStorage.getItem('userEmail');
    this.devices$ = this.lostServ.getUserDevices(email);
    this.devices$.forEach((device) => {
      loading.dismiss();
      let arr = [];
      this.devices.length = 0;
      this.devicesLodash.length = 0;
      arr = device;
      arr.forEach((device) => {
        this.storage
          .ref(`/deviceFiles/${device.id}`)
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            if (url) {
              device.imageUrl = url;
            }
          });
      });
      this.devicesLodash = _.orderBy(arr, ['createdAt'], ['desc']);
      this.devices.push.apply(this.devices, this.devicesLodash);
    });
  }

  async addDevice() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    this.firestore
      .collection('users', (ref) =>
        ref.where('email', '==', localStorage.getItem('userEmail')).limit(1)
      )
      .get()
      .subscribe(async (user) => {
        if (user.size > 0) {
          return this.router.navigateByUrl('/add-lost-item');
        } else {
          return new Promise((resolve, reject) => {
            this.alertController
              .create({
                header: 'User Profile',
                message:
                  'It appears we needs more of your info, Please click ok to proceed',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => resolve(this.navigateTo()),
                  },
                ],
              })
              .then((alert) => {
                alert.present();
              });
          });
        }
      });
  }

  navigateTo() {
    this.router.navigateByUrl('/user-more-info');
  }

  async viewDevice(document: any) {
    this.selectedDoc = document;
    return new Promise((resolve, reject) => {
      const datePurchased = this.pipe.transform(
        document.datePurchased,
        'short'
      );
      this.alertController
        .create({
          header: document.documentType,
          message: `Condition: ${document.deviceCondition}
          Emei: ${document.imei}
          Date purchased: ${datePurchased}`,
          buttons: [
            {
              text: 'Close',
              role: 'cancel',
              cssClass: 'primary',
              handler: () => reject(this.updateFoundDocument(false)),
            },
            {
              text: 'View',
              role: 'Pictures',
              cssClass: 'secondary',
              handler: () => resolve(this.viewPicture(document)),
            },
          ],
        })
        .then((alert) => {
          alert.present();
        });
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  updateFoundDocument(val) {
    const type = 'found';
    if (val) {
      this.lostServ.checkIfUserProfile(
        localStorage.getItem('userEmail'),
        type,
        this.selectedDoc
      );
    }
    return;
  }

  async viewPicture(document: any) {
    if (document) {
      localStorage.setItem('id', document.id);
      this.navCtrl.navigateForward(['view-picture']);
    }
  }
}
