import {Injectable} from '@angular/core';
import {Message} from '../interfaces/message.interface';
import {environment} from '../../environments/environment';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}
  private webSocket?: WebSocket;
  public messages: Message[] = [];
  private base_url = environment['BASE_WS_URL'];
  private chatId: number = -1;
  private jwtToken: string | null = localStorage.getItem('token');

  public openWebSocket(chatId: number): void {
    this.closeWebSocket();
    this.chatId = chatId;
    this.messages = [];
    this.webSocket = new WebSocket(
      `${this.base_url}?chatId=${chatId}&jwtToken=${this.jwtToken}`,
    );
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
      const { type, error, payload } = JSON.parse(event.data);
      switch (type) {
        case 'Post': {
          this.addMessages(payload.messages);
          break;
        }
        case 'Delete': {
          this.removeMessage(payload.messages[0]);
          break;
        }
        case 'Update': {
          this.updateMessageDate(payload.messages[0]);
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
  }
  private handleError(error: string): void {
    switch (error){
      case 'Invalid token':{
        this.authService.refreshAccessToken().subscribe({
          next: () => {
            this.openWebSocket(this.chatId);
          },
          error: (refreshError) => {
            console.error('Failed to refresh token:', refreshError);
          },
        });
        break;
      }
      case 'Forbidden access to this chat':{
        this.router.navigate(["/"])
        break;
      }
      default:{
        console.error('Access to the chat is forbidden. Closing WebSocket.');
        this.closeWebSocket();
      }
    }
  }


  private addMessages(messages: Message[]): void {
    messages.forEach((message) => {
      this.messages.push(message);
    });
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
