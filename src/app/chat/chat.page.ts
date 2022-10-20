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
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  buyer = '';
  users$: any;
  messages: any = [];
  device: any = {};
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
    this.device = this.deviceService.getDeviceFromStore();
    if (_.isEmpty(this.device))
      return this.navCtrl.navigateForward([`/tabs/tab${2}`]);

    await this.loadUserChats();
  }

  submitMessage() {
    const message = {
      from: this.device.isFoundUser ? 'FoundUser' : 'CurrentUser',
      text: this.chatForm.controls['message'].value,
      created: new Date(),
      chatId: this.device.id,
      email: localStorage.getItem('userEmail'),
    };

    this.chatForm.reset();
    this.deviceService.sendMessage(message).then((resp) => {
      if (resp) {
        this.loadUserChats();
      } else {
        console.log('message was not sent');
      }
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
    this.deviceService.getUserChats(this.device.deviceId).subscribe((resp) => {
      this.messages.length = 0;
      loading.dismiss();
      if (resp.length) {
        let messagesLodash = _.orderBy(resp, ['created'], ['asc', 'desc']);
        this.messages.push.apply(this.messages, messagesLodash);
      }
    });
  }
}
