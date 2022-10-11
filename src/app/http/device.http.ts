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
        ref.where('email', '==', email).where('isDeleted', '==', false)
      )
      .valueChanges();
  }

  getMarketDevices(): Observable<any[]> {
    return this.firestore
      .collection<any>(`devices`, (ref) =>
        ref
          .where('isForSale', '==', true)
          .where('saleStatus', '!=', 'SOLD')
          .where('isDeleted', '==', false)
      )
      .valueChanges();
  }

  async updateDeviceFromSale(doc: any): Promise<any> {
    try {
      await this.firestore.collection('devices').doc(doc.id).update(doc);
      if (doc.isUpdate) {
        this.getSalesChats(doc.id).subscribe((resp) => {
          if (!resp.length) {
            this.saveDeviceForSale(doc);
          }
        });
      } else if (!doc.isUpdate) {
        //this.saveDeviceForSale(doc);
      } else {
        this.saveDeviceForSale(doc);
      }

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

  getmatchedSales(email: string) {
    return this.firestore.collection<any>(`devices`, (ref) => {
      return (
        ref
          //.where('email', '==', email)
          .where('isDeleted', '==', false)
          .where('isFound', '==', true)
          .where('isForSale', '==', true)
          .where('saleStatus', '==', 'IN PROGRESS')
      );
    });
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
      .collection<any>(`chats`, (ref) => ref.where('uniqId', '==', id))
      .valueChanges();
  }

  sendMessage(message: any): Promise<any> {
    const id = this.firestore.createId();
    return this.firestore.doc(`chats/${id}`).set({
      ...message,
    });
  }

  getChatlostDocs(email: string): Observable<any[]> {
    return this.firestore
      .collection<any>(`lostDocuments`, (ref) =>
        ref.where('email', '==', email)
      )
      .valueChanges();
  }

  getFoundDocuments(lostId: any) {
    return this.firestore.collection<any>(`foundDocuments`, (ref) => {
      return ref.where('lostId', '==', lostId).where('isDeleted', '==', false);
    });
  }
}
