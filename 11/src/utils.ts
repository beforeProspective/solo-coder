import { FulcrumPosition, Weight, Hook } from './types'
import { LEVER_LENGTH, HOOK_COUNT, FULCRUM_POSITIONS } from './constants'

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function calculateHooks(fulcrumPosition: FulcrumPosition): Hook[] {
  const offset = FULCRUM_POSITIONS[fulcrumPosition].offset
  const fulcrumX = LEVER_LENGTH * offset
  const spacing = LEVER_LENGTH / (HOOK_COUNT + 1)

  const hooks: Hook[] = []

  for (let i = 0; i < HOOK_COUNT; i++) {
    const x = spacing * (i + 1)
    const distance = Math.abs(x - fulcrumX)
    const side: 'left' | 'right' | 'center' = x < fulcrumX ? 'left' : x > fulcrumX ? 'right' : 'center'

    hooks.push({
      index: i,
      position: x,
      distance,
      side,
    })
  }

  return hooks
}

export function calculateTorque(
  weights: Weight[],
  hooks: Hook[]
): { leftTorque: number; rightTorque: number; isBalanced: boolean } {
  let leftTorque = 0
  let rightTorque = 0

  weights.forEach((weight) => {
    if (weight.position === null) return

    const hook = hooks.find((h) => h.index === weight.position)
    if (!hook) return

    const torque = weight.value * hook.distance

    if (hook.side === 'left') {
      leftTorque += torque
    } else if (hook.side === 'right') {
      rightTorque += torque
    }
  })

  return {
    leftTorque,
    rightTorque,
    isBalanced: Math.abs(leftTorque - rightTorque) < 0.1,
  }
}

export function generateChallenge(): {
  weights: Weight[]
  fulcrumPosition: FulcrumPosition
  targetWeightCount: number
  hint: string
} {
  const fulcrumOptions: FulcrumPosition[] = ['center', 'left', 'right']
  const fulcrumPosition = fulcrumOptions[Math.floor(Math.random() * fulcrumOptions.length)]
  const hooks = calculateHooks(fulcrumPosition)

  const weights: Weight[] = []
  const usedPositions: Set<number> = new Set()

  const leftHooks = hooks.filter((h) => h.side === 'left')
  const rightHooks = hooks.filter((h) => h.side === 'right')

  const initialWeightCount = Math.floor(Math.random() * 2) + 1

  for (let i = 0; i < initialWeightCount; i++) {
    const availableLeftHooks = leftHooks.filter((h) => !usedPositions.has(h.index))
    const availableRightHooks = rightHooks.filter((h) => !usedPositions.has(h.index))

    const useLeft = Math.random() > 0.5 && availableLeftHooks.length > 0

    const hookPool = useLeft ? availableLeftHooks : availableRightHooks
    if (hookPool.length === 0) continue

    const hook = hookPool[Math.floor(Math.random() * hookPool.length)]
    const weightValue: 1 | 2 | 5 = [1, 2, 5][Math.floor(Math.random() * 3)] as 1 | 2 | 5

    weights.push({
      id: generateId(),
      value: weightValue,
      position: hook.index,
    })

    usedPositions.add(hook.index)
  }

  const torque = calculateTorque(weights, hooks)
  const torqueDiff = torque.leftTorque - torque.rightTorque

  let hint = ''
  if (torqueDiff > 0) {
    hint = '左侧力矩较大，请在右侧添加砝码'
  } else if (torqueDiff < 0) {
    hint = '右侧力矩较大，请在左侧添加砝码'
  } else {
    hint = '当前状态已经平衡，请尝试调整'
  }

  return {
    weights,
    fulcrumPosition,
    targetWeightCount: Math.floor(Math.random() * 2) + 1,
    hint,
  }
}

export function checkChallengeComplete(
  initialWeights: Weight[],
  currentWeights: Weight[],
  fulcrumPosition: FulcrumPosition,
  targetWeightCount: number
): boolean {
  const hooks = calculateHooks(fulcrumPosition)
  const torque = calculateTorque(currentWeights, hooks)

  const addedWeightCount = currentWeights.length - initialWeights.length

  return torque.isBalanced && addedWeightCount <= targetWeightCount && addedWeightCount > 0
}
