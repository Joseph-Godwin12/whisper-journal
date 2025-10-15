export interface Entry {
  id: string;
  type: 'audio' | 'text';
  date: string;
  time: string;
  content?: string;
  audioUri?: string;
  duration?: number;
}
