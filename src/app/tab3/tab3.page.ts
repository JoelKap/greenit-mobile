import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DeviceService } from '../service/device.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as _ from 'lodash';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  term = '';
  files = [];
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
    public alertController: AlertController,
    public firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    this.companies$ = this.deviceService.getCompanies();
    this.companies$.forEach((company) => {
      loading.dismiss();
      let arr = [];
      this.companies.length = 0;
      this.companiesLodash.length = 0;
      arr = company;
      arr.forEach((company) => {
        debugger;
        this.storage
          .ref(`/deviceFiles/${company.companyId}`)
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            if (url) {
              company.imageUrl = url;
            }
          });
      });
      this.companiesLodash = _.orderBy(arr, ['createdAt'], ['desc']);
      this.companies.push.apply(this.companies, this.companiesLodash);
    });
  }

  recycle(company: any) {
    if (company) {
      this.deviceService.saveCompanyToStore(company);
      this.navCtrl.navigateForward(['view-device-for-recycle']);
    }
  }

  info() {
    return new Promise((resolve, reject) => {
      this.alertController
        .create({
          header: 'Contact us',
          message: `<p>Tsepo </p> <p> C: 084 600 4672</p> <hr/> 
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
}
