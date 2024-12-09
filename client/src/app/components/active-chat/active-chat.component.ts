import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Message, MessageFile } from '../../data/interfaces/message.interface';
import { MessageComponent } from '../message/message.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../data/services/auth.service';
import { WebSocketService } from '../../data/services/web-socket.service';
import { convertFilesToBase64 } from '../../data/utilities/BaseConvertor';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileComponent } from '../file/file.component';
import { ChatService } from '../../data/services/chat.service';

@Component({
  selector: 'app-active-chat',
  imports: [MessageComponent, RouterLink, FileComponent, ReactiveFormsModule],
  templateUrl: './active-chat.component.html',
  standalone: true,
  styleUrls: ['./active-chat.component.scss'],
})
export class ActiveChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('messageEnd') messageEnd!: ElementRef;
  chatId: number = -1;
  userId: number = -1;
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
    this.initializeForm();
    this.setupChatData();
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  private initializeForm(): void {
    this.messageForm = new FormGroup({
      message: new FormControl<string | null>(null),
      file: new FormControl(null),
    });
  }

  private setupChatData(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const chatId = params.get('chat_id');
      if (chatId) {
        this.chatId = parseInt(chatId);
        this.webSocketService.openWebSocket(this.chatId);
        this.chatService.getChats().subscribe((chats) => {
          this.chatName = this.chatService.getChatById(this.chatId).name;
        });

        localStorage.setItem('chat', this.chatName);
      }
      this.userId = this.authService.getDecodedToken().id;
    });
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid) return;
    if (this.messageForm.value.message || this.files.length>0) {
      try {
        const newMessage: Message = {
          text: this.messageForm.value.message! || '',
          chat: this.chatId,
          from: this.userId,
          files: await this.convertSelectedFilesToBase64(),
        };
        this.webSocketService.sendMessage(newMessage);
        this.clearForm();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  private async convertSelectedFilesToBase64(): Promise<MessageFile[]> {
    if (this.files.length === 0) return [];
    try {
      return await convertFilesToBase64(this.files);
    } catch (error) {
      console.error('Error converting files to Base64:', error);
      return [];
    }
  }

  private clearForm(): void {
    this.messageForm.reset();
    this.files = [];
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
  scrollToBottom(): void {
    this.messageEnd?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
