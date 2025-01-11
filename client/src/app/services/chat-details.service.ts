import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatDetailsService {
  isChatDetailsVisible$ = new BehaviorSubject<boolean>(false);
  constructor() { }
  openChatDetails(){
    this.isChatDetailsVisible$.next(true);
  }
  closeChatDetails(){
    this.isChatDetailsVisible$.next(false);
  }
}
