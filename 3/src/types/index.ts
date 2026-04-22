export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  backgroundColor: NoteColor
  position: number
}

export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink'

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300' },
  green: { bg: 'bg-green-100', border: 'border-green-300' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-300' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300' },
}
