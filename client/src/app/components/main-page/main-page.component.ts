import { Component } from '@angular/core';
import { Chat } from '../../data/interfaces/chat.interface';
import { ChatService } from '../../data/services/chat.service';
import { ChatSidebarItemComponent } from '../chat/chat-sidebar-item/chat-sidebar-item.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ContextMenuComponent } from '../chat/context-menu/context-menu.component';
import { ContextMenuService } from '../../data/services/context-menu.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-main-page',
  imports: [
    ChatSidebarItemComponent,
    RouterOutlet,
    RouterLink,
    ContextMenuComponent,
    AsyncPipe,
  ],
  templateUrl: './main-page.component.html',
  standalone: true,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  chats: Chat[] = [];
  constructor(
    private chatService: ChatService,
    protected readonly contextMenuService: ContextMenuService,
  ) {
    this.chatService.getChats().subscribe((chats) => {
      this.chats = chats;
    });
  }
}
