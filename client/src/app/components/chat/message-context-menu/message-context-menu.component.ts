import { Component, Input } from '@angular/core';
import { Message } from '../../../interfaces/message.interface';
import { ContextMenuService } from '../../../services/context-menu.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'message-context-menu',
  templateUrl: './message-context-menu.component.html',
  styleUrls: ['./message-context-menu.component.scss'],
  standalone: true,
  imports: [NgStyle],
})
export class MessageContextMenuComponent {
  @Input() message!: Message;
  @Input() positionX!: number;
  @Input() positionY!: number;
  screenWidth: number = 0;
  screenHeight: number = 0;
  constructor(protected contextMenuService: ContextMenuService) {
    this.screenWidth = document.documentElement.clientWidth;
    this.screenHeight = document.documentElement.clientHeight;
  }

  selectAction(action: string) {
    switch (action) {
      case 'Update': {
        this.editMessage();
        this.contextMenuService.close();
        break;
      }
      case 'Delete': {
        this.deleteMessage();
        this.contextMenuService.close();
        break;
      }
    }
  }
  private deleteMessage() {
    this.contextMenuService.deleteMessage(this.message);
  }
  private editMessage(): void {
    this.contextMenuService.editMessage(this.message);
  }
}
