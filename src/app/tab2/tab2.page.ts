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
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  devices$: any;
  term = '';
  photo: any;
  pipe = new DatePipe('en-US');
  devices: any[] = [];
  devicesLodash: any[] = [];
  selectedDoc: any = {};
  seller = '';

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

    this.devices$ = this.deviceService.getMarketDevices();
    this.devices$.forEach((device) => {
      loading.dismiss();
      let arr = [];
      this.devices.length = 0;
      this.devicesLodash.length = 0;
      arr = device;
      arr.forEach((device) => {
        if (typeof device.createdAt === 'string') {
          device.createdAt;
        } else {
          device.createdAt = new Date(device.createdAt.seconds * 1000);
        }

        this.deviceService.getFoundBy(device.email).subscribe((user: any) => {
          this.seller = user[0].name + ' ' + user[0].lastname;
        });

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
  navigateToTab() {
    return;
  }

  async viewDevice(document: any) {
    this.selectedDoc = document;
    let email = localStorage.getItem('userEmail');
    if (document.email === email) {
      return new Promise((resolve, reject) => {
        const datePurchased = this.pipe.transform(
          document.datePurchased,
          'short'
        );
        this.alertController
          .create({
            header: document.documentType,
            message: `EMEI: ${document.imei}`,
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
              {
                text: 'Remove sale',
                handler: () => resolve(this.AddRemoveSaleDevice(document)),
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
          document.datePurchased,
          'short'
        );
        this.alertController
          .create({
            header: document.documentType,
            message: `EMEI: ${document.imei}`,
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
              {
                text: 'Contact seller',
                handler: () => resolve(this.contactBuyer(document)),
              },
            ],
          })
          .then((alert) => {
            alert.present();
          });
      });
    }
  }

  contactBuyer(device: any) {
    this.firestore
      .collection('users', (ref) =>
        ref.where('email', '==', localStorage.getItem('userEmail')).limit(1)
      )
      .get()
      .subscribe(async (user) => {
        if (user.size > 0) {
          this.saveMatchSale(device);
          //this.deviceService.saveDeviceToStore(document);
          this.router.navigateByUrl('/chat');
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

  chat() {
    this.navCtrl.navigateForward(['view-chats']);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  private saveMatchSale(device: any) {
    device.saleStatus = 'IN PROGRESS';
    device.isFound = true;
    this.deviceService.updateDeviceFromSale(device).then(async (resp) => {
      if (resp) {
        this.deviceService
          .getFoundBy(localStorage.getItem('userEmail'))
          .subscribe((users) => {
            if (users.length) {
              device.buyer = users[0].name + ' ' + users[0].lastname;
              device.isForSale = true;
              device.saleStatus = 'IN PROGRESS';
              device.isFound = true;
              device.email = localStorage.getItem('userEmail');
              device.deviceId = device.id;
              device.createdAt = new Date();
              this.deviceService.saveMatchSale(device).then(async (resp) => {
                if (resp) {
                  this.navCtrl.navigateForward(['view-chats']);
                  console.log('message sent successfully');
                } else {
                  console.log(
                    'Oopsy!, something went wrong, please contact admin'
                  );
                  alert('Oopsy!, something went wrong, please contact admin');
                }
              });
            }
          });
      } else {
        alert('something went wrong, please contact admin!');
        console.log('something went wrong, please contact admin!');
      }
    });
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

  AddRemoveSaleDevice(document: any) {
    document.isForSale = false;
    document.saleStatus = '';
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
    // document.isForSale = false;
    // document.saleStatus = '';
    // this.deviceService.saveMatchSale(document).then(async (resp) => {
    //   if (resp) {
    //     const toast = await this.toastController.create({
    //       message: 'updated successfully',
    //       duration: 2000,
    //     });
    //     toast.present();

    //     this.ngOnInit();
    //   } else {
    //     console.log('sales couldnt be removed');
    //   }
    // });
  }

  async viewPicture(document: any) {
    if (document) {
      localStorage.setItem('id', document.id);
      this.navCtrl.navigateForward(['view-picture']);
    }
  }
}
