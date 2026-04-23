export type WeightValue = 1 | 2 | 5

export type FulcrumPosition = 'center' | 'left' | 'right'

export interface Weight {
  id: string
  value: WeightValue
  position: number | null
}

export interface Hook {
  index: number
  position: number
  distance: number
  side: 'left' | 'right' | 'center'
}

export interface Preset {
  id: string
  name: string
  weights: Weight[]
  fulcrumPosition: FulcrumPosition
}

export interface Challenge {
  id: string
  weights: Weight[]
  fulcrumPosition: FulcrumPosition
  targetWeightCount: number
  hint: string
}
