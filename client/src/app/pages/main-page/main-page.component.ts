import { Component, inject } from '@angular/core';
import { Chat } from '../../data/interfaces/chat.interface';
import { ChatService } from '../../data/services/chat.service';
import { ChatComponent } from '../../components/chat/chat.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-page',
  imports: [ChatComponent, RouterOutlet, RouterLink],
  templateUrl: './main-page.component.html',
  standalone: true,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  chatService = inject(ChatService);
  chats: Chat[] = [];
  constructor() {
    this.chatService.getChats().subscribe((chats)=>{
      this.chats = chats;
    });
  }
}
