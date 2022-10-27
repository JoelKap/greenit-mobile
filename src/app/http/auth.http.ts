import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthHttp {
  constructor(
    private angularFireAuth: AngularFireAuth,
    public firestore: AngularFirestore
  ) {}

  register(value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.angularFireAuth
        .createUserWithEmailAndPassword(value.email, value.password)
        .then(
          (res) => resolve(res),
          (err) => reject(err)
        );
    });
  }

  signinUser(value: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFireAuth
        .signInWithEmailAndPassword(value.email, value.password)
        .then(
          (res) => resolve(res),
          (err) => reject(err)
        );
    });
  }

  registerUser(user: any): Promise<any> {
    user.isDeleted = false;
    const id = this.firestore.createId();
    return this.firestore.doc(`users/${id}`).set({
      id,
      ...user,
    });
  }
}
