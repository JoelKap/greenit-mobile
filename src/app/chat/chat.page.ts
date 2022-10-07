import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoadingController, NavController } from '@ionic/angular';
import { DeviceService } from '../service/device.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: any = [];
  document: any = {};
  pipe = new DatePipe('en-US');
  chatForm: FormGroup;

  constructor(
    private lostServ: DeviceService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    public loadingController: LoadingController
  ) {}

  async ngOnInit() {
    this.createchatForm();
    this.document = this.lostServ.getDocFromStore();
    if (_.isEmpty(this.document))
      return this.navCtrl.navigateForward([`/tabs/tab${2}`]);

    await this.loadUserChats();
  }

  submitMessage() {
    const message = {
      from: this.document.isFoundUser ? 'FoundUser' : 'CurrentUser',
      text: this.chatForm.controls['message'].value,
      created: new Date(),
      chatId: this.document.lostId,
    };
    this.chatForm.reset();
    this.lostServ.sendMessage(message).then((resp) => {
      this.loadUserChats();
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
    this.lostServ.getUserChats(this.document.lostId).subscribe((resp) => {
      this.messages.length = 0;
      loading.dismiss();
      if (resp) {
        let messagesLodash = _.orderBy(resp, ['created'], ['asc', 'desc']);
        this.messages.push.apply(this.messages, messagesLodash);
      }
    });
  }
}
