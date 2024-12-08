import {
  Component,
  ComponentRef, inject,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Message, ReceivedFile, ReceivedMessage} from '../../data/interfaces/message.interface';
import { WebSocketService } from '../../data/services/web-socket.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [FormsModule, NgIf],
})
export class MessageComponent {
  @Input() message!: ReceivedMessage;
  @Input() user!: number;
  @ViewChild('menuContainer', { read: ViewContainerRef })
  menuContainer!: ViewContainerRef;
  http = inject(HttpClient)

  private static activeMenuRef: ComponentRef<ContextMenuComponent> | null =
    null;
  isEditing: boolean = false;
  updatedText: string = '';

  constructor(public webSocketService: WebSocketService) {}

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    if (this.message.from === this.user) {
      if (MessageComponent.activeMenuRef) {
        MessageComponent.activeMenuRef.destroy();
      }

      const menuRef = this.menuContainer.createComponent(ContextMenuComponent);

      MessageComponent.activeMenuRef = menuRef;

      menuRef.instance.action.subscribe((action: string) => {
        if (action === 'Delete') {
          this.webSocketService.deleteMessage(this.message);
        }
        if (action === 'Update') {
          this.isEditing = true;
          this.updatedText = this.message.text;
        }
        menuRef.destroy();
        MessageComponent.activeMenuRef = null;
      });
    }
  }

  onClickOutside() {
    if (MessageComponent.activeMenuRef) {
      MessageComponent.activeMenuRef.destroy();
    }
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

  downloadFile(file: ReceivedFile) {
    console.log("trying to download file");

    this.http.get(`http://localhost:8000/file/${file.id}`, { responseType: 'blob' }).subscribe(
      (response: Blob) => {
        const fileURL = window.URL.createObjectURL(response);

        const a = document.createElement('a');
        a.href = fileURL;
        a.download = file.name;
        a.click();

        window.URL.revokeObjectURL(fileURL);
      },
      (error) => {
        console.error("Error downloading file", error);
      }
    );
  }

}
