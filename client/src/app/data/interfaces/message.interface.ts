export interface Message {
  id: number;
  text: string;
  chat: number;
  from: number;
  date: string;
  token?: string;
}
