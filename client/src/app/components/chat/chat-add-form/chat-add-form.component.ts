import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-chat-sidebar-item-add-form',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './chat-add-form.component.html',
  standalone: true,
  styleUrl: './chat-add-form.component.scss',
})
export class ChatAddFormComponent {
  users: User[] = [];
  chatForm: FormGroup;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {
    this.chatForm = new FormGroup({
      chatName: new FormControl<string | null>(null, Validators.required),
      username: new FormControl<string | null>(null, Validators.required),
    });
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  addChat() {
    if (this.chatForm.invalid) {
      return;
    }
    const { chatName, username } = this.chatForm.value;
    this.chatService.addChat(chatName, username);
    this.chatForm.reset();
  }
}
