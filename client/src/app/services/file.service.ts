import { Injectable } from '@angular/core';
import { MessageFile } from '../interfaces/message.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  base_url: string = environment['BASE_URL'];

  constructor(private http: HttpClient) {}

  installFile(file: MessageFile) {
    this.http
      .get(`${this.base_url}/chats/file/${file.id}`, {
        responseType: 'blob',
        withCredentials: true,
      })
      .subscribe(
        (response: Blob) => {
          const fileURL = window.URL.createObjectURL(response);

          const a = document.createElement('a');
          a.href = fileURL;
          a.download = file.name;
          a.click();

          window.URL.revokeObjectURL(fileURL);
        },
        (error) => {
          console.error('Error downloading uploading-file', error);
        },
      );
  }
}
