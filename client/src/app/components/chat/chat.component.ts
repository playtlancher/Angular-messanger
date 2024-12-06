import { Component, Input, OnInit } from '@angular/core';
import { Chat } from '../../data/interfaces/chat.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [RouterLink],
  standalone: true,
})
export class ChatComponent {
  @Input() chat!: Chat;
}
