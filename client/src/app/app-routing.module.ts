import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { canActivateAuth } from './auth/access.guard';

const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [canActivateAuth],
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
