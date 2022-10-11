import { Injectable } from '@angular/core';
import { DeviceHttp } from '../http/device.http';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  device: any = {};
  company: any = {};
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

  updateDeviceFromSale(doc: any) {
    return this.deviceHttp.updateDeviceFromSale(doc);
  }

  getSalesChats(id: any) {
    return this.deviceHttp.getSalesChats(id);
  }

  getSalesChatsOwner(id: any) {
    return this.deviceHttp.getSalesChatsOwner(id);
  }

  saleChatExist(deviceId: any) {
    return this.deviceHttp.saleChatExist(deviceId);
  }

  saveCompanyToStore(company: any) {
    this.company = company;
  }

  getCompanyFromStore() {
    return this.company;
  }

  getCompanies(): any {
    return this.deviceHttp.getCompanies();
  }

  getUserDevicesForRecycle(email: string): any {
    return this.deviceHttp.getUserDevicesForRecycle(email);
  }

  saveRecycleDevice(device: any, company: any) {
    return this.deviceHttp.saveRecycleDevice(device, company);
  }

  saveFoundDoc(doc: any) {
    return this.deviceHttp.saveFoundDoc(doc);
  }

  saveDeviceToStore(doc: any) {
    this.device = doc;
  }

  getDocFromStore() {
    return this.device;
  }

  getmatchedSales(email: string) {
    return this.deviceHttp.getmatchedSales(email);
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

  sendMessage(message: any) {
    return this.deviceHttp.sendMessage(message);
  }

  getChatlostDocs(email: string) {
    return this.deviceHttp.getChatlostDocs(email);
  }

  getFoundDocuments(lostId: any) {
    return this.deviceHttp.getFoundDocuments(lostId);
  }
}
