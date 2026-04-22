import React, { useRef } from 'react'
import { usePixelArt } from '../context/PixelArtContext'

const Toolbar = () => {
  const {
    currentColor,
    currentTool,
    colorPalette,
    gridSize,
    setCurrentColor,
    setCurrentTool,
    setGridSize,
    clearGrid,
    grid
  } = usePixelArt()

  const exportCanvas = () => {
    const exportCanvas = document.createElement('canvas')
    const ctx = exportCanvas.getContext('2d')
    const scale = 10
    exportCanvas.width = gridSize * scale
    exportCanvas.height = gridSize * scale

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        ctx.fillStyle = grid[y][x]
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }
    }

    const link = document.createElement('a')
    link.download = `pixel-art-${Date.now()}.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3 className="section-title">画布尺寸</h3>
        <div className="size-buttons">
          <button
            className={`size-btn ${gridSize === 16 ? 'active' : ''}`}
            onClick={() => setGridSize(16)}
          >
            16×16
          </button>
          <button
            className={`size-btn ${gridSize === 32 ? 'active' : ''}`}
            onClick={() => setGridSize(32)}
          >
            32×32
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="section-title">工具</h3>
        <div className="tool-buttons">
          <button
            className={`tool-btn ${currentTool === 'brush' ? 'active' : ''}`}
            onClick={() => setCurrentTool('brush')}
            title="画刷"
          >
            <span className="tool-icon">🖌️</span>
          </button>
          <button
            className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
            onClick={() => setCurrentTool('eraser')}
            title="橡皮擦"
          >
            <span className="tool-icon">🧹</span>
          </button>
          <button
            className={`tool-btn ${currentTool === 'fill' ? 'active' : ''}`}
            onClick={() => setCurrentTool('fill')}
            title="油漆桶"
          >
            <span className="tool-icon">🪣</span>
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="section-title">调色板</h3>
        <div className="color-palette">
          <div className="current-color" style={{ backgroundColor: currentColor }} />
          <div className="colors-grid">
            {colorPalette.map((color, index) => (
              <button
                key={index}
                className={`color-btn ${currentColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="section-title">操作</h3>
        <div className="action-buttons">
          <button className="action-btn clear-btn" onClick={clearGrid}>
            清空画布
          </button>
          <button className="action-btn export-btn" onClick={exportCanvas}>
            导出PNG
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
