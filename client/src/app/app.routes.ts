import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ActiveChatComponent } from './components/active-chat/active-chat.component';
import { canActivateAuth } from './auth/access.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegisterComponent },
  {
    path: '',
    component: MainPageComponent,
    children: [{ path: 'chat/:chat_id', component: ActiveChatComponent }],
    canActivate: [canActivateAuth],
  },
];
