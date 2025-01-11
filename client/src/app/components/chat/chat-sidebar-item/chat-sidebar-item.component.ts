import {Component, Input, OnInit} from '@angular/core';
import {Chat} from '../../../interfaces/chat.interface';
import {RouterLink} from '@angular/router';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'chat-sidebar-item',
  templateUrl: './chat-sidebar-item.component.html',
  styleUrls: ['./chat-sidebar-item.component.scss'],
  imports: [RouterLink],
  standalone: true,
})
export class ChatSidebarItemComponent implements OnInit {
  @Input() chat!: Chat;
  base_url = environment['BASE_URL'];
  chatImage:string = "none";
  ngOnInit() {
    if (this.chat.image!== "none"){
      this.chatImage = `${this.base_url}/chats/image/${this.chat.id}`;
    }
  }
}
