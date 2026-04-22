import React, { useRef, useEffect, useState } from 'react'
import { usePixelArt } from '../context/PixelArtContext'

const Canvas = () => {
  const canvasRef = useRef(null)
  const { grid, gridSize, currentTool, setPixel, floodFill } = usePixelArt()
  const [isDrawing, setIsDrawing] = useState(false)

  const CELL_SIZE = 20
  const canvasSize = gridSize * CELL_SIZE

  const getGridPosition = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE)
    return { x, y }
  }

  const handleMouseDown = (e) => {
    const { x, y } = getGridPosition(e)
    
    if (currentTool === 'fill') {
      floodFill(x, y)
    } else {
      setIsDrawing(true)
      setPixel(x, y)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || currentTool === 'fill') return
    const { x, y } = getGridPosition(e)
    setPixel(x, y)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleMouseLeave = () => {
    setIsDrawing(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvasSize, canvasSize)

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        ctx.fillStyle = grid[y][x]
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

        ctx.strokeStyle = '#CCCCCC'
        ctx.lineWidth = 1
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }
  }, [grid, gridSize, canvasSize])

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="pixel-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}

export default Canvas
