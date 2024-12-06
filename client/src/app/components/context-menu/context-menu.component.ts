import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  standalone: true,
})
export class ContextMenuComponent {
  @Output() action = new EventEmitter<string>();

  selectAction(action: string) {
    this.action.emit(action);
  }
}
