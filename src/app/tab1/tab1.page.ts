import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { DeviceService } from '../service/device.service';
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
    private deviceService: DeviceService,
    private toastController: ToastController
  ) {}

  async ngOnInit(): Promise<void> {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    const email = localStorage.getItem('userEmail');
    this.devices$ = this.deviceService.getUserDevices(email);
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

  async viewDevice(device: any) {
    this.selectedDoc = device;
    if (device.isForSale == false) {
      return new Promise((resolve, reject) => {
        const datePurchased = this.pipe.transform(
          device.datePurchased,
          'short'
        );
        const imeiSerial =
          device.imei === 'NO IMEI' ? device.serial : device.imei;
        this.alertController
          .create({
            header: device.documentType,
            message: `${imeiSerial}`,
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
                handler: () => resolve(this.viewPicture(device)),
              },
              {
                text: 'Edit',
                handler: () => resolve(this.editDevice(device)),
              },
              {
                text:
                  device.saleStatus === 'UNDER REPAIR'
                    ? 'Device under repair'
                    : device.saleStatus === 'CANT REPAIR'
                    ? `Feedback from repairer: ${device.comment}`
                    : 'Send for repair',
                handler: () => resolve(this.repairDevice(device)),
              },
              {
                text: device.saleStatus !== 'UNDER REPAIR' ? 'Add sale' : '',
                handler: () => resolve(this.AddRemoveSaleDevice(device, true)),
              },
            ],
          })
          .then((alert) => {
            alert.present();
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        const datePurchased = this.pipe.transform(
          device.datePurchased,
          'short'
        );
        const imeiSerial =
          device.imei === 'NO IMEI' ? device.serial : device.imei;
        this.alertController
          .create({
            header: device.documentType,
            message: `${imeiSerial}`,
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
                handler: () => resolve(this.viewPicture(device)),
              },
              {
                text: 'Edit',
                handler: () => resolve(this.editDevice(device)),
              },
              {
                text:
                  device.saleStatus === 'UNDER REPAIR'
                    ? 'Device under repair'
                    : device.saleStatus === 'CANT REPAIR'
                    ? `Feedback from repairer: ${device.comment}`
                    : 'Send for repair',
                handler: () => resolve(this.repairDevice(device)),
              },
              {
                text: device.saleStatus !== 'UNDER REPAIR' ? 'Remove sale' : '',
                handler: () => resolve(this.AddRemoveSaleDevice(device, false)),
              },
            ],
          })
          .then((alert) => {
            alert.present();
          });
      });
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  updateFoundDocument(val) {
    const type = 'found';
    if (val) {
      this.deviceService.checkIfUserProfile(
        localStorage.getItem('userEmail'),
        type,
        this.selectedDoc
      );
    }
    return;
  }

  AddRemoveSaleDevice(document: any, isForSale: boolean) {
    document.isForSale = isForSale;
    document.saleStatus = isForSale === true ? 'ON SALE' : '';
    this.deviceService.updateDeviceFromSale(document).then(async (resp) => {
      if (resp) {
        const toast = await this.toastController.create({
          message: 'updated successfully',
          duration: 2000,
        });
        toast.present();
        this.ngOnInit();
      } else {
        console.log('sales couldnt be removed');
      }
    });
  }

  editDevice(document: any) {
    if (document) {
      this.deviceService.saveDeviceToStore(document);
      this.navCtrl.navigateForward(['edit-device']);
    }
  }

  repairDevice(document: any) {
    if (document && !document.isForSale) {
      this.deviceService.saveDeviceToStore(document);
      this.navCtrl.navigateForward(['repair-device']);
    } else {
      return new Promise((resolve, reject) => {
        this.alertController
          .create({
            header: 'Device for sale',
            message: `Please note only device that is not under for sale, can be sent for repair`,
            buttons: [
              {
                text: 'OK',
                handler: () => resolve(this.navigateToTab()),
              },
            ],
          })
          .then((alert) => {
            alert.present();
          });
      });
    }
  }

  navigateToTab() {
    return;
  }

  info() {
    return new Promise((resolve, reject) => {
      this.alertController
        .create({
          header: 'Contact us',
          message: `<p>Tshepo </p> <p> C: 084 600 4672</p> <hr/> 
                    <p>Keo </p> <p> C: 083 952 1543</p> <hr/>
                    <p>Hellen </p> <p> C: 076 489 6399</p>`,
          buttons: [
            {
              text: 'OK',
              handler: () => resolve(this.navigateToTab()),
            },
          ],
        })
        .then((alert) => {
          alert.present();
        });
    });
  }

  async viewPicture(document: any) {
    if (document) {
      localStorage.setItem('id', document.id);
      this.navCtrl.navigateForward(['view-picture']);
    }
  }
}
