export interface Message {
  id?: number;
  text: string;
  chat: number;
  from: number;
  date?: Date;
  files?: MessageFile[];
}

export interface MessageFile {
  name: string;
  data: string;
  id: string;
}
