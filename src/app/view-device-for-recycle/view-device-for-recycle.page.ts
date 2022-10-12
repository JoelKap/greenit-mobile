import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { DeviceService } from '../service/device.service';
import { AuthenticationService } from '../services/authentication.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-view-device-for-recycle',
  templateUrl: './view-device-for-recycle.page.html',
  styleUrls: ['./view-device-for-recycle.page.scss'],
})
export class ViewDeviceForRecyclePage implements OnInit {
  devices$: any;
  term = '';
  photo: any;
  pipe = new DatePipe('en-US');
  devices: any[] = [];
  devicesLodash: any[] = [];
  selectedDoc: any = {};
  company: any = {};

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

  async ngOnInit() {
    this.company = this.deviceService.getCompanyFromStore();
    if (_.isEmpty(this.company))
      return this.navCtrl.navigateForward([`/tabs/tab${3}`]);

    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    debugger;
    const email = localStorage.getItem('userEmail');
    this.devices$ = this.deviceService.getUserDevicesForRecycle(email);
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

  async recycleDevice(device: any) {
    device.isForSale = false;
    device.isFound = false;
    device.isDeleted = true;
    device.saleStatus = 'RECYCLED';
    device.isUpdate = false;
    this.deviceService.updateDeviceFromSale(device).then(async (resp) => {
      if (resp) {
        this.deviceService
          .saveRecycleDevice(device, this.company)
          .then(async (res) => {
            if (res) {
              const toast = await this.toastController.create({
                message: 'device recycled successfully',
                duration: 2000,
              });

              toast.present();
              this.ngOnInit();
            } else {
              console.log('device couldnt be recycled');
            }
          });
      } else {
        console.log('device couldnt be recycled');
      }
    });

    this.ngOnInit();
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
