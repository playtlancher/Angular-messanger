import {
  Component,
  ComponentRef,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Message } from '../../data/interfaces/message.interface';
import { WebSocketService } from '../../data/services/web-socket.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() user!: number;
  @ViewChild('menuContainer', { read: ViewContainerRef }) menuContainer!: ViewContainerRef;

  private static activeMenuRef: ComponentRef<ContextMenuComponent> | null = null;

  constructor(public webSocketService: WebSocketService) {}

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    if(this.message.from === this.user){
      if (MessageComponent.activeMenuRef) {
        MessageComponent.activeMenuRef.destroy();
      }

      const menuRef = this.menuContainer.createComponent(ContextMenuComponent);


      MessageComponent.activeMenuRef = menuRef;

      menuRef.instance.action.subscribe((action: string) => {
        console.log(`Action: ${action} on message:`, this.message);
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
}
