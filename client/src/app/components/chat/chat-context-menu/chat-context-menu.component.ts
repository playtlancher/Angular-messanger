import { Component, Input } from '@angular/core';
import { ContextMenuService } from '../../../services/context-menu.service';
import { NgStyle } from '@angular/common';
import { Chat } from '../../../interfaces/chat.interface';

@Component({
  selector: 'chat-context-menu',
  imports: [NgStyle],
  templateUrl: './chat-context-menu.component.html',
  styleUrl: './chat-context-menu.component.scss',
  standalone: true,
})
export class ChatContextMenuComponent {
  @Input() chat!: Chat;
  @Input() positionX!: number;
  @Input() positionY!: number;
  screenWidth: number = 0;
  screenHeight: number = 0;
  constructor(protected contextMenuService: ContextMenuService) {
    this.screenWidth = document.documentElement.clientWidth;
    this.screenHeight = document.documentElement.clientHeight;
  }

  selectAction(action: string) {
    switch (action) {
      // case 'Update': {
      //   this.editMessage();
      //   this.contextMenuService.close();
      //   break;
      // }
      case 'Delete': {
        this.deleteChat();
        this.contextMenuService.close();
        break;
      }
    }
  }
  private deleteChat() {
    this.contextMenuService.deleteChat(this.chat);
  }
}
