import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AlertController,
  IonSlides,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DeviceService } from '../service/device.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit, OnDestroy {
  term = '';
  @ViewChild(IonSlides) slides: IonSlides;
  segment: string;
  page: number;
  //@ViewChild(Content) content: Content;
  deviceHistoryForm: FormGroup;
  subscription: Subscription;
  files = [];
  articles = [
    { title: 'Star Recycling Company', image: '', timestamp: new Date() },
    { title: 'Remade Recycling (TSH)', image: '', timestamp: new Date() },
    {
      title: 'Universal Recycling Company (Pty) Ltd',
      image: '',
      timestamp: new Date(),
    },
    { title: 'Interwaste (Pty) Ltd', image: '', timestamp: new Date() },
    { title: 'Desco Electronic Recyclers', image: '', timestamp: new Date() },
    { title: 'ECOmonkey Recycling', image: '', timestamp: new Date() },
    { title: 'Mpact Recycling Tulisa Park', image: '', timestamp: new Date() },
    {
      title: 'Gauteng Waste Recycling (Pty) Ltd',
      image: '',
      timestamp: new Date(),
    },
    { title: 'Sappi Refibre', image: '', timestamp: new Date() },
    { title: 'CITY RECYCLERS', image: '', timestamp: new Date() },
    { title: 'Primo Recycling', image: '', timestamp: new Date() },
  ];
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
    public alertController: AlertController,
    private fb: FormBuilder,
    private router: Router,
    public firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.createdeviceHistoryForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createdeviceHistoryForm() {
    this.deviceHistoryForm = this.fb.group({
      search: [''],
    });
  }

  async search() {
    const value = this.deviceHistoryForm.controls.search.value;
    if (value) {
      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Please wait...',
        duration: 2000,
      });
      await loading.present();
      var result = this.deviceService
        .searchDeviceHistory(value)
        .get()
        .pipe(
          map((item: any) => {
            return item.docs.map((dataItem: any) => dataItem.data());
          })
        );

      result.subscribe((resp) => {
        loading.dismiss();
        if (resp.length) {
          return this.setResponse(resp[0], value);
        } else {
          var response = this.deviceService
            .searchDeviceSerial(value)
            .get()
            .pipe(
              map((item: any) => {
                return item.docs.map((dataItem: any) => dataItem.data());
              })
            );

          response.subscribe((resp) => {
            if (resp.length) {
              return this.setResponse(resp[0], value);
            } else {
              return this.checkAgain(value);
            }
          });
        }
      });
    }
  }

  checkAgain(value: any) {
    return new Promise((resolve, reject) => {
      this.alertController
        .create({
          header: 'Device History',
          message: `This searched device ${value} has not been reported!`,
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

  async login() {
    this.router.navigateByUrl('/login');
  }

  setResponse(resp: any, value: any) {
    const device = resp;
    if (device.status === 'LOST' || device.status === 'STOLEN') {
      return new Promise((resolve, reject) => {
        this.alertController
          .create({
            header: 'Device History',
            message: `This searched device ${value} has been reported ${device.status}`,
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
    } else {
      return new Promise((resolve, reject) => {
        this.alertController
          .create({
            header: 'Device History',
            message: `This searched device ${value} has not been reported!`,
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
  }

  navigateTo() {
    return;
  }

  next() {
    this.slides.slideNext();
  }

  previous() {
    this.slides.slidePrev();
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
}
