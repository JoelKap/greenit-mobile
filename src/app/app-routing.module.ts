import { AuthGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'intro', pathMatch: 'full' },
  {
    path: 'intro',
    loadChildren: () =>
      import('./intro/intro.module').then((m) => m.IntroPageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'registration',
    loadChildren: () =>
      import('./registration/registration.module').then(
        (m) => m.RegistrationPageModule
      ),
  },
  {
    path: 'user-more-info',
    loadChildren: () =>
      import('./user-more-info/user-more-info.module').then(
        (m) => m.UserMoreInfoPageModule
      ),
    canLoad: [AuthGuard],
  },
  {
    path: 'add-lost-item',
    loadChildren: () =>
      import('./add-device/add-device.module').then(
        (m) => m.AddLostItemPageModule
      ),
    canLoad: [AuthGuard],
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./chat/chat.module').then((m) => m.ChatPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'view-chats',
    loadChildren: () =>
      import('./view-chats/view-chats.module').then(
        (m) => m.ViewChatsPageModule
      ),
  },
  {
    path: 'view-picture',
    loadChildren: () =>
      import('./view-picture/view-picture.module').then(
        (m) => m.ViewPicturePageModule
      ),
    canLoad: [AuthGuard],
  },
  {
    path: 'forget-password',
    loadChildren: () =>
      import('./forget-password/forget-password.module').then(
        (m) => m.ForgetPasswordPageModule
      ),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'view-device-for-recycle',
    loadChildren: () =>
      import('./view-device-for-recycle/view-device-for-recycle.module').then(
        (m) => m.ViewDeviceForRecyclePageModule
      ),
  },
  {
    path: 'edit-device',
    loadChildren: () =>
      import('./edit-device/edit-device.module').then(
        (m) => m.EditDevicePageModule
      ),
  },
  {
    path: 'repair-device',
    loadChildren: () =>
      import('./repair-device/repair-device.module').then(
        (m) => m.RepairDevicePageModule
      ),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
