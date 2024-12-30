import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatService } from '../../../data/services/chat.service';
import { UserService } from '../../../data/services/user.service';
import { User } from '../../../data/interfaces/user.interface';

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
    this.chatService.addChat(
      this.chatForm.value.chatName,
      this.chatForm.value.username,
    );
    this.chatForm.reset();
    window.location.reload();
  }
}
