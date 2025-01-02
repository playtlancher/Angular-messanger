import { Component, Input } from '@angular/core';
import { Chat } from '../../../interfaces/chat.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'chat-sidebar-item',
  templateUrl: './chat-sidebar-item.component.html',
  styleUrls: ['./chat-sidebar-item.component.scss'],
  imports: [RouterLink],
  standalone: true,
})
export class ChatSidebarItemComponent {
  @Input() chat!: Chat;
}
