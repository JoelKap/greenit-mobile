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
  isMobile: boolean = false;
  isElectrical: boolean;
  isElectricalSubCat: boolean;
  selectedDeviceBrand: any;
  selectedDeviceStatus: any;
  selectedDeviceWarranty: any;
  selectedDeviceCondition: any;
  selectedDeviceType: any;
  selectedDeviceSubCat: any;
  selectedIsForSale: any;
  electricalSub: any;
  electronicSub: any;
  elecBrand: any;
  device: any;
  brand: any;
  type: any;
  warranty: any;
  condition: any;
  unlinkdevice: any;

  types = ['Electrical', 'Electronic'];

  electricalBrands = [
    'KIC',
    'Bennet Read',
    'Logik',
    'Philips',
    'Defy',
    'Samsung',
    'Hisense',
    'Bosch',
    'Miele',
    'Whirlpool',
    'LG',
    'DeLonghi',
    'Jamie Oliver',
    'Kenwood',
    'Mellerware',
    'Midea',
    'Morphy Richards',
    'Russel Hobbs',
    'Salton',
    'Smeg',
    'Snappy Chef',
    'Sunbeam',
    'Tefal',
    'Tevo',
    'Verimark',
    'Sony',
    'Telefunken',
    'Other',
  ];

  electricalSubs = [
    'Heater',
    'Vacuum Cleaners',
    'Ceiling Fan',
    'Table Fan',
    'Washing Machine',
    'Geyser',
    'Microwave',
    'Fridge',
    'Blender',
    'Toaster',
    'Pressure Cooker',
    'Air Fryer',
    'Kettle',
    'Stove',
    'Hob',
    'Hob',
  ];

  electronicSubs = [
    'Mobile Phone',
    'Television',
    'Computer-Desktop',
    'Home Theater (incl DVD Player / Radio)',
    'Other',
  ];

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
    this.device = this.deviceService.getDeviceFromStore();
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
      imageUrl: [''],
      buyer: [''],
      deviceId: [''],
      deviceType: [''],
      deviceSubCat: [''],
      serial: [''],
    });

    this.brand = this.device.deviceBrand;
    this.selectedDeviceBrand = this.brand;

    this.warranty = this.device.warranty;
    this.selectedDeviceWarranty = this.warranty;

    this.condition = this.device.deviceCondition;
    this.selectedDeviceCondition = this.condition;

    this.unlinkdevice = this.device.status;
    this.selectedDeviceStatus = this.unlinkdevice;

    this.device.isUpdate = false;
    if (this.device.imageUrl === undefined) {
      this.device.imageUrl = '';
    }

    if (this.device.buyer === undefined) {
      this.device.buyer = '';
    }

    if (this.device.deviceId === undefined) {
      this.device.deviceId = '';
    }

    this.type = this.device.deviceType;
    this.selectedDeviceType = this.type;

    debugger;
    this.electricalSub = this.device.deviceSubCat;
    this.electronicSub = this.device.deviceSubCat;

    this.selectedDeviceSubCat =
      this.electricalSub !== undefined
        ? this.electricalSub
        : this.electronicSub;

    this.elecBrand = this.device.deviceBrand;
    if (this.type === 'Electrical') {
      this.isElectrical = true;
    } else {
      this.isElectrical = false;
    }

    if (this.device.deviceSubCat === 'Mobile Phone') {
      this.isMobile = true;
    }

    if (!this.device.serial) {
      this.deviceForm.controls['serial'].setValue('');
      this.device.serial = '';
    }

    this.deviceForm.setValue(this.device);
  }

  async updateDevice() {
    this.deviceForm.controls['deviceBrand'].setValue(this.selectedDeviceBrand);
    this.deviceForm.controls['deviceCondition'].setValue(
      this.selectedDeviceCondition
    );
    this.deviceForm.controls['createdAt'].setValue(
      this.deviceForm.controls.createdAt.value
    );
    this.deviceForm.controls['deviceType'].setValue(this.selectedDeviceType);
    this.deviceForm.controls['deviceSubCat'].setValue(
      this.selectedDeviceSubCat
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
    if (this.deviceForm.controls.saleStatus.value === 'SOLD') {
      this.deviceForm.controls.saleStatus.value === 'SOLD';
      this.deviceForm.controls.isFound.setValue(true);
    }
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
        debugger;
        if (this.deviceForm.controls.saleStatus.value === 'SOLD') {
          this.deviceForm.controls.isFound.setValue(true);
          this.deviceService
            .saveSoldDevice(this.deviceForm.value)
            .then(async (resp) => {
              if (resp) {
                const toast = await this.toastController.create({
                  message: 'thank you for using our service',
                  duration: 2000,
                });
                toast.present();
                this.navCtrl.navigateForward([`/tabs/tab${2}`]);
              } else {
                alert('something went wrong, please contact admin!');
                console.log('something went wrong, please contact admin!');
              }
            });
        }
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

  onElectricalSubCategoryChanged(event): void {
    this.isElectricalSubCat = true;
    this.selectedDeviceSubCat = event.detail.value;
  }

  onElectronicSubCategoryChanged(event): void {
    this.isElectricalSubCat = false;
    if (event.detail.value === 'Mobile Phone') {
      this.isMobile = true;
    } else {
      this.isMobile = false;
      this.deviceForm.controls.imei.setValue('');
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

  onTypeChanged(event): void {
    if (event.detail.value === 'Electrical') {
      this.isElectrical = true;
    } else {
      this.isElectrical = false;
    }
    this.selectedDeviceType = event.detail.value;
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
    if (this.selectedDeviceStatus === 'SOLD') {
      this.deviceForm.controls.saleStatus.setValue('SOLD');
    }
  }

  onDeviceWarantee(event): void {
    this.selectedDeviceWarranty = event.detail.value;
  }
}
