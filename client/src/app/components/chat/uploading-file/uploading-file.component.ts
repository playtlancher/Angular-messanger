import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'uploading-file',
  imports: [],
  templateUrl: './uploading-file.component.html',
  styleUrls: ['./uploading-file.component.scss'],
  standalone: true,
})
export class UploadingFileComponent {
  @Input() file!: File;
  @Output() action = new EventEmitter<File>();

  removeFile() {
    this.action.emit(this.file);
  }
}
