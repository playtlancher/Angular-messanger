import {
  Component,
  ComponentRef,
  inject,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { WebSocketService } from '../../data/services/web-socket.service';
import { FileService } from '../../data/services/file.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { FormsModule } from '@angular/forms';
import { Message, MessageFile } from '../../data/interfaces/message.interface';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() user!: number;
  @ViewChild('menuContainer', { read: ViewContainerRef })
  menuContainer!: ViewContainerRef;

  fileService = inject(FileService);

  private static activeMenuRef: ComponentRef<ContextMenuComponent> | null =
    null;
  isEditing: boolean = false;
  updatedText: string = '';

  constructor(public webSocketService: WebSocketService) {}

  public openContextMenu(event: MouseEvent ) {
    event.preventDefault();
    if (this.message.from === this.user) {
      this.destroyActiveMenu();
      const menuRef = this.menuContainer.createComponent(ContextMenuComponent);
      MessageComponent.activeMenuRef = menuRef;

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
    if (MessageComponent.activeMenuRef) {
      MessageComponent.activeMenuRef.destroy();
      MessageComponent.activeMenuRef = null;
    }
  }

  onClickOutside() {
    this.destroyActiveMenu();
  }
}
