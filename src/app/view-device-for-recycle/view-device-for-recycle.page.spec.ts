import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewDeviceForRecyclePage } from './view-device-for-recycle.page';

describe('ViewDeviceForRecyclePage', () => {
  let component: ViewDeviceForRecyclePage;
  let fixture: ComponentFixture<ViewDeviceForRecyclePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDeviceForRecyclePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDeviceForRecyclePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
