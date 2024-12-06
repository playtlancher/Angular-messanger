import { Injectable } from '@angular/core';
import { Message } from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocket: WebSocket | undefined;
  public messages: Message[] = [];

  public openWebSocket(chatId: number): void {
    this.closeWebSocket();

    this.messages = [];

    this.webSocket = new WebSocket(`ws://localhost:8000/${chatId}`);

    this.webSocket.onopen = (event) => {
      console.log('WebSocket opened');
    };

    this.webSocket.onmessage = (event: MessageEvent) => {
      try {
        const receivedMessages: Message[] = JSON.parse(event.data);
        receivedMessages.map((message) => {
          message.date = new Date(message.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          return message;
        });
        this.messages.push(...receivedMessages);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.webSocket.onclose = () => {
      console.log('WebSocket closed');
    };

    this.webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public sendMessage(message: Message): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open. Cannot send message.');
    }
  }
  public deleteMessage(message: Message): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const deleteMessage = {
        event: 'Delete',
        message: message,
      }
      this.webSocket.send(JSON.stringify(deleteMessage));
    } else {
      console.warn('WebSocket is not open. Cannot send message.');
    }
  }
  public closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
