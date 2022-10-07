import { Injectable } from '@angular/core';
import { DeviceHttp } from '../http/device.http';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  document: any = {};
  constructor(private deviceHttp: DeviceHttp) {}

  async checkIfUserProfile(email: any, type: string, selectedDoc: any) {
    return await this.deviceHttp.checkIfUserProfile(email, type, selectedDoc);
  }

  getMarketDevices() {
    return this.deviceHttp.getMarketDevices();
  }

  getUserDevices(email: string) {
    return this.deviceHttp.getUserDevices(email);
  }

  removeDeviceFromSale(doc: any) {
    return this.deviceHttp.removeDeviceFromSale(doc);
  }

  saveFoundDoc(doc: any) {
    return this.deviceHttp.saveFoundDoc(doc);
  }

  saveDocToStore(doc: any) {
    this.document = doc;
  }

  getDocFromStore() {
    return this.document;
  }

  getmatchedDocs(email: string) {
    return this.deviceHttp.getmatchedDocs(email);
  }

  deleteDoc(doc: any) {
    return this.deviceHttp.deleteDoc(doc);
  }

  getFoundBy(email: any) {
    return this.deviceHttp.getFoundBy(email);
  }

  saveMatchDoc(selectedDoc: any) {
    return this.deviceHttp.saveMatchDoc(selectedDoc);
  }

  updateDoc(selectedDoc: any) {
    return this.deviceHttp.updateDoc(selectedDoc);
  }

  getUserChats(id: any) {
    return this.deviceHttp.getUserChats(id);
  }

  sendMessage(message: {
    from: string;
    text: string;
    created: Date;
    chatId: any;
  }) {
    return this.deviceHttp.sendMessage(message);
  }

  getChatlostDocs(email: string) {
    return this.deviceHttp.getChatlostDocs(email);
  }

  getFoundDocuments(lostId: any) {
    return this.deviceHttp.getFoundDocuments(lostId);
  }
}
