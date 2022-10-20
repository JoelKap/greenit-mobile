import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceHttp {
  constructor(
    public firestore: AngularFirestore,
    public modalController: ModalController,
    private storage: AngularFireStorage,
    private camera: Camera,
    private toastController: ToastController,
    private navCtrl: NavController,
    public loadingController: LoadingController,
    public alertController: AlertController
  ) {}

  checkIfUserProfile(email: any, type: string, selectedDoc: any): Promise<any> {
    return this.firestore
      .collection('users', (ref) => ref.where('email', '==', email).limit(1))
      .get()
      .toPromise()
      .then(async (user) => {
        if (user.size > 0) {
          if (type === 'add') {
            return new Promise((resolve, reject) => {
              resolve('add');
            });
          } else if (type === 'found') {
            selectedDoc.isFound = true;
            return this.updateDoc(selectedDoc).then((resp) => {
              if (resp) {
                selectedDoc.email = localStorage.getItem('userEmail');
                selectedDoc.isFound = true;
                selectedDoc.createdAt = new Date();
                selectedDoc.lostId = selectedDoc.id;
                this.saveMatchDoc(selectedDoc);
              }
            });
          }
        } else {
          return new Promise((resolve, reject) => {
            this.alertController
              .create({
                header: 'User Profile',
                message:
                  'It appears we needs more of your info, Please click ok to proceed',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => resolve(true),
                  },
                ],
              })
              .then((alert) => {
                this.navCtrl.navigateForward(['user-more-info']);
                // this.router.navigateByUrl('user-more-info')
                alert.present();
              });
          });
        }
      });
  }

  getUserDevices(email: string): Observable<any[]> {
    return this.firestore
      .collection<any>(`devices`, (ref) =>
        ref
          .where('email', '==', email)
          .where('isDeleted', '==', false)
          .where('saleStatus', 'in', ['ON SALE', 'IN PROGRESS', ''])
      )
      .valueChanges();
  }

  getUserDeviceHistory(email: string): any {
    return this.firestore
      .collection<any>(`devices`, (ref) =>
        ref
          .where('email', '==', email)
          .where('isDeleted', '==', false)
          .where('saleStatus', 'in', ['SOLD'])
      )
      .valueChanges();
  }

  getMarketDevices(): Observable<any[]> {
    return this.firestore
      .collection<any>(`devices`, (ref) =>
        ref
          .where('isForSale', '==', true)
          .where('saleStatus', '==', 'ON SALE')
          .where('isDeleted', '==', false)
      )
      .valueChanges();
  }

  async updateDeviceFromSale(doc: any): Promise<any> {
    try {
      await this.firestore.collection('devices').doc(doc.id).update(doc);
      return true;
    } catch {
      return false;
    }
  }

  async updateSalesChatDevice(device: any) {
    try {
      await this.firestore
        .collection('saleChats')
        .doc(device.deviceId)
        .update(device);
      return true;
    } catch {
      return false;
    }
  }

  getSalesChats(id: any) {
    const email = localStorage.getItem('userEmail');
    return this.firestore
      .collection<any>(`saleChat`, (ref) =>
        ref.where('deviceId', '==', id).where('buyerEmail', '==', email)
      )
      .valueChanges();
  }

  getSalesChatsOwner(id: any) {
    const email = localStorage.getItem('userEmail');
    return this.firestore
      .collection<any>(`saleChat`, (ref) =>
        ref.where('deviceId', '==', id).where('email', '==', email)
      )
      .valueChanges();
  }

  async saveDeviceForSale(doc: any) {
    doc.deviceId = doc.id;
    const id = this.firestore.createId();
    const res = await this.firestore.doc(`saleChat/${id}`).set({
      saleChatId: id,
      ...doc,
    });
  }

  async saveRecycleDevice(device: any, company: any): Promise<any> {
    try {
      const id = this.firestore.createId();
      await this.firestore.doc(`recycles/${id}`).set({
        ...company,
        ...device,
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async saveRepairDevice(device: any, company: any) {
    try {
      const id = this.firestore.createId();
      await this.firestore.doc(`repairs/${id}`).set({
        ...device,
        ...company,
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  saleChatExist(deviceId: any) {
    const email = localStorage.getItem('userEmail');
    return this.firestore.collection<any>(`saleChat`, (ref) => {
      return ref
        .where('deviceId', '==', deviceId)
        .where('buyerEmail', '==', email);
    });
  }

  getCompanies(): any {
    return this.firestore
      .collection<any>(`companies`, (ref) =>
        ref.where('isDeleted', '==', false)
      )
      .valueChanges();
  }

  getUserDevicesForRecycle(email: string): any {
    return this.firestore
      .collection<any>(`devices`, (ref) =>
        ref
          .where('email', '==', email)
          .where('isDeleted', '==', false)
          .where('isForSale', '==', false)
      )
      .valueChanges();
  }

  async deleteDevice(doc: any) {
    try {
      await this.firestore.collection('devices').doc(doc.id).delete();
      return true;
    } catch {
      return false;
    }
  }

  async saveFoundDoc(doc: any): Promise<any> {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    this.getFoundBy(localStorage.getItem('userEmail')).subscribe(
      (user: any) => {
        const id = this.firestore.createId();
        doc.foundBy = user[0].name + ' ' + user[0].lastname;
        this.firestore
          .doc(`lostDocuments/${id}`)
          .set({
            id,
            ...doc,
          })
          .then((res) => {
            loading.dismiss();
            this.initializePreview(id);
          });
      }
    );
  }

  async saveSoldDevice(device: any) {
    try {
      const id = this.firestore.createId();
      await this.firestore.doc(`soldDevices/${id}`).set({
        id: id,
        ...device,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  initializePreview(id) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    };
    return this.camera.getPicture(options).then(async (imageData) => {
      const toast = await this.toastController.create({
        message: 'Document submitted successfully!',
        duration: 2000,
      });
      toast.present();
      const photo = `data:image/jpeg;base64,${imageData}`;
      var uploadTask = this.storage.ref(`documentFiles/${id}`);
      uploadTask.putString(photo, 'data_url');
      this.modalController.dismiss({
        dismissed: true,
      });
    });
  }

  updateDoc(selectedDoc: any): Promise<any> {
    return this.firestore
      .collection('lostDocuments')
      .doc(selectedDoc.id)
      .update(selectedDoc)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  searchDeviceHistory(str: string) {
    return this.firestore
      .collection<any>(`devices`, (ref) => {
        return ref.where('imei', '==', str).where('isDeleted', '==', false);
      })
      .valueChanges();
  }

  searchDeviceSerial(value: any) {
    return this.firestore
      .collection<any>(`devices`, (ref) => {
        return ref.where('serial', '==', value).where('isDeleted', '==', false);
      })
      .valueChanges();
  }

  getmatchedSales(email: string) {
    return this.firestore.collection<any>(`saleChats`, (ref) => {
      return ref
        .where('email', '==', email)
        .where('isDeleted', '==', false)
        .where('isFound', '==', true)
        .where('isForSale', '==', true)
        .where('saleStatus', '==', 'IN PROGRESS');
    });
  }

  getRepairedCompanies(): any {
    return this.firestore
      .collection<any>(`companiesRepairs`, (ref) => {
        return ref.where('isDeleted', '==', false);
      })
      .valueChanges();
  }

  deleteDoc(selectedDoc: any): Promise<any> {
    selectedDoc.isDeleted = true;
    return this.firestore
      .collection('foundDocuments')
      .doc(selectedDoc.foundId)
      .update(selectedDoc)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  getFoundBy(email: string) {
    return this.firestore
      .collection<any>(`users`, (ref) => ref.where('email', '==', email))
      .valueChanges();
  }

  async deleteChatSale(device: any) {
    try {
      var devices = this.firestore.collection('saleChats', (ref) =>
        ref.where('deviceId', '==', device.id)
      );

      devices
        .get()
        .toPromise()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            doc.ref.delete();
          });
        });

      var chats = this.firestore.collection('chats', (ref) =>
        ref.where('chatId', '==', device.id)
      );

      chats
        .get()
        .toPromise()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            doc.ref.delete();
          });
        });
      return true;
    } catch {
      return false;
    }
  }

  saveMatchDoc(selectedDoc: any) {
    const id = this.firestore.createId();
    this.getFoundBy(localStorage.getItem('userEmail')).subscribe(
      (user: any) => {
        selectedDoc.lostBy = user[0].name + ' ' + user[0].lastname;
        selectedDoc.isDeleted = false;
        return this.firestore
          .doc(`foundDocuments/${id}`)
          .set({
            foundId: id,
            ...selectedDoc,
          })
          .then((res) => {
            this.navCtrl.navigateForward([`/tabs/tab${2}`]);
          });
      }
    );
  }

  getUserChats(id: any) {
    //Modified chatId to uniqId
    return this.firestore
      .collection<any>(`chats`, (ref) => ref.where('chatId', '==', id))
      .valueChanges();
  }

  async sendMessage(message: any): Promise<any> {
    const id = this.firestore.createId();
    try {
      await this.firestore.doc(`chats/${id}`).set({
        ...message,
      });
      return true;
    } catch {
      return false;
    }
  }

  async saveMatchSale(device: any) {
    const id = this.firestore.createId();
    try {
      await this.firestore.doc(`saleChats/${id}`).set({
        ...device,
      });
      return true;
    } catch {
      return false;
    }
  }

  getChatlostDocs(email: string): Observable<any[]> {
    return this.firestore
      .collection<any>(`devices`, (ref) => ref.where('email', '==', email))
      .valueChanges();
  }

  getFoundDocuments(id: any) {
    return this.firestore.collection<any>(`saleChats`, (ref) => {
      return ref.where('deviceId', '==', id).where('isDeleted', '==', false);
    });
  }
}
