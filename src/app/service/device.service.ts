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

  updateSalesChatDevice(device: any) {
    return this.deviceHttp.updateSalesChatDevice(device);
  }

  saveRecycleDevice(device: any, company: any) {
    return this.deviceHttp.saveRecycleDevice(device, company);
  }

  deleteDevice(doc: any) {
    return this.deviceHttp.deleteDevice(doc);
  }

  saveRepairDevice(device: any, company: any) {
    return this.deviceHttp.saveRepairDevice(device, company);
  }

  deleteChatSale(device: any) {
    return this.deviceHttp.deleteChatSale(device);
  }

  saveFoundDoc(doc: any) {
    return this.deviceHttp.saveFoundDoc(doc);
  }

  saveDeviceToStore(doc: any) {
    this.device = doc;
  }

  saveSoldDevice(device: any) {
    return this.deviceHttp.saveSoldDevice(device);
  }

  saveMatchSale(device: any) {
    return this.deviceHttp.saveMatchSale(device);
  }

  getDeviceFromStore() {
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

  getUserDeviceHistory(email: string): any {
    return this.deviceHttp.getUserDeviceHistory(email);
  }

  getUserChats(id: any) {
    return this.deviceHttp.getUserChats(id);
  }

  getRepairedCompanies(): any {
    return this.deviceHttp.getRepairedCompanies();
  }

  searchDeviceHistory(str: any) {
    return this.deviceHttp.searchDeviceHistory(str);
  }

  searchDeviceSerial(value: any) {
    return this.deviceHttp.searchDeviceSerial(value);
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
