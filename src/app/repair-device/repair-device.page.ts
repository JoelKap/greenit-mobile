import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DeviceService } from '../service/device.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as _ from 'lodash';

@Component({
  selector: 'app-repair-device',
  templateUrl: './repair-device.page.html',
  styleUrls: ['./repair-device.page.scss'],
})
export class RepairDevicePage implements OnInit {
  term = '';
  files = [];
  device: any;
  companies$: any;
  companies: any[] = [];
  companiesLodash: any[] = [];

  uploadProgress = 0;

  @ViewChild('previewimage') waterMarkImage: ElementRef;
  originalImage = null;
  blobImage = null;

  constructor(
    public loadingController: LoadingController,
    private deviceService: DeviceService,
    private storage: AngularFireStorage,
    private navCtrl: NavController,
    private toastController: ToastController,
    public firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    this.device = this.deviceService.getDocFromStore();
    if (_.isEmpty(this.device))
      return this.navCtrl.navigateForward([`/tabs/tab${1}`]);

    this.companies$ = this.deviceService.getRepairedCompanies();
    this.companies$.forEach((company) => {
      loading.dismiss();
      let arr = [];
      this.companies.length = 0;
      this.companiesLodash.length = 0;
      arr = company;
      // arr.forEach((company) => {
      //   debugger;
      //   this.storage
      //     .ref(`/deviceFiles/${company.companyId}`)
      //     .getDownloadURL()
      //     .toPromise()
      //     .then((url) => {
      //       if (url) {
      //         company.imageUrl = url;
      //       }
      //     });
      // });
      this.companiesLodash = _.orderBy(arr, ['createdAt'], ['desc']);
      this.companies.push.apply(this.companies, this.companiesLodash);
    });
  }

  recycle(company: any) {
    if (company) {
      this.device.isForSale = false;
      this.device.isFound = false;
      this.device.isDeleted = false;
      this.device.saleStatus = 'UNDER REPAIR';
      this.device.isUpdate = false;
      this.deviceService
        .updateDeviceFromSale(this.device)
        .then(async (resp) => {
          if (resp) {
            this.deviceService
              .saveRepairDevice(this.device, company)
              .then(async (res) => {
                if (res) {
                  const toast = await this.toastController.create({
                    message: 'device sent for repair successfully',
                    duration: 2000,
                  });
                  toast.present();
                  this.ngOnInit();
                } else {
                  alert(
                    'device couldnt be sent for repair, Please contact admin!'
                  );
                  console.log('device couldnt be sent for repair');
                }
              });
          } else {
            alert('device couldnt be sent for repair, Please contact admin!');
            console.log('device couldnt be recycled');
          }
        });

      this.ngOnInit();
    }
  }
}
