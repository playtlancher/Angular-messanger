import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-message-context-menu',
  templateUrl: './message-context-menu.component.html',
  styleUrls: ['./message-context-menu.component.scss'],
  standalone: true,
})
export class MessageContextMenuComponent {
  @Output() action = new EventEmitter<string>();

  selectAction(action: string) {
    this.action.emit(action);
  }
}
