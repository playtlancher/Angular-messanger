import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Message } from '../../data/interfaces/message.interface';
import { MessageComponent } from '../message/message.component';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../data/services/auth.service';
import { WebSocketService } from '../../data/services/web-socket.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MainPageComponent } from '../../pages/main-page/main-page.component';

@Component({
  selector: 'app-active-chat',
  imports: [MessageComponent, RouterOutlet, RouterLink, ReactiveFormsModule],
  templateUrl: './active-chat.component.html',
  standalone: true,
  styleUrl: './active-chat.component.scss',
})
export class ActiveChatComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  mainPageComponent = inject(MainPageComponent);
  chatId: number = -1;
  userId: number = -1;
  chatName: string = localStorage.getItem('chat') || '';
  messageForm: FormGroup = new FormGroup({
    message: new FormControl(null, Validators.required),
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    public webSocketService: WebSocketService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const chatId = params.get('chat_id');
      if (chatId) {
        this.chatId = parseInt(chatId);
        this.webSocketService.openWebSocket(this.chatId);
        let chatName =
          this.mainPageComponent
            .getChats()
            .find((chat) => chat.id === this.chatId)?.name || '';
        if (chatName) {
          this.chatName = chatName;
        }
        localStorage.setItem('chat', this.chatName);
      }
      this.userId = this.authService.getDecodedToken().id;
    });
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  sendMessage(): void {
    const newMessage: Message = {
      id: -1,
      text: this.messageForm.value.message,
      chat: this.chatId,
      from: this.userId,
      date: '',
      token: this.authService.getToken() || '',
    };
    this.messageForm.reset();
    this.webSocketService.sendMessage(newMessage);
    setTimeout(() => this.scrollToBottom(), 10);
  }

  scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages?.scrollHeight;
    }
  }
}
