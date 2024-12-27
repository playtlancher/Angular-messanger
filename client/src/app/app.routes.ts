import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ActiveChatComponent } from './components/active-chat/active-chat.component';
import { canActivateAuth } from './auth/access.guard';
import { ChatAddFormComponent } from './components/chat-add-form/chat-add-form.component';

export const routes: Routes = [
  { path: 'registration', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainPageComponent,
    children: [
      { path: 'chat/:chat_id', component: ActiveChatComponent },
      { path: 'new-chat', component: ChatAddFormComponent },
    ],
    canActivate: [canActivateAuth],
  },
];
