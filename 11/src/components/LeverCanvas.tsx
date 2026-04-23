import React, { useRef, useEffect, useState, useCallback } from 'react'
import { FulcrumPosition, Weight, Hook, WeightValue } from '../types'
import { calculateHooks, calculateTorque, generateId } from '../utils'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LEVER_LENGTH,
  LEVER_THICKNESS,
  FULCRUM_POSITIONS,
  COLORS,
} from '../constants'

interface LeverCanvasProps {
  weights: Weight[]
  fulcrumPosition: FulcrumPosition
  selectedWeight: WeightValue | null
  onWeightsChange: (weights: Weight[]) => void
  onClearSelectedWeight: () => void
}

const LeverCanvas: React.FC<LeverCanvasProps> = ({
  weights,
  fulcrumPosition,
  selectedWeight,
  onWeightsChange,
  onClearSelectedWeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hooks, setHooks] = useState<Hook[]>([])
  const [leverAngle, setLeverAngle] = useState(0)
  const [animationRef, setAnimationRef] = useState<{
    isAnimating: boolean
    targetAngle: number
    currentAngle: number
    velocity: number
  }>({ isAnimating: false, targetAngle: 0, currentAngle: 0, velocity: 0 })
  const [draggingWeight, setDraggingWeight] = useState<{
    weight: Weight
    mouseX: number
    mouseY: number
  } | null>(null)
  const [hoveredHook, setHoveredHook] = useState<number | null>(null)

  const centerX = CANVAS_WIDTH / 2
  const leverY = CANVAS_HEIGHT * 0.4
  const fulcrumOffset = FULCRUM_POSITIONS[fulcrumPosition].offset
  const fulcrumX = centerX - LEVER_LENGTH / 2 + LEVER_LENGTH * fulcrumOffset

  useEffect(() => {
    const newHooks = calculateHooks(fulcrumPosition)
    setHooks(newHooks)
  }, [fulcrumPosition])

  useEffect(() => {
    const torque = calculateTorque(weights, hooks)
    let targetAngle = 0

    if (!torque.isBalanced) {
      const torqueDiff = torque.leftTorque - torque.rightTorque
      const maxAngle = 0.3
      const normalizedDiff = Math.min(Math.abs(torqueDiff) / 50, 1)
      targetAngle = normalizedDiff * maxAngle * (torqueDiff > 0 ? -1 : 1)
    }

    setAnimationRef((prev) => ({
      ...prev,
      targetAngle,
      isAnimating: true,
    }))
  }, [weights, hooks])

  useEffect(() => {
    let animationFrame: number

    const animate = () => {
      setAnimationRef((prev) => {
        if (!prev.isAnimating) return prev

        const damping = 0.92
        const springForce = 0.15

        const force = (prev.targetAngle - prev.currentAngle) * springForce
        const newVelocity = (prev.velocity + force) * damping
        const newAngle = prev.currentAngle + newVelocity

        const isStillMoving = Math.abs(newVelocity) > 0.001 || Math.abs(prev.targetAngle - newAngle) > 0.001

        if (isStillMoving) {
          setLeverAngle(newAngle)
          return {
            ...prev,
            currentAngle: newAngle,
            velocity: newVelocity,
          }
        } else {
          setLeverAngle(prev.targetAngle)
          return {
            ...prev,
            currentAngle: prev.targetAngle,
            velocity: 0,
            isAnimating: false,
          }
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  const drawLever = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save()
      ctx.translate(fulcrumX, leverY)
      ctx.rotate(leverAngle)

      const leverStartX = -LEVER_LENGTH * fulcrumOffset
      const leverEndX = LEVER_LENGTH * (1 - fulcrumOffset)

      const leverGradient = ctx.createLinearGradient(
        leverStartX,
        -LEVER_THICKNESS / 2,
        leverStartX,
        LEVER_THICKNESS / 2
      )
      leverGradient.addColorStop(0, COLORS.leverHighlight)
      leverGradient.addColorStop(0.5, COLORS.lever)
      leverGradient.addColorStop(1, COLORS.woodDark)

      ctx.fillStyle = leverGradient
      ctx.fillRect(leverStartX, -LEVER_THICKNESS / 2, LEVER_LENGTH, LEVER_THICKNESS)

      ctx.strokeStyle = COLORS.metalDark
      ctx.lineWidth = 1
      ctx.strokeRect(leverStartX, -LEVER_THICKNESS / 2, LEVER_LENGTH, LEVER_THICKNESS)

      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + i * 0.02})`
        ctx.fillRect(
          leverStartX,
          -LEVER_THICKNESS / 2 + i * 2 + 1,
          LEVER_LENGTH,
          1
        )
      }

      ctx.restore()
    },
    [fulcrumX, leverY, leverAngle, fulcrumOffset]
  )

  const drawFulcrum = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save()
      ctx.translate(fulcrumX, leverY)

      const baseWidth = 60
      const baseHeight = 40
      const triangleHeight = 20

      const baseGradient = ctx.createLinearGradient(
        -baseWidth / 2,
        0,
        baseWidth / 2,
        baseHeight
      )
      baseGradient.addColorStop(0, COLORS.metalHighlight)
      baseGradient.addColorStop(0.3, COLORS.metalLight)
      baseGradient.addColorStop(1, COLORS.metalDark)

      ctx.fillStyle = baseGradient
      ctx.beginPath()
      ctx.moveTo(-baseWidth / 2, 0)
      ctx.lineTo(-baseWidth / 2 + 10, -triangleHeight)
      ctx.lineTo(baseWidth / 2 - 10, -triangleHeight)
      ctx.lineTo(baseWidth / 2, 0)
      ctx.lineTo(baseWidth / 2, baseHeight)
      ctx.lineTo(-baseWidth / 2, baseHeight)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = COLORS.metalDark
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = COLORS.metalHighlight
      ctx.beginPath()
      ctx.arc(0, -5, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    },
    [fulcrumX, leverY]
  )

  const drawHooks = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save()
      ctx.translate(fulcrumX, leverY)
      ctx.rotate(leverAngle)

      hooks.forEach((hook) => {
        const hookX = hook.position - fulcrumX + centerX - LEVER_LENGTH / 2

        ctx.save()
        ctx.translate(hookX, LEVER_THICKNESS / 2)

        const hookLength = 25
        ctx.strokeStyle = COLORS.hook
        ctx.lineWidth = 3
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, hookLength)
        ctx.arc(6, hookLength, 6, Math.PI, 0)
        ctx.stroke()

        if (hoveredHook === hook.index) {
          ctx.strokeStyle = COLORS.gold
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(0, hookLength + 6, 12, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.restore()

        if (hook.distance > 0) {
          ctx.save()
          ctx.translate(hookX, LEVER_THICKNESS / 2 + 50)
          ctx.rotate(-leverAngle)

          ctx.fillStyle = COLORS.text
          ctx.font = '12px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(`${hook.distance.toFixed(0)}`, 0, 0)
          ctx.font = '10px monospace'
          ctx.fillText('cm', 0, 12)

          ctx.restore()
        }
      })

      ctx.restore()
    },
    [hooks, fulcrumX, leverY, leverAngle, centerX, hoveredHook]
  )

  const drawWeights = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save()
      ctx.translate(fulcrumX, leverY)
      ctx.rotate(leverAngle)

      const weightsByHook: { [key: number]: Weight[] } = {}
      weights.forEach((weight) => {
        if (weight.position !== null) {
          if (!weightsByHook[weight.position]) {
            weightsByHook[weight.position] = []
          }
          weightsByHook[weight.position].push(weight)
        }
      })

      hooks.forEach((hook) => {
        const hookX = hook.position - fulcrumX + centerX - LEVER_LENGTH / 2
        const hookWeights = weightsByHook[hook.index] || []

        hookWeights.forEach((weight, index) => {
          const weightWidth = 35
          const weightHeight = 25
          const spacing = 5

          let weightColor = COLORS.weight1
          if (weight.value === 2) weightColor = COLORS.weight2
          if (weight.value === 5) weightColor = COLORS.weight5

          const weightY = LEVER_THICKNESS / 2 + 25 + index * (weightHeight + spacing)

          ctx.save()
          ctx.translate(hookX, weightY)

          const weightGradient = ctx.createLinearGradient(
            -weightWidth / 2,
            -weightHeight / 2,
            weightWidth / 2,
            weightHeight / 2
          )
          weightGradient.addColorStop(0, '#ffffff')
          weightGradient.addColorStop(0.2, weightColor)
          weightGradient.addColorStop(1, weightColor)

          ctx.fillStyle = weightGradient
          ctx.beginPath()
          ctx.roundRect(-weightWidth / 2, -weightHeight / 2, weightWidth, weightHeight, 3)
          ctx.fill()

          ctx.strokeStyle = COLORS.metalDark
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = COLORS.metalHighlight
          ctx.beginPath()
          ctx.roundRect(-weightWidth / 2 + 3, -weightHeight / 2 + 3, weightWidth - 6, 3, 1)
          ctx.fill()

          ctx.fillStyle = 'white'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(`${weight.value}N`, 0, 0)

          ctx.restore()
        })
      })

      ctx.restore()
    },
    [weights, hooks, fulcrumX, leverY, leverAngle, centerX]
  )

  const drawDraggingWeight = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!draggingWeight) return

      const weightWidth = 35
      const weightHeight = 25

      let weightColor = COLORS.weight1
      if (draggingWeight.weight.value === 2) weightColor = COLORS.weight2
      if (draggingWeight.weight.value === 5) weightColor = COLORS.weight5

      ctx.save()
      ctx.translate(draggingWeight.mouseX, draggingWeight.mouseY)
      ctx.globalAlpha = 0.8

      const weightGradient = ctx.createLinearGradient(
        -weightWidth / 2,
        -weightHeight / 2,
        weightWidth / 2,
        weightHeight / 2
      )
      weightGradient.addColorStop(0, '#ffffff')
      weightGradient.addColorStop(0.2, weightColor)
      weightGradient.addColorStop(1, weightColor)

      ctx.fillStyle = weightGradient
      ctx.beginPath()
      ctx.roundRect(-weightWidth / 2, -weightHeight / 2, weightWidth, weightHeight, 3)
      ctx.fill()

      ctx.strokeStyle = COLORS.metalDark
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${draggingWeight.weight.value}N`, 0, 0)

      ctx.restore()
    },
    [draggingWeight]
  )

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      bgGradient.addColorStop(0, COLORS.woodDark)
      bgGradient.addColorStop(0.5, COLORS.background)
      bgGradient.addColorStop(1, COLORS.woodDark)

      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.02 + Math.random() * 0.03})`
        ctx.lineWidth = 1
        const y = Math.random() * CANVAS_HEIGHT
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(
          CANVAS_WIDTH * 0.3,
          y + (Math.random() - 0.5) * 20,
          CANVAS_WIDTH * 0.7,
          y + (Math.random() - 0.5) * 20,
          CANVAS_WIDTH,
          y
        )
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8)
    },
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      drawBackground(ctx)
      drawFulcrum(ctx)
      drawLever(ctx)
      drawHooks(ctx)
      drawWeights(ctx)
      drawDraggingWeight(ctx)
    }

    draw()
  }, [
    drawBackground,
    drawFulcrum,
    drawLever,
    drawHooks,
    drawWeights,
    drawDraggingWeight,
    leverAngle,
    hooks,
    weights,
    draggingWeight,
    hoveredHook,
  ])

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0] || (e as any).changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const findNearestHook = (mouseX: number, mouseY: number): number | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    let nearestHook: number | null = null
    let minDistance = Infinity

    const cosAngle = Math.cos(leverAngle)
    const sinAngle = Math.sin(leverAngle)

    const localMouseX = (mouseX - fulcrumX) * cosAngle + (mouseY - leverY) * sinAngle + fulcrumX
    const localMouseY = -(mouseX - fulcrumX) * sinAngle + (mouseY - leverY) * cosAngle + leverY

    hooks.forEach((hook) => {
      const hookCanvasX = centerX - LEVER_LENGTH / 2 + hook.position
      const hookCanvasY = leverY + 40

      const dx = localMouseX - hookCanvasX
      const dy = localMouseY - hookCanvasY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 50 && distance < minDistance) {
        minDistance = distance
        nearestHook = hook.index
      }
    })

    return nearestHook
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e)

    const cosAngle = Math.cos(leverAngle)
    const sinAngle = Math.sin(leverAngle)

    const localMouseX = (x - fulcrumX) * cosAngle + (y - leverY) * sinAngle + fulcrumX
    const localMouseY = -(x - fulcrumX) * sinAngle + (y - leverY) * cosAngle + leverY

    const weightsByHook: { [key: number]: Weight[] } = {}
    weights.forEach((weight) => {
      if (weight.position !== null) {
        if (!weightsByHook[weight.position]) {
          weightsByHook[weight.position] = []
        }
        weightsByHook[weight.position].push(weight)
      }
    })

    for (const hookIndex in weightsByHook) {
      const hook = hooks.find((h) => h.index === parseInt(hookIndex))
      if (!hook) continue

      const hookCanvasX = centerX - LEVER_LENGTH / 2 + hook.position
      const hookWeights = weightsByHook[hookIndex]

      for (let i = 0; i < hookWeights.length; i++) {
        const weightY = leverY + LEVER_THICKNESS / 2 + 25 + i * 30
        const weightWidth = 35
        const weightHeight = 25

        if (
          localMouseX >= hookCanvasX - weightWidth / 2 &&
          localMouseX <= hookCanvasX + weightWidth / 2 &&
          localMouseY >= weightY - weightHeight / 2 &&
          localMouseY <= weightY + weightHeight / 2
        ) {
          const clickedWeight = hookWeights[i]
          setDraggingWeight({
            weight: clickedWeight,
            mouseX: x,
            mouseY: y,
          })

          const updatedWeights = weights.filter((w) => w.id !== clickedWeight.id)
          onWeightsChange(updatedWeights)
          return
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e)

    if (draggingWeight) {
      setDraggingWeight((prev) => (prev ? { ...prev, mouseX: x, mouseY: y } : null))
    }

    const nearestHook = findNearestHook(x, y)
    setHoveredHook(nearestHook)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e)

    if (draggingWeight) {
      const nearestHook = findNearestHook(x, y)

      if (nearestHook !== null) {
        const newWeight = { ...draggingWeight.weight, position: nearestHook }
        onWeightsChange([...weights, newWeight])
      } else {
        onWeightsChange([...weights, draggingWeight.weight])
      }

      setDraggingWeight(null)
    } else if (selectedWeight !== null) {
      const nearestHook = findNearestHook(x, y)

      if (nearestHook !== null) {
        const newWeight: Weight = {
          id: generateId(),
          value: selectedWeight,
          position: nearestHook,
        }
        onWeightsChange([...weights, newWeight])
      }

      onClearSelectedWeight()
    }

    setHoveredHook(null)
  }

  const handleMouseLeave = () => {
    if (draggingWeight) {
      onWeightsChange([...weights, draggingWeight.weight])
      setDraggingWeight(null)
    }
    setHoveredHook(null)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleMouseDown(e as any)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleMouseMove(e as any)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = (e as any).changedTouches[0]
    if (touch) {
      handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY } as any)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        width: '100%',
        height: 'auto',
        cursor: draggingWeight ? 'grabbing' : 'grab',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  )
}

export default LeverCanvas
