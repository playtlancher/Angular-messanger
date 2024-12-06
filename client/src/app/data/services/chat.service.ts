import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chat } from '../interfaces/chat.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  http = inject(HttpClient);
  constructor() {}
  baseApiUrl = 'http://localhost:8000/';
  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseApiUrl}chats`, {
      withCredentials: true,
    });
  }

  getMessages(chatId: number) {
    return this.http.get(`${this.baseApiUrl}/chats/${chatId}/messages`);
  }

  sendMessage(chatId: number, text: string) {
    return this.http.post(`${this.baseApiUrl}/chats/${chatId}/messages`, {
      text,
    });
  }
}
