import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Message, SentFiles } from '../../data/interfaces/message.interface';
import { MessageComponent } from '../message/message.component';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../data/services/auth.service';
import { WebSocketService } from '../../data/services/web-socket.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MainPageComponent } from '../../pages/main-page/main-page.component';
import { FileComponent } from '../file/file.component';

@Component({
  selector: 'app-active-chat',
  imports: [
    MessageComponent,
    RouterOutlet,
    RouterLink,
    FileComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './active-chat.component.html',
  standalone: true,
  styleUrls: ['./active-chat.component.scss'],
})
export class ActiveChatComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  mainPageComponent = inject(MainPageComponent);
  chatId: number = -1;
  userId: number = -1;
  chatName: string = '';
  messageForm!: FormGroup;
  files: File[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public webSocketService: WebSocketService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupChatData();
  }

  ngOnDestroy(): void {
    this.webSocketService.closeWebSocket();
  }

  private initializeForm(): void {
    this.messageForm = this.formBuilder.group({
      message: [null, Validators.required],
      file: [null],
    });
  }

  private setupChatData(): void {
    this.chatName = localStorage.getItem('chat') || '';
    this.activatedRoute.paramMap.subscribe((params) => {
      const chatId = params.get('chat_id');
      if (chatId) {
        this.chatId = parseInt(chatId);
        this.webSocketService.openWebSocket(this.chatId);
        this.chatName = this.getChatName(this.chatId) || this.chatName;
        localStorage.setItem('chat', this.chatName);
      }
      this.userId = this.authService.getDecodedToken().id;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  private getChatName(chatId: number): string {
    return (
      this.mainPageComponent.getChats().find((chat) => chat.id === chatId)
        ?.name || ''
    );
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid) return;

    const base64Files: SentFiles[] = await this.convertFilesToBase64();
    const newMessage: Message = {
      id: -1,
      text: this.messageForm.value.message,
      chat: this.chatId,
      from: this.userId,
      date: '',
      files: base64Files,
    };

    this.webSocketService.sendMessage(newMessage);
    this.clearForm();
    setTimeout(() => this.scrollToBottom(), 10);
  }

  private clearForm(): void {
    this.messageForm.reset();
    this.files = [];
  }

  private scrollToBottom(): void {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
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
      this.files = [];
      console.log('No files were selected.');
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async convertFilesToBase64(): Promise<SentFiles[]> {
    return Promise.all(
      this.files.map((file) =>
        this.convertFileToBase64(file)
          .then((base64File) => ({ name: file.name, data: base64File }))
          .catch((error) => {
            console.error('Error converting file to Base64:', error);
            return null;
          }),
      ),
    ).then((files) => files.filter((file) => file !== null) as SentFiles[]);
  }
}
