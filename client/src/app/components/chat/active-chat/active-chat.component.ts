import {Component, OnDestroy, OnInit} from '@angular/core';
import {Message} from '../../../interfaces/message.interface';
import {MessageComponent} from '../message/message.component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {WebSocketService} from '../../../services/web-socket.service';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {UploadingFileComponent} from '../uploading-file/uploading-file.component';
import {ChatService} from '../../../services/chat.service';
import {ContextMenuService} from '../../../services/context-menu.service';
import {getUser} from '../../../utilities/GetUser';
import {User} from '../../../interfaces/user.interface';
import {FileService} from '../../../services/file.service';
import {ChatDetailsComponent} from '../../chat-details/chat-details.component';
import {ChatDetailsService} from '../../../services/chat-details.service';
import {Chat} from '../../../interfaces/chat.interface';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-active-chat',
  imports: [
    MessageComponent,
    RouterLink,
    UploadingFileComponent,
    ReactiveFormsModule,
    ChatDetailsComponent,
  ],
  host: {'class': 'absolute xl:relative xl:w-3/4 flex h-full flex-col w-full z-20 bg-gray-900 bg-image overflow-hidden'},
  templateUrl: './active-chat.component.html',
  standalone: true,
  styleUrls: ['./active-chat.component.scss'],
})
export class ActiveChatComponent implements OnInit, OnDestroy {
  chat$: Chat = JSON.parse(<string>localStorage.getItem("chat"));
  user: User | null = getUser();
  messageForm = new FormGroup({
    message: new FormControl<string | null>(null),
    file: new FormControl(null),
  });
  base_url = environment["BASE_URL"];
  chatImage = "";
  files: File[] = [];
  editingMessage: Message | null = null;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    protected readonly webSocketService: WebSocketService,
    private readonly chatService: ChatService,
    protected readonly contextMenuService: ContextMenuService,
    private readonly fileService: FileService,
    protected readonly chatDetailService: ChatDetailsService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const chatId = params.get('chat_id');
      if (!chatId) {
        this.router.navigate(['/']);
        return;
      }
      this.chatService.getChats().subscribe({
        next: (chats) => {
          const chat = this.chatService.getChatById(parseInt(chatId));
          if (!chat) {
            this.router.navigate(['/']);
            return;
          }
          this.chat$ = chat;
          localStorage.setItem('chat', JSON.stringify(chat));
          this.setupChatData();
          this.subscribeToContextMenu();
        },
        error: (err) => {
          console.error('Error loading chats', err);
          this.router.navigate(['/']);
        },
      });
    });
    if (this.chat$.image!== null){
      this.chatImage = `${this.base_url}/chats/image/${this.chat$.id}`;
    }
  }


  ngOnDestroy(): void {
    localStorage.removeItem('chat');
    this.webSocketService.closeWebSocket();
  }

  private setupChatData(): void {
    this.webSocketService.openWebSocket(this.chat$!.id);
  }

  private subscribeToContextMenu(): void {
    this.contextMenuService.messageToEdit$.subscribe((message) => {
      this.editingMessage = message;
      this.messageForm.patchValue({message: this.editingMessage?.text});
    });
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid) return;

    try {
      if (this.editingMessage) {
        this.updateMessage();
      } else {
        await this.createMessage();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private async createMessage(): Promise<void> {
    if (!this.messageForm.value.message && this.files.length === 0) return;

    const newMessage: Message = {
      text: this.messageForm.value.message || '',
      chat: this.chat$!.id,
      from: this.user?.id || -1,
      files: await this.fileService.convertFilesToBase64(this.files),
    };

    this.webSocketService.sendMessage(newMessage);
    this.resetForm();
  }

  private updateMessage(): void {
    if (!this.editingMessage) return;

    this.editingMessage.text = this.messageForm.value.message || '';
    this.webSocketService.updateMessage(this.editingMessage);
    this.editingMessage = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.messageForm.reset();
    this.files = [];
  }

  deleteFile(file: File): void {
    this.files = this.files.filter((f) => f !== file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files.push(...Array.from(input.files));
    }
  }

  cancelEditing(): void {
    this.editingMessage = null;
    this.resetForm();
  }
}
