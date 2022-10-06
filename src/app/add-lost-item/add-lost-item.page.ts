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
import { LostItemService } from '../service/device.service';

@Component({
  selector: 'app-add-lost-item',
  templateUrl: './add-lost-item.page.html',
  styleUrls: ['./add-lost-item.page.scss'],
})
export class AddLostItemPage implements OnInit, OnDestroy {
  users$: any;
  deviceForm: FormGroup;
  selectedDeviceBrand: any;
  selectedDeviceCondition: any;

  constructor(
    public firestore: AngularFirestore,
    private camera: Camera,
    private navCtrl: NavController,
    private storage: AngularFireStorage,
    public modalController: ModalController,
    private fb: FormBuilder,
    public loadingController: LoadingController,
    private lostDocService: LostItemService,
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
      email: [''],
    });
  }

  ngOnDestroy(): void {
    if (this.users$ !== undefined) {
      this.users$.unsubscribe();
    }
  }

  async saveFoundDoc() {
    this.deviceForm.controls['deviceBrand'].setValue(this.selectedDeviceBrand);
    this.deviceForm.controls['deviceCondition'].setValue(
      this.selectedDeviceCondition
    );
    this.deviceForm.controls['createdAt'].setValue(new Date());
    this.deviceForm.controls['isDeleted'].setValue(false);
    this.deviceForm.controls['isFound'].setValue(false);
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
    const subs$ = this.lostDocService.getFoundBy(
      localStorage.getItem('userEmail')
    );
    this.users$ = subs$.pipe(take(1)).subscribe((users) => {
      debugger;
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
          debugger;
          loading.dismiss();
          this.initializePreview(id);
        });
    });
    // this.lostDocService.saveFoundDoc(this.lostDocForm.value);
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
      debugger;
      const toast = await this.toastController.create({
        message: 'Device saved successfully!',
        duration: 2000,
      });
      toast.present();
      const photo = `data:image/jpeg;base64,${imageData}`;
      var uploadTask = this.storage.ref(`deviceFiles/${id}`);
      uploadTask.putString(photo, 'data_url');
      //this.navCtrl.navigateForward([`/tabs/tab${1}`]);
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
}
