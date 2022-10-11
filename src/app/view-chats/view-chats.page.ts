import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
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
    private deviceService: DeviceService
  ) {}

  async ngOnInit(): Promise<void> {
    debugger;
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
    const docs = this.deviceService.getmatchedSales('');

    docs.valueChanges().subscribe((resp) => {
      this.saleDevices.length = 0;
      if (resp.length) {
        for (let i = 0; i < resp.length; i++) {
          const element = resp[i];
          if (
            element.email === localStorage.getItem('userEmail') ||
            element.buyerEmail == localStorage.getItem('userEmail')
          )
            this.saleDevices.push(element);
        }
      }
      this.deviceService
        .getChatlostDocs(localStorage.getItem('userEmail'))
        .subscribe((lostDocs) => {
          var docs = lostDocs;
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
                      (x) => x.lostId === doc.lostId
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
}
