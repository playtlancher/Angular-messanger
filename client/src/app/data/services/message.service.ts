import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '../interfaces/message.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  http = inject(HttpClient);
  baseurl = 'http://localhost:8000';

  getMessages(chatId: number): Observable<Message[]> {
    return this.http
      .get<
        Message[]
      >(`${this.baseurl}/chat/${chatId}`, { withCredentials: true })
      .pipe(
        map((messages) =>
          messages.map((message) => {
            const date = new Date(message.date);
            return {
              ...message,
              date: date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            };
          }),
        ),
      );
  }
}
