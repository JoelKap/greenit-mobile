import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { DeviceService } from '../service/device.service';

@Component({
  selector: 'app-view-chats',
  templateUrl: './view-chats.page.html',
  styleUrls: ['./view-chats.page.scss'],
})
export class ViewChatsPage implements OnInit {
  term = '';
  isFoundUser = false;
  saleDevices: any[] = [];

  constructor(
    private router: Router,
    public modalController: ModalController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private deviceService: DeviceService,
    private toastController: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getMatchedDevice();
  }

  async openChat(doc: any) {
    this.deviceService.saveDeviceToStore(doc);
    this.router.navigateByUrl('/chat');
  }

  async delete(doc: any) {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    this.deviceService.deleteDoc(doc).then((resp) => {
      loading.dismiss();
      this.ngOnInit();
    });
  }

  private async getMatchedDevice() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    const docs = this.deviceService.getmatchedSales(
      localStorage.getItem('userEmail')
    );

    docs.valueChanges().subscribe((resp) => {
      this.saleDevices.length = 0;
      const result = _.uniqBy(resp, function (e) {
        return e.deviceId;
      });
      if (result.length) {
        for (let i = 0; i < result.length; i++) {
          const element = result[i];
          this.saleDevices.push(element);
        }
      }
      this.deviceService
        .getChatlostDocs(localStorage.getItem('userEmail'))
        .subscribe((devices) => {
          var docs = devices;
          for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            this.deviceService.getUserChats(doc.id).subscribe((chats) => {
              if (chats.length) {
                const chat: any = chats[i];
                const chatDocs = this.deviceService.getFoundDocuments(
                  chat.chatId
                );

                chatDocs.valueChanges().subscribe((chatDocuments) => {
                  for (let i = 0; i < chatDocuments.length; i++) {
                    const doc = chatDocuments[i];
                    doc.isFoundUser = true;
                    const docToSave = this.saleDevices.find(
                      (x) => x.deviceId === doc.deviceId
                    );
                    if (!docToSave) this.saleDevices.push(doc);
                  }
                });
              }
            });
          }
        });
    });
  }

  sold(device: any) {
    device.saleStatus = 'SOLD';
    device.isFound = true;
    this.deviceService.saveSoldDevice(device).then(async (resp) => {
      if (resp) {
        this.deviceService.updateDeviceFromSale(device).then(async (resp) => {
          if (resp) {
            this.deviceService
              .updateSalesChatDevice(device)
              .then(async (resp) => {
                if (resp) {
                  const toast = await this.toastController.create({
                    message: 'thank you for using our service',
                    duration: 2000,
                  });
                  toast.present();
                  this.navCtrl.navigateForward([`/tabs/tab${2}`]);
                } else {
                  alert('devices was not updated! please contact admin');
                }
              });
          } else {
            alert('devices was not updated! please contact admin');
          }
        });
      } else {
        alert('something went wrong, please contact admin!');
        console.log('something went wrong, please contact admin!');
      }
    });
  }

  cancel(device: any) {
    device.saleStatus = 'ON SALE';
    device.isFound = false;
    delete device.email;
    this.deviceService.updateDeviceFromSale(device).then(async (resp) => {
      if (resp) {
        this.deviceService.deleteChatSale(device).then(async (resp) => {
          const toast = await this.toastController.create({
            message: 'updated successfully',
            duration: 2000,
          });
          toast.present();
          this.navCtrl.navigateForward([`/tabs/tab${2}`]);
        });
      } else {
        alert('something went wrong, please contact admin!');
        console.log('something went wrong, please contact admin!');
      }
    });
  }
}
