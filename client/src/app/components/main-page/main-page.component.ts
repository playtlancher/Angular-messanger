import { Component } from '@angular/core';
import { Chat } from '../../data/interfaces/chat.interface';
import { ChatService } from '../../data/services/chat.service';
import { ChatSidebarItemComponent } from '../chat-sidebar-item/chat-sidebar-item.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-page',
  imports: [ChatSidebarItemComponent, RouterOutlet, RouterLink],
  templateUrl: './main-page.component.html',
  standalone: true,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  chats: Chat[] = [];
  constructor(private chatService: ChatService) {
    this.chatService.getChats().subscribe((chats) => {
      this.chats = chats;
    });
  }
}
