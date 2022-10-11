import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { DeviceService } from '../service/device.service';
import * as _ from 'lodash';
import { take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  //globalId = this.firestore.createId();
  buyer = '';
  users$: any;
  messages: any = [];
  document: any = {};
  pipe = new DatePipe('en-US');
  chatForm: FormGroup;

  constructor(
    private deviceService: DeviceService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    public loadingController: LoadingController,
    private toastController: ToastController,
    public firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    this.createchatForm();
    this.document = this.deviceService.getDocFromStore();
    if (_.isEmpty(this.document))
      return this.navCtrl.navigateForward([`/tabs/tab${2}`]);

    await this.loadUserChats();
  }

  submitMessage() {
    // this.document.id + Math.floor(Math.random() * (1000 - 1 + 1) + 1);
    const sales = this.deviceService
      .saleChatExist(this.document.id)
      .get()
      .subscribe((users) => {
        if (users.size > 0) {
          const message = {
            from: this.document.isFoundUser ? 'FoundUser' : 'CurrentUser',
            text: this.chatForm.controls['message'].value,
            created: new Date(),
            chatId: this.document.id,
            uniqId: this.document.uniqId,
            email: localStorage.getItem('userEmail'),
          };

          this.chatForm.reset();
          this.deviceService.sendMessage(message).then((resp) => {
            this.document.isUpdate = true;
            this.updateSaleDevice(this.document);
            this.loadUserChats();
          });
        } else {
          const globalId = this.firestore.createId();
          const message = {
            from: this.document.isFoundUser ? 'FoundUser' : 'CurrentUser',
            text: this.chatForm.controls['message'].value,
            created: new Date(),
            chatId: this.document.id,
            uniqId: globalId,
            email: localStorage.getItem('userEmail'),
          };

          this.chatForm.reset();
          this.deviceService.sendMessage(message).then((resp) => {
            this.document.uniqId = message.uniqId;
            this.updateSaleDevice(this.document);
            this.loadUserChats();
          });
        }
      });
  }

  private updateSaleDevice(document: any) {
    debugger;
    this.deviceService
      .getFoundBy(localStorage.getItem('userEmail'))
      .subscribe((users) => {
        this.buyer = users[0].name + ' ' + users[0].lastname;

        document.isForSale = true;
        document.saleStatus = 'IN PROGRESS';
        document.isFound = true;
        document.buyer = this.buyer;
        document.buyerEmail = localStorage.getItem('userEmail');
        this.deviceService.updateDeviceFromSale(document).then(async (resp) => {
          if (resp) {
            console.log('updated successfully');
            this.ngOnInit();
          } else {
            console.log('sales couldnt be removed');
          }
        });
      });
  }

  private createchatForm() {
    this.chatForm = this.fb.group({
      message: [''],
    });
  }

  private async loadUserChats() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    debugger;
    if (this.document.email === localStorage.getItem('userEmail')) {
      this.deviceService
        .getSalesChatsOwner(this.document.id)
        .subscribe((resp) => {
          if (resp.length) {
            for (let i = 0; i < resp.length; i++) {
              const saleChat = resp[i];
              //Pass the uniqId instead of deviceId
              this.deviceService
                .getUserChats(saleChat.uniqId)
                .subscribe((resp) => {
                  this.messages.length = 0;
                  loading.dismiss();
                  if (resp.length) {
                    let messagesLodash = _.orderBy(
                      resp,
                      ['created'],
                      ['asc', 'desc']
                    );
                    this.messages.push.apply(this.messages, messagesLodash);
                  }
                });
            }
          }
        });
    } else {
      this.deviceService.getSalesChats(this.document.id).subscribe((resp) => {
        if (resp.length) {
          for (let i = 0; i < resp.length; i++) {
            const saleChat = resp[i];
            //Pass the uniqId instead of deviceId
            this.deviceService
              .getUserChats(saleChat.uniqId)
              .subscribe((resp) => {
                this.messages.length = 0;
                loading.dismiss();
                if (resp.length) {
                  let messagesLodash = _.orderBy(
                    resp,
                    ['created'],
                    ['asc', 'desc']
                  );
                  this.messages.push.apply(this.messages, messagesLodash);
                }
              });
          }
        }
      });
    }
  }
}
