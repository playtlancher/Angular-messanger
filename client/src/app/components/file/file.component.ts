import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file',
  imports: [],
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  standalone: true,
})
export class FileComponent {
  @Input() file!: File;
  @Output() action = new EventEmitter<File>();

  removeFile() {
    this.action.emit(this.file);
  }
}
