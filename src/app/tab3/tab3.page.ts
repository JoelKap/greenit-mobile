import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
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
      //localStorage.setItem('id', document.id);
      this.deviceService.saveCompanyToStore(company);
      this.navCtrl.navigateForward(['view-device-for-recycle']);
    }
  }
}
