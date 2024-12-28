import { Injectable } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Chat } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(private readonly authService: AuthService) {}
  private webSocket?: WebSocket;
  public messages: Message[] = [];
  private base_url = environment['BASE_WS_URL'];
  private chatId: number = -1;

  public openWebSocket(chatId: number): void {
    this.closeWebSocket();
    this.chatId = chatId;
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
      const { type, error, payload } = JSON.parse(event.data);
      switch (type) {
        case 'Post': {
          this.addMessages(payload.messages);
          break;
        }
        case 'Delete': {
          this.removeMessage(payload.messages);
          break;
        }
        case 'Update': {
          this.updateMessageDate(payload.messages);
          break;
        }
        case 'Error': {
          this.handleError(error);
          break;
        }
        default: {
          console.warn(`Unhandled WebSocket event type: ${type}`);
        }
      }
    } catch (error) {
      console.error(
        'Error parsing WebSocket chat-sidebar-item-message:',
        error,
      );
    }
  }
  private handleError(error: string): void {
    console.error(error);
    if (error === 'Invalid token') {
      this.authService.refreshAccessToken().subscribe({
        next: () => {
          this.openWebSocket(this.chatId);
        },
        error: (refreshError) => {
          console.error('Failed to refresh token:', refreshError);
        },
      });
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
