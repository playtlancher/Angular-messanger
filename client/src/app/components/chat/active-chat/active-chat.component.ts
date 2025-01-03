import { Component, OnDestroy, OnInit } from '@angular/core';
import { Message } from '../../../interfaces/message.interface';
import { MessageComponent } from '../message/message.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WebSocketService } from '../../../services/web-socket.service';
import { convertFilesToBase64 } from '../../../utilities/BaseConvertor';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadingFileComponent } from '../uploading-file/uploading-file.component';
import { ChatService } from '../../../services/chat.service';
import { ContextMenuService } from '../../../services/context-menu.service';
import { ScrollToEndDirective } from '../../../directives/scroll-to-end.directive';
import { getUser } from '../../../utilities/GetUser';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-active-chat',
  imports: [
    MessageComponent,
    RouterLink,
    UploadingFileComponent,
    ReactiveFormsModule,
    ScrollToEndDirective,
  ],
  templateUrl: './active-chat.component.html',
  standalone: true,
  styleUrls: ['./active-chat.component.scss'],
})
export class ActiveChatComponent implements OnInit, OnDestroy {
  chatId: number = -1;
  user: User | null = getUser();
  chatName: string = localStorage.getItem('chat') || '';
  messageForm!: FormGroup;
  files: File[] = [];
  protected editingMessage: Message | null = null;
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    protected readonly webSocketService: WebSocketService,
    private readonly chatService: ChatService,
    protected readonly contextMenuService: ContextMenuService,
  ) {}

  ngOnInit(): void {
    this.messageForm = new FormGroup({
      message: new FormControl<string | null>(null),
      file: new FormControl(null),
    });
    this.setupChatData();
    this.contextMenuService.messageToEdit$.subscribe((message) => {
      this.editingMessage = message;
      this.editMessage();
    });
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
        let chat = this.chatService.getChatById(this.chatId);
        if (chat) {
          this.chatName = chat.name;
        }
        localStorage.setItem('chat', this.chatName);
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid) return;
    if (this.editingMessage === null) {
      if (this.messageForm.value.message || this.files.length > 0) {
        try {
          const newMessage: Message = {
            text: this.messageForm.value.message! || '',
            chat: this.chatId,
            from: this.user!.id,
            files: await convertFilesToBase64(this.files),
          };
          this.webSocketService.sendMessage(newMessage);
          this.messageForm.reset();
          this.files = [];
        } catch (error) {
          console.error('Error sending chat-sidebar-item-message:', error);
        }
      }
    } else {
      this.editingMessage.text = this.messageForm.value.message;
      this.webSocketService.updateMessage(this.editingMessage);
      this.editingMessage = null;
      this.messageForm.reset();
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
  editMessage(): void {
    this.messageForm.patchValue({ message: this.editingMessage?.text });
  }
  cancelEditing(): void {
    this.editingMessage = null;
    this.messageForm.reset();
  }
}
