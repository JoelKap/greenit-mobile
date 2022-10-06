import { Injectable } from '@angular/core';
import { LostItemHttp } from '../http/lost-item.http';

@Injectable({
  providedIn: 'root',
})
export class LostItemService {
  document: any = {};
  constructor(private lostItemHttp: LostItemHttp) {}

  async checkIfUserProfile(email: any, type: string, selectedDoc: any) {
    return await this.lostItemHttp.checkIfUserProfile(email, type, selectedDoc);
  }

  saveFoundDoc(doc: any) {
    return this.lostItemHttp.saveFoundDoc(doc);
  }

  getUserDevices(email: string) {
    return this.lostItemHttp.getUserDevices(email);
  }
}
