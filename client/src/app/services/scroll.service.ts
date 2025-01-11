import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  @ViewChild('MessageContainer') private messageContainer!: ElementRef;
  private scrollToEnd = new BehaviorSubject<boolean>(false);
  scrollToEnd$ = this.scrollToEnd.asObservable();

  constructor() {
    this.init();
  }

  init(): void {
    this.scrollToEnd$.subscribe((shouldScroll) => {
      if (shouldScroll) {
        this.scrollToBottom();
        this.scrollToEnd.next(false);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      const nativeElement = this.messageContainer.nativeElement;

      nativeElement.scrollTop = nativeElement.scrollHeight;
    }
  }

  triggerScrollToEnd(): void {
    this.scrollToEnd.next(true);
  }
}
