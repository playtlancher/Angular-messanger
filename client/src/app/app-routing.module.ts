import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { ChatSidebarItemComponent } from './components/chat/chat-sidebar-item/chat-sidebar-item.component';
import { canActivateAuth } from './auth/access.guard';

const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  {
    path: 'chat',
    component: ChatSidebarItemComponent,
    canActivate: [canActivateAuth],
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
