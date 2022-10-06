import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  files = [];
  uploadProgress = 0;

  @ViewChild('previewimage') waterMarkImage: ElementRef;
  originalImage = null;
  blobImage = null;

  constructor(
    public loadingController: LoadingController,
    public firestore: AngularFirestore
  ) {}

  ngOnInit() {}
}
