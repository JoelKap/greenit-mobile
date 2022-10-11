import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import {
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { take } from 'rxjs/operators';
import { DeviceService } from '../service/device.service';

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.page.html',
  styleUrls: ['./add-device.page.scss'],
})
export class AddDevicePage implements OnInit, OnDestroy {
  users$: any;
  deviceForm: FormGroup;
  selectedDeviceBrand: any;
  selectedDeviceCondition: any;
  selectedIsForSale: any;

  constructor(
    public firestore: AngularFirestore,
    private camera: Camera,
    private navCtrl: NavController,
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
    });
  }

  ngOnDestroy(): void {
    if (this.users$ !== undefined) {
      this.users$.unsubscribe();
    }
  }

  async saveDevice() {
    this.deviceForm.controls['deviceBrand'].setValue(this.selectedDeviceBrand);
    this.deviceForm.controls['deviceCondition'].setValue(
      this.selectedDeviceCondition
    );
    this.deviceForm.controls['createdAt'].setValue(new Date());
    this.deviceForm.controls['isDeleted'].setValue(false);
    this.deviceForm.controls['isFound'].setValue(false);
    this.deviceForm.controls['isForSale'].setValue(this.selectedIsForSale);
    this.deviceForm.controls['saleStatus'].setValue('');
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
    });
  }

  initializePreview(id) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    };
    return this.camera.getPicture(options).then(async (imageData) => {
      const toast = await this.toastController.create({
        message: 'Device saved successfully!',
        duration: 2000,
      });
      toast.present();
      const photo = `data:image/jpeg;base64,${imageData}`;
      var uploadTask = this.storage.ref(`deviceFiles/${id}`);
      uploadTask.putString(photo, 'data_url');
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
      this.modalController.dismiss({
        dismissed: true,
      });
    });
  }

  onBrandChanged(event): void {
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
}
