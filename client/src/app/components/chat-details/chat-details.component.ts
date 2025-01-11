import {Component, Input, OnInit} from '@angular/core';
import {environment} from '../../../environments/environment';
import {User} from '../../interfaces/user.interface';
import {getUser} from '../../utilities/GetUser';
import {NgClass} from '@angular/common';
import {ChatDetailsService} from '../../services/chat-details.service';
import {Chat} from '../../interfaces/chat.interface';

@Component({
  selector: 'chat-details',
  imports: [
    NgClass
  ],
  templateUrl: './chat-details.component.html',
  standalone: true,
  styleUrl: './chat-details.component.scss',
  host: {"class":""}
})
export class ChatDetailsComponent implements OnInit {
  @Input() chat!: Chat;
  animation = "slide-in";
  classes = "w-full xl:w-1/5";
  base_url = environment['BASE_URL'];
  user: User | null = null;
  chatImage: string = '';

  constructor(protected readonly chatDetailsService: ChatDetailsService) {
  }

  ngOnInit() {
    this.user = getUser();
    if (this.user) {
      this.chatImage = ``;
    }
    this.chatDetailsService.isChatDetailsVisible$.subscribe(isChatDetailsVisible => {
      if (isChatDetailsVisible) {
        this.animation = "slide-in";
        this.classes = "w-full xl:w-1/5 r-0 transition-all duration-300";
      } else {
        this.animation = "slide-out";
        this.classes = "w-full xl:w-1/5";
      }
    })
  }

  closeChatDetails(): void {
    this.animation = "slide-out"
    setTimeout(() => {
      this.chatDetailsService.closeChatDetails();
    }, 300);
  }
}
