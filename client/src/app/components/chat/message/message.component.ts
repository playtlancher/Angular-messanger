import {Component, Input, OnInit} from '@angular/core';
import {FileService} from '../../../services/file.service';
import {FormsModule} from '@angular/forms';
import {Message, MessageFile} from '../../../interfaces/message.interface';
import {DatePipe, NgClass, NgOptimizedImage} from '@angular/common';
import {User} from '../../../interfaces/user.interface';
import {getUser} from '../../../utilities/GetUser';
import {DataService} from '../../../services/data.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass, NgOptimizedImage],
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;

  user: User | null = null;
  avatarUrl: string = ``;
  avatarUrlObject: string | null = null;
  constructor(private fileService: FileService,private readonly dataService: DataService) {
    this.user = getUser();
  }
  ngOnInit() {
    this.avatarUrl = `${environment["BASE_URL"]}/users/avatar/${this.message.from}`;
    if (this.message.from !== this.user?.id && this.message) {
      this.dataService.getData(this.avatarUrl, { responseType: 'blob', withCredentials: true }).subscribe((response:any) => {
        if (response instanceof Blob) {
          this.avatarUrlObject = URL.createObjectURL(response);
        }else{
          this.avatarUrlObject = response;
        }
      }, (error:any) => {
        console.error("Error fetching image:", error);
      });
    } else {
      this.avatarUrlObject = null;
    }
  }


  downloadFile(file: MessageFile) {
    this.fileService.installFile(file);
  }

  messageStyleClass() {
    const isSender = this.message.from === this.user!.id;
    return {
      message: true,
      'items-start': true,
      'max-w-xs': true,
      'p-4': true,
      shadow: true,
      'rounded-lg': true,
      'text-white': true,
      'flex-col': true,
      flex: true,
      'bg-indigo-500': !isSender,
      'bg-gray-700': isSender,
    };
  }
}
