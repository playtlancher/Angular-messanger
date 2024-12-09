import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {MainPageComponent} from './pages/main-page/main-page.component';
import {ActiveChatComponent} from './components/active-chat/active-chat.component';
import {canActivateAuth} from './auth/access.guard';
import {ChatAddComponent} from './components/chat-add/chat-add.component';

export const routes: Routes = [
  { path: 'registration', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainPageComponent,
    children: [
      { path: 'chat/:chat_id', component: ActiveChatComponent },
      { path: 'new-chat', component: ChatAddComponent },
    ],
    canActivate: [canActivateAuth],
  },
];
