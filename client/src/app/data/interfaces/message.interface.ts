export interface File {
  id: string;
  name: string;
}

export interface Message {
  id: number;
  text: string;
  chat: number;
  from: number;
  date: string;
  files?: SentFiles[];
}

export interface SentFiles {
  name: string;
  data: string;
  id: string;
}

export interface ReceivedMessage {
  id: number;
  text: string;
  chat: number;
  from: number;
  date: string;
  files?: ReceivedFile[];
}

export interface ReceivedFile {
  id: string;
  name: string;
  message_id: number;
}
