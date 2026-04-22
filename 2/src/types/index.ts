export type TimerMode = 'focus' | 'break';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
}
