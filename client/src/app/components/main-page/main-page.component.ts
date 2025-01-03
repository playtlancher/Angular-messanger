import { Component } from '@angular/core';
import { Chat } from '../../interfaces/chat.interface';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarItemComponent } from '../chat/chat-sidebar-item/chat-sidebar-item.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MessageContextMenuComponent } from '../chat/message-context-menu/message-context-menu.component';
import { ContextMenuService } from '../../services/context-menu.service';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChatContextMenuComponent } from '../chat/chat-context-menu/chat-context-menu.component';
import {ProfileComponent} from '../profile/profile.component';
import {ProfileService} from '../../services/profile.service';

@Component({
  selector: 'app-main-page',
  imports: [
    ChatSidebarItemComponent,
    RouterOutlet,
    RouterLink,
    MessageContextMenuComponent,
    AsyncPipe,
    ChatContextMenuComponent,
    ProfileComponent,
  ],
  templateUrl: './main-page.component.html',
  standalone: true,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  chats: Chat[] = [];
  isDropdownOpen = false;
  constructor(
    private readonly chatService: ChatService,
    protected readonly contextMenuService: ContextMenuService,
    private readonly authService: AuthService,
    protected readonly profileService: ProfileService,
  ) {
    this.chatService.getChats().subscribe((chats) => {
      this.chats = chats;
    });
  }
  openProfile(){
    this.profileService.isProfileOpen$.next(true);
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authService.logout();
  }
}
