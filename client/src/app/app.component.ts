import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'messenger';
  // chatService = inject(ChatService);
  // chats: any = []
  //
  // constructor() {
  //   this.chatService.getChats()
  //     .subscribe(val => {
  //       this.chats = val
  //     })
  // }
}
