import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Message } from '../interfaces/message.interface';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ActiveChatComponent } from '../components/chat/active-chat/active-chat.component';
import { ChatService } from './chat.service';
import { Chat } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {
  isVisible$ = new BehaviorSubject<boolean>(false);
  clickedMessage: Message | null = null;
  clickedChat: Chat | null = null;
  positionX: number = 0;
  positionY: number = 0;
  private messageToEdit = new BehaviorSubject<any | null>(null); // Повідомлення для редагування
  messageToEdit$ = this.messageToEdit.asObservable();
  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly chatService: ChatService,
  ) {}
  deleteMessage(message: Message) {
    this.webSocketService.deleteMessage(message);
  }
  editMessage(message: Message) {
    this.messageToEdit.next(message);
  }
  deleteChat(chat: Chat) {
    this.chatService.deleteChat(chat);
  }
  openMessageContextMenu(message: Message, event: MouseEvent): void {
    event.preventDefault();
    const userData = localStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);
    if (user.id === message.from) {
      this.setPositionAndShowMenu(event);
      this.clickedMessage = message;
    }
  }
  openChatContextMenu(chat: Chat, event: MouseEvent): void {
    event.preventDefault();
    this.setPositionAndShowMenu(event);
    this.clickedChat = chat;
  }
  setPositionAndShowMenu(event: MouseEvent) {
    this.positionX = event.clientX;
    this.positionY = event.clientY;
    this.isVisible$.next(true);
  }
  close() {
    this.isVisible$.next(false);
    this.clickedChat = null;
    this.clickedMessage = null;
  }
}
