import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {
  credentials: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    public afAuth: AngularFireAuth,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async sendPassword() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000,
    });
    await loading.present();
    this.afAuth.sendPasswordResetEmail(this.credentials.value.email).then(
      async () => {
        // success, show some message
        loading.dismiss();
        const toast = await this.toastController.create({
          message:
            'Submitted successfully, please check your email for a reset link',
          duration: 2000,
        });
        toast.present();
      },
      async (err) => {
        console.log(err);
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Please try again, something went wrong',
          duration: 2000,
        });
        toast.present();
        // handle errors
      }
    );
  }
}
