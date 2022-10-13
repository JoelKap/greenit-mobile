import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as _ from 'lodash';
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
  selector: 'app-edit-device',
  templateUrl: './edit-device.page.html',
  styleUrls: ['./edit-device.page.scss'],
})
export class EditDevicePage implements OnInit {
  users$: any;
  deviceForm: FormGroup;
  selectedDeviceBrand: any;
  selectedDeviceStatus: any;
  selectedDeviceWarranty: any;
  selectedDeviceCondition: any;
  selectedIsForSale: any;
  device: any;
  brand: any;
  warranty: any;
  condition: any;
  unlinkdevice: any;
  brands = [
    'Sony',
    'Samsung',
    'Iphone',
    'Huawei',
    'Nokia',
    'Oppo',
    'Vivo',
    'One Plus',
    'Hisense',
    'Motorola',
    'Honor',
  ];

  warrantees = [
    { value: 'OUT OF WARANTY', text: 'Out of warranty' },
    { value: '6 MONTHS', text: '6 Months' },
    { value: '12 MONTHS', text: '12 Months' },
    { value: '2 YEARS', text: '2 Years' },
    { value: '3 YEARS', text: '3 Years' },
    { value: '5 YEARS', text: '5 Years' },
    { value: '5 YEARS PLUS', text: '5 Years Plus' },
  ];

  conditions = ['New', 'Used-New', 'Used-Good', 'Used-Fair'];

  unlinkdevices = [
    { value: 'STOLEN', text: 'Stolen' },
    { value: 'LOST', text: 'Lost' },
    { value: 'SOLD', text: 'Sold' },
    { value: 'NO LONGER IN MY USE', text: 'No longer in my use' },
  ];

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
    this.device = this.deviceService.getDocFromStore();
    if (_.isEmpty(this.device))
      return this.navCtrl.navigateForward([`/tabs/tab${1}`]);

    this.deviceForm = this.fb.group({
      deviceBrand: [''],
      deviceCondition: [''],
      status: [''],
      warranty: [''],
      owner: [''],
      id: [''],
      datePurchased: [''],
      createdAt: [''],
      deviceModel: [''],
      price: [''],
      imei: [''],
      description: [''],
      isUpdate: [Boolean],
      isDeleted: [Boolean],
      isFound: [Boolean],
      isForSale: [Boolean],
      saleStatus: [''],
      email: [''],
    });

    this.brand = this.device.deviceBrand;
    this.selectedDeviceBrand = this.brand;

    this.warranty = this.device.warranty;
    this.selectedDeviceWarranty = this.warranty;

    this.condition = this.device.deviceCondition;
    this.selectedDeviceCondition = this.condition;

    this.unlinkdevice = this.device.status;
    this.selectedDeviceStatus = this.unlinkdevice;

    this.deviceForm.setValue(this.device);
  }

  async updateDevice() {
    debugger;
    this.deviceForm.controls['deviceBrand'].setValue(this.selectedDeviceBrand);
    this.deviceForm.controls['deviceCondition'].setValue(
      this.selectedDeviceCondition
    );
    this.deviceForm.controls['createdAt'].setValue(
      this.deviceForm.controls.createdAt.value
    );
    this.deviceForm.controls['status'].setValue(this.selectedDeviceStatus);
    this.deviceForm.controls['warranty'].setValue(this.selectedDeviceWarranty);
    this.deviceForm.controls['isDeleted'].setValue(false);
    this.deviceForm.controls['isFound'].setValue(
      this.deviceForm.controls.isFound.value
    );
    this.deviceForm.controls['isForSale'].setValue(
      this.deviceForm.controls.isForSale.value
    );
    this.deviceForm.controls['saleStatus'].setValue(
      this.deviceForm.controls.saleStatus.value
    );
    this.deviceForm.controls['owner'].setValue(
      this.deviceForm.controls.owner.value
    );
    this.deviceForm.controls['email'].setValue(
      this.deviceForm.controls.email.value
    );
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    const id = this.deviceForm.controls['id'].value;

    return this.firestore
      .collection('devices')
      .doc(id)
      .update(this.deviceForm.value)
      .then(async () => {
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Device updated successfully!',
          duration: 2000,
        });
        toast.present();
        return this.navCtrl.navigateForward([`/tabs/tab${1}`]);
      })
      .catch(async () => {
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Oopsy, something went wrong, please contact admin!',
          duration: 2000,
        });
        toast.present();
        return false;
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
    this.router.navigateByUrl('/tabs', { replaceUrl: true });
    this.modalController.dismiss({
      dismissed: true,
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

  onUnlinkDevice(event): void {
    this.selectedDeviceStatus = event.detail.value;
  }

  onDeviceWarantee(event): void {
    this.selectedDeviceWarranty = event.detail.value;
  }
}
