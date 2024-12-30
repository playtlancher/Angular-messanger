import { Component, Input } from '@angular/core';
import { Message } from '../../../data/interfaces/message.interface';
import { ContextMenuService } from '../../../data/services/context-menu.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  standalone: true,
  imports: [NgStyle],
})
export class ContextMenuComponent {
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
        // this.editMessage();
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
  deleteMessage() {
    this.contextMenuService.deleteMessage(this.message);
  }
}
