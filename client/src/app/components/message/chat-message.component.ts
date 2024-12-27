import {
  Component,
  ComponentRef,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { WebSocketService } from '../../data/services/web-socket.service';
import { FileService } from '../../data/services/file.service';
import { MessageContextMenuComponent } from '../message-context-menu/message-context-menu.component';
import { FormsModule } from '@angular/forms';
import { Message, MessageFile } from '../../data/interfaces/message.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  standalone: true,
  imports: [FormsModule, DatePipe],
})
export class ChatMessageComponent {
  @Input() message!: Message;
  @Input() user!: number;
  @ViewChild('menuContainer', { read: ViewContainerRef })
  menuContainer!: ViewContainerRef;
  private static activeMenuRef: ComponentRef<MessageContextMenuComponent> | null =
    null;
  isEditing: boolean = false;
  updatedText: string = '';

  constructor(
    public webSocketService: WebSocketService,
    private fileService: FileService,
  ) {}

  public openContextMenu(event: MouseEvent) {
    event.preventDefault();
    if (this.message.from === this.user) {
      this.destroyActiveMenu();
      const menuRef = this.menuContainer.createComponent(
        MessageContextMenuComponent,
      );
      ChatMessageComponent.activeMenuRef = menuRef;

      menuRef.instance.action.subscribe((action: string) => {
        this.handleContextMenuAction(action);
      });
    }
  }

  private handleContextMenuAction(action: string) {
    if (action === 'Delete') {
      this.deleteMessage();
    } else if (action === 'Update') {
      this.startEditing();
    }
    this.destroyActiveMenu();
  }

  private deleteMessage() {
    this.webSocketService.deleteMessage(this.message);
  }

  private startEditing() {
    this.isEditing = true;
    this.updatedText = this.message.text;
  }

  saveUpdatedMessage() {
    if (this.updatedText !== this.message.text) {
      this.message.text = this.updatedText;
      this.webSocketService.updateMessage(this.message);
    }
    this.isEditing = false;
  }

  cancelUpdateMessage() {
    this.isEditing = false;
  }

  downloadFile(file: MessageFile) {
    this.fileService.installFile(file);
  }

  private destroyActiveMenu() {
    if (ChatMessageComponent.activeMenuRef) {
      ChatMessageComponent.activeMenuRef.destroy();
      ChatMessageComponent.activeMenuRef = null;
    }
  }

  onClickOutside() {
    this.destroyActiveMenu();
  }
}
