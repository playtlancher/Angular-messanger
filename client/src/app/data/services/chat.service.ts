import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chat } from '../interfaces/chat.interface';
import { environment } from '../../../environments/environment';
import {catchError, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  http = inject(HttpClient);
  base_url = environment['BASE_URL'];
  chats: Chat[] = [];

  constructor() {
    this.getChats();
  }

  getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.base_url}/chats`, { withCredentials: true }).pipe(
      tap((chats) => {
        this.chats = chats;
      }),
      catchError((error) => {
        console.error('Error fetching chats:', error);
        return [];
      }),
    );
  }

  getChatById(chatId: number): Chat {
    return <Chat>this.chats.find((chat) => chat.id === chatId);
  }

  addChat(chatName: string, username: string) {
    this.http
      .post<{
        username: string;
        id: number;
      }>(
        `${this.base_url}/chats`,
        { username, name: chatName },
        { withCredentials: true },
      )
      .subscribe({
        next: (response) => {
          console.log('Chat added successfully:', response);
        },
        error: (err) => {
          console.error('Error adding chat:', err);
        },
      });
  }
}
