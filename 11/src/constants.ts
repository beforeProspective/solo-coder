export const CANVAS_WIDTH = 900
export const CANVAS_HEIGHT = 500

export const LEVER_LENGTH = 800
export const LEVER_THICKNESS = 12
export const HOOK_COUNT = 8

export const WEIGHT_TYPES: Array<{ value: 1 | 2 | 5; label: string }> = [
  { value: 1, label: '1N' },
  { value: 2, label: '2N' },
  { value: 5, label: '5N' },
]

export const FULCRUM_POSITIONS: Record<string, { value: 'center' | 'left' | 'right'; label: string; offset: number }> = {
  center: { value: 'center', label: '中心', offset: 0.5 },
  left: { value: 'left', label: '左侧1/4处', offset: 0.25 },
  right: { value: 'right', label: '右侧1/4处', offset: 0.75 },
}

export const COLORS = {
  background: '#2c1810',
  woodDark: '#1a0f0a',
  woodLight: '#3d2317',
  metalDark: '#555555',
  metalLight: '#888888',
  metalHighlight: '#aaaaaa',
  gold: '#ffd700',
  lever: '#8b4513',
  leverHighlight: '#cd853f',
  hook: '#666666',
  weight1: '#4a90d9',
  weight2: '#e74c3c',
  weight5: '#9b59b6',
  text: '#f5f5dc',
  balance: '#4caf50',
  unbalance: '#ff6b6b',
}
