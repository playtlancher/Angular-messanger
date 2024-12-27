import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Message } from '../../data/interfaces/message.interface';
import { ChatMessageComponent } from '../message/chat-message.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../data/services/auth.service';
import { WebSocketService } from '../../data/services/web-socket.service';
import { convertFilesToBase64 } from '../../data/utilities/BaseConvertor';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadingFileComponent } from '../uploading-file/uploading-file.component';
import { ChatService } from '../../data/services/chat.service';

@Component({
  selector: 'app-active-chat',
  imports: [
    ChatMessageComponent,
    RouterLink,
    UploadingFileComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './active-chat.component.html',
  standalone: true,
  styleUrls: ['./active-chat.component.scss'],
})
export class ActiveChatComponent implements OnInit, OnDestroy {
  @ViewChild('MessageContainer') private messageContainer!: ElementRef;
  chatId: number = -1;
  userId: number = parseInt(localStorage.getItem('user')!) || -1;
  chatName: string = localStorage.getItem('chat') || '';
  messageForm!: FormGroup;
  files: File[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    public webSocketService: WebSocketService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.messageForm = new FormGroup({
      message: new FormControl<string | null>(null),
      file: new FormControl(null),
    });
    this.setupChatData();
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  private setupChatData(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const chatId = params.get('chat_id');
      if (chatId) {
        this.chatId = parseInt(chatId);
        this.webSocketService.openWebSocket(this.chatId);
        this.chatName = this.chatService.getChatById(this.chatId).name;
        localStorage.setItem('chat', this.chatName);
      }
      this.userId = this.authService.getDecodedToken().id;
      localStorage.setItem('user', String(this.userId));
    });
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid) return;
    if (this.messageForm.value.message || this.files.length > 0) {
      try {
        const newMessage: Message = {
          text: this.messageForm.value.message! || '',
          chat: this.chatId,
          from: this.userId,
          files: await convertFilesToBase64(this.files),
        };
        this.webSocketService.sendMessage(newMessage);
        this.messageForm.reset();
        this.files = [];
      } catch (error) {
        console.error('Error sending chat-sidebar-item-message:', error);
      }
    }
  }

  deleteFile(file: File): void {
    this.files = this.files.filter((f) => f !== file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files.push(...Array.from(input.files));
    } else {
      console.log('No files were selected.');
    }
  }
  private scrollToBottom(): void {
    if (this.messageContainer) {
      const nativeElement = this.messageContainer.nativeElement;
      nativeElement.scrollTop = nativeElement.scrollHeight;
    }
  }
}
