import { Injectable } from '@angular/core';
import { Message, ReceivedMessage, File } from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocket: WebSocket | undefined;
  public messages: ReceivedMessage[] = [];

  public openWebSocket(chatId: number): void {
    this.closeWebSocket();

    this.messages = [];

    this.webSocket = new WebSocket(`ws://localhost:8000/${chatId}`);

    this.webSocket.onopen = () => console.log('WebSocket connected');
    this.webSocket.onclose = () => console.log('WebSocket disconnected');
    this.webSocket.onerror = (error) => console.error('WebSocket error:', error);

    this.webSocket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(data: any): void {
    const { type, payload } = data;

    switch (type) {
      case 'Post':
        this.addMessages(payload.messages);
        break;

      case 'Delete':
        this.removeMessage(payload.message);
        break;

      case 'Update':
        this.updateMessageDate(payload.message);
        break;

      default:
        console.warn(`Unhandled WebSocket event type: ${type}`);
    }
  }

  private addMessages(newMessages: ReceivedMessage[]): void {
    console.log(newMessages);
    newMessages.forEach((message) => {
      message.date = new Date(message.date).toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      this.messages.push(message);
    });
  }

  private removeMessage(message: Message): void {
    const index = this.messages.findIndex((entry) => entry.id === message.id);
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  }

  private updateMessageDate(updatedMessage: ReceivedMessage): void {
    const index = this.messages.findIndex((entry) => entry.id === updatedMessage.id);
    if (index !== -1) {
      updatedMessage.date = new Date(updatedMessage.date).toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      this.messages[index] = updatedMessage;
    }
  }

  public sendMessage(message: Message, files: File[] = []): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const token = localStorage.getItem('token')!;
      const messagePayload = { type: 'Post', message, files, token };
      this.webSocket.send(JSON.stringify(messagePayload));
    } else {
      console.warn('WebSocket is not open. Cannot send message.');
    }
  }

  public deleteMessage(message: Message | ReceivedMessage): void {
    this.sendAction('Delete', message);
  }

  public updateMessage(message: Message | ReceivedMessage): void {
    this.sendAction('Update', message);
  }

  private sendAction(action: string, message: Message | ReceivedMessage): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const token = localStorage.getItem('token')!;
      this.webSocket.send(JSON.stringify({ type: action, message, token }));
    } else {
      console.warn(`WebSocket is not open. Cannot perform ${action}`);
    }
  }

  public closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
