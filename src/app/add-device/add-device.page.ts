import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { map, take } from 'rxjs/operators';
import { DeviceService } from '../service/device.service';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.page.html',
  styleUrls: ['./add-device.page.scss'],
})
export class AddDevicePage implements OnInit, OnDestroy {
  users$: any;
  isMobile: boolean;
  isElectrical: boolean;
  isElectricalSubCat: boolean;
  deviceForm: FormGroup;
  selectedDeviceType: any;
  selectedDeviceSubCat: any;
  selectedDeviceBrand: any;
  selectedDeviceStatus: any;
  selectedDeviceWarranty: any;
  selectedDeviceCondition: any;
  selectedIsForSale: any;

  constructor(
    public firestore: AngularFirestore,
    private camera: Camera,
    private navCtrl: NavController,
    public alertController: AlertController,
    private storage: AngularFireStorage,
    public modalController: ModalController,
    private fb: FormBuilder,
    public loadingController: LoadingController,
    private deviceService: DeviceService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.deviceForm = this.fb.group({
      deviceBrand: [''],
      deviceCondition: [''],
      status: [''],
      warranty: [''],
      owner: [''],
      datePurchased: [''],
      createdAt: [''],
      deviceModel: [''],
      price: [''],
      imei: [''],
      description: [''],
      isDeleted: [Boolean],
      isFound: [Boolean],
      isForSale: [Boolean],
      saleStatus: [''],
      email: [''],
      deviceType: [''],
      deviceSubCat: [''],
      serial: [''],
    });
  }

  ngOnDestroy(): void {
    if (this.users$ !== undefined) {
      this.users$.unsubscribe();
    }
  }

  async saveDevice() {
    debugger;
    this.deviceForm.controls['deviceBrand'].setValue(this.selectedDeviceBrand);
    this.deviceForm.controls['deviceCondition'].setValue(
      this.selectedDeviceCondition
    );
    this.deviceForm.controls['deviceType'].setValue(this.selectedDeviceType);
    this.deviceForm.controls['deviceSubCat'].setValue(
      this.selectedDeviceSubCat
    );
    this.deviceForm.controls['createdAt'].setValue(new Date());
    this.deviceForm.controls['status'].setValue('');
    this.deviceForm.controls['warranty'].setValue(this.selectedDeviceWarranty);
    this.deviceForm.controls['isDeleted'].setValue(false);
    this.deviceForm.controls['isFound'].setValue(false);
    this.deviceForm.controls['isForSale'].setValue(this.selectedIsForSale);
    this.deviceForm.controls['saleStatus'].setValue(
      this.selectedIsForSale === true ? 'ON SALE' : ''
    );
    this.deviceForm.controls['owner'].setValue('');
    this.deviceForm.controls['email'].setValue(
      localStorage.getItem('userEmail')
    );
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    const subs$ = this.deviceService.getFoundBy(
      localStorage.getItem('userEmail')
    );
    this.users$ = subs$.pipe(take(1)).subscribe((users) => {
      const id = this.firestore.createId();
      this.deviceForm.controls['owner'].setValue(
        users[0].name + ' ' + users[0].lastname
      );

      var imei = this.deviceForm.controls.imei.value;
      var exist = this.firestore
        .collection<any>(`devices`, (ref) => {
          return ref.where('imei', '==', imei).limit(1);
        })
        .get()
        .pipe(
          map((item: any) => {
            return item.docs.map((dataItem: any) => dataItem.data());
          })
        );

      exist.toPromise().then((res: any) => {
        if (res.length) {
          if (res[0].status === 'LOST' || res[0].status === 'STOLEN') {
            //Let user know taht device is already been registered on the platform and reported lost or stolen
            return new Promise((resolve, reject) => {
              this.alertController
                .create({
                  header: 'Lost/Stolen Device',
                  message: `It appear that this device may be in pocession of the wrong person, please contact the owner of this device on ${res[0].email}`,
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
            //HARD delete existing device details and register new user
            this.deviceService.deleteDevice(res[0]).then((resp) => {
              if (resp) {
                this.firestore
                  .doc(`devices/${id}`)
                  .set({
                    id,
                    ...this.deviceForm.value,
                  })
                  .then(async (res) => {
                    loading.dismiss();
                    this.initializePreview(id);
                  });
              } else {
                alert('Oopsy! Please contact our system admin');
              }
            });
          }
        } else {
          this.firestore
            .doc(`devices/${id}`)
            .set({
              id,
              ...this.deviceForm.value,
            })
            .then((res) => {
              loading.dismiss();
              this.initializePreview(id);
            });
        }
      });
    });
  }

  navigateTo() {
    return;
  } 

  async initializePreview(id: any) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    };
    const imageData = await this.camera.getPicture(options);
    const toast = await this.toastController.create({
      message: 'Device saved successfully!',
      duration: 2000,
    });
    toast.present();
    const photo = `data:image/jpeg;base64,${imageData}`;
    var uploadTask = this.storage.ref(`deviceFiles/${id}`);
    uploadTask.putString(photo, 'data_url');
    return this.navCtrl.navigateForward([`/tabs/tab${1}`]);
  }

  onTypeChanged(event): void {
    if (event.detail.value === 'Electrical') {
      this.isElectrical = true;
    } else {
      this.isElectrical = false;
    }
    this.selectedDeviceType = event.detail.value;
  }

  onElectricalSubCategoryChanged(event): void {
    this.isElectricalSubCat = true;
    this.selectedDeviceSubCat = event.detail.value;
  }

  onElectronicSubCategoryChanged(event): void {
    this.isElectricalSubCat = false;
    if (event.detail.value === 'Mobile Phone') {
      this.isMobile = true;
    }
    this.selectedDeviceSubCat = event.detail.value;
  }

  onBrandElectricalChanged(event): void {
    this.selectedDeviceBrand = event.detail.value;
  }

  onBrandElectronicChanged(event): void {
    this.selectedDeviceBrand = event.detail.value;
  }

  onConditionChanged(event): void {
    this.selectedDeviceCondition = event.detail.value;
  }

  onIsForSaleChanged(event): void {
    if (event.detail.value === 'Yes') {
      this.selectedIsForSale = true;
    } else {
      this.selectedIsForSale = false;
    }
  }

  onUnlinkDevice(event): void {
    this.selectedDeviceStatus = event.detail.value;
  }

  onDeviceWarantee(event): void {
    this.selectedDeviceWarranty = event.detail.value;
  }
}
