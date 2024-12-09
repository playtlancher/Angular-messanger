export interface Message {
  id?: number;
  text: string;
  chat: number;
  from: number;
  date?: string;
  files?: MessageFile[];
}

export interface MessageFile {
  name: string;
  data: string;
  id: string;
}
