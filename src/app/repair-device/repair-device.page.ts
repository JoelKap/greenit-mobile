import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  commentForm: FormGroup;
  companiesLodash: any[] = [];
  uploadProgress = 0;
  isSubmitting: boolean = false;

  @ViewChild('previewimage') waterMarkImage: ElementRef;
  originalImage = null;
  blobImage = null;

  constructor(
    public loadingController: LoadingController,
    private deviceService: DeviceService,
    private storage: AngularFireStorage,
    private navCtrl: NavController,
    private toastController: ToastController,
    public alertController: AlertController,
    public firestore: AngularFirestore,
    private fb: FormBuilder,
  ) {
    
  }

  async ngOnInit() {
    this.createCommentForm();

    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    this.device = this.deviceService.getDeviceFromStore();
    if (_.isEmpty(this.device))
      return this.navCtrl.navigateForward([`/tabs/tab${1}`]);

    this.companies$ = this.deviceService.getRepairedCompanies();
    this.companies$.forEach((company) => {
      loading.dismiss();
      let arr = [];
      this.companies.length = 0;
      this.companiesLodash.length = 0;
      arr = company;
      arr.forEach((company) => {
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

  private createCommentForm() {
    this.commentForm = this.fb.group({
      comment: [''],
    });
  }

  save(){
    this.isSubmitting = true;
  }

  companyInfo(company: any) {
      return new Promise((resolve, reject) => {
        this.alertController
          .create({
            header: 'Services',
            message: `<p>${company.address} </p> <hr/> 
                      <p>${company.services}</p> <hr/>`,
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

  async repair(company: any) {

    if(!this.commentForm.controls.comment.value)
        return;

    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();

    if (company) {
      this.device.isFound = false;
      this.device.isUpdate = false;
      this.device.isDeleted = false;
      this.device.isForSale = false;
      this.device.emailSent = false;
      this.device.saleStatus = 'UNDER REPAIR';
      this.device.comment = this.commentForm.controls.comment.value;
      this.device.deviceId = this.device.id;
      this.deviceService.saveMatchSale(this.device).then(async (resp) => {
        if (resp) {
          this.deviceService
            .saveRepairDevice(this.device, company)
            .then(async (res) => {
              if (res) {
                alert(
                  'device repair requested successfully, Please note an email confirmation will be sent to your registered email'
                );
                loading.dismiss();
                return this.navCtrl.navigateForward([`/tabs/tab${1}`]);
              } else {
                loading.dismiss();
                alert(
                  'device couldnt be sent for repair, Please contact admin!'
                );
              }
              loading.dismiss();
            });
        } else {
          loading.dismiss();
          alert('device couldnt be sent for repair, Please contact admin!');
        }
      });

      this.ngOnInit();
    }
  }
}
