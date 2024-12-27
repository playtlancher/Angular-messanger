import { Injectable } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocket?: WebSocket;
  public messages: Message[] = [];
  private base_url = environment['BASE_WS_URL'];

  public openWebSocket(chatId: number): void {
    this.closeWebSocket();
    this.messages = [];
    this.webSocket = new WebSocket(`${this.base_url}/${chatId}`);
    this.attachWebSocketEvents();
  }

  private attachWebSocketEvents(): void {
    this.webSocket?.addEventListener('open', () =>
      console.log('WebSocket connected'),
    );
    this.webSocket?.addEventListener('close', () =>
      console.log('WebSocket disconnected'),
    );
    this.webSocket?.addEventListener('error', (error) =>
      console.error('WebSocket error:', error),
    );
    this.webSocket?.addEventListener('message', (event) =>
      this.handleMessage(event),
    );
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'Post') this.addMessages(payload.messages);
      else if (type === 'Delete') this.removeMessage(payload.message);
      else if (type === 'Update') this.updateMessageDate(payload.message);
      else console.warn(`Unhandled WebSocket event type: ${type}`);
    } catch (error) {
      console.error(
        'Error parsing WebSocket chat-sidebar-item-message:',
        error,
      );
    }
  }

  private addMessages(newMessages: Message[]): void {
    newMessages.forEach(this.formatAndAddMessage.bind(this));
  }

  private formatAndAddMessage(message: Message): void {
    this.messages.push(message);
  }

  private removeMessage(message: Message): void {
    const index = this.messages.findIndex((entry) => entry.id === message.id);
    if (index !== -1) this.messages.splice(index, 1);
  }

  private updateMessageDate(updatedMessage: Message): void {
    const index = this.messages.findIndex(
      (entry) => entry.id === updatedMessage.id,
    );
    if (index !== -1) {
      this.messages[index] = updatedMessage;
    }
  }

  public sendMessage(message: Message): void {
    this.sendAction('Post', message);
  }

  public deleteMessage(message: Message): void {
    this.sendAction('Delete', message);
  }

  public updateMessage(message: Message): void {
    this.sendAction('Update', message);
  }

  private sendAction(action: string, message: Message): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      const token = localStorage.getItem('token')!;
      this.webSocket.send(JSON.stringify({ type: action, message, token }));
    } else {
      console.warn(`WebSocket is not open. Cannot perform ${action}`);
    }
  }

  public closeWebSocket(): void {
    this.webSocket?.close();
  }
}
