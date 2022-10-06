import { Injectable } from '@angular/core';
import { LostItemHttp } from '../http/lost-item.http';

@Injectable({
  providedIn: 'root',
})
export class LostItemService {
  document: any = {};
  constructor(private lostItemHttp: LostItemHttp) {}

  saveDocToStore(doc: any) {
    this.document = doc;
  }

  getDocFromStore() {
    return this.document;
  }

  async checkIfUserProfile(email: any, type: string, selectedDoc: any) {
    return await this.lostItemHttp.checkIfUserProfile(email, type, selectedDoc);
  }

  saveFoundDoc(doc: any) {
    return this.lostItemHttp.saveFoundDoc(doc);
  }

  getUserDevices(email: string) {
    return this.lostItemHttp.getUserDevices(email);
  }

  getmatchedDocs(email: string) {
    return this.lostItemHttp.getmatchedDocs(email);
  }

  deleteDoc(doc: any) {
    return this.lostItemHttp.deleteDoc(doc);
  }

  getFoundBy(email: any) {
    return this.lostItemHttp.getFoundBy(email);
  }

  saveMatchDoc(selectedDoc: any) {
    return this.lostItemHttp.saveMatchDoc(selectedDoc);
  }

  updateDoc(selectedDoc: any) {
    return this.lostItemHttp.updateDoc(selectedDoc);
  }

  getUserChats(id: any) {
    return this.lostItemHttp.getUserChats(id);
  }

  sendMessage(message: {
    from: string;
    text: string;
    created: Date;
    chatId: any;
  }) {
    return this.lostItemHttp.sendMessage(message);
  }

  getChatlostDocs(email: string) {
    return this.lostItemHttp.getChatlostDocs(email);
  }

  getFoundDocuments(lostId: any) {
    return this.lostItemHttp.getFoundDocuments(lostId);
  }
}
