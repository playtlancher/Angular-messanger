import { Component, Input } from '@angular/core';
import { FileService } from '../../../services/file.service';
import { FormsModule } from '@angular/forms';
import { Message, MessageFile } from '../../../interfaces/message.interface';
import { DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass, NgOptimizedImage],
})
export class MessageComponent {
  @Input() message!: Message;

  user: number | null = null;

  constructor(
    private fileService: FileService,
    public authService: AuthService,
  ) {
    this.user = this.authService.getUserId();
  }

  downloadFile(file: MessageFile) {
    this.fileService.installFile(file);
  }

  messageStyleClass() {
    const isSender = this.message.from === this.user;
    return {
      message: true,
      'items-start': true,
      'max-w-xs': true,
      'p-4': true,
      shadow: true,
      'rounded-lg': true,
      'text-white': true,
      'flex-col': true,
      flex: true,
      'bg-indigo-500': !isSender,
      'bg-gray-700': isSender,
    };
  }
}
