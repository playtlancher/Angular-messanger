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
  readFileAsBase64(file: File): Promise<string>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };

      reader.onerror = () => reject(`Failed to read file: ${file.name}`);
      reader.readAsDataURL(file);
    });
  };

  async convertFilesToBase64 (
    files: File[],
  ): Promise<MessageFile[]> {
    try {
      const filePromises = files.map(async (file) => {
        const base64Data = await this.readFileAsBase64(file);
        return <MessageFile>{ name: file.name, data: base64Data };
      });

      return await Promise.all(filePromises);
    } catch (error) {
      console.error('Error converting files to Base64:', error);
      return [];
    }
  };

}
