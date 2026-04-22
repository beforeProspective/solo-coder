import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FF8800', '#8800FF', '#FF0088', '#0088FF',
  '#88FF00', '#FF8888', '#88FF88', '#8888FF'
]

const STORAGE_KEY = 'pixel-art-editor-data'

const createEmptyGrid = (size) => {
  return Array(size).fill(null).map(() => Array(size).fill('#FFFFFF'))
}

const PixelArtContext = createContext()

export const usePixelArt = () => {
  const context = useContext(PixelArtContext)
  if (!context) {
    throw new Error('usePixelArt must be used within a PixelArtProvider')
  }
  return context
}

export const PixelArtProvider = ({ children }) => {
  const [gridSize, setGridSize] = useState(16)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentTool, setCurrentTool] = useState('brush')
  const [grid, setGrid] = useState(() => createEmptyGrid(16))

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setGridSize(parsed.gridSize || 16)
        setCurrentColor(parsed.currentColor || '#000000')
        setCurrentTool(parsed.currentTool || 'brush')
        setGrid(parsed.grid || createEmptyGrid(16))
      } catch (e) {
        console.error('Failed to load saved data:', e)
      }
    }
  }, [])

  useEffect(() => {
    const data = {
      gridSize,
      currentColor,
      currentTool,
      grid
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [gridSize, currentColor, currentTool, grid])

  const setPixel = useCallback((x, y) => {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row])
      
      if (currentTool === 'brush') {
        newGrid[y][x] = currentColor
      } else if (currentTool === 'eraser') {
        newGrid[y][x] = '#FFFFFF'
      }
      
      return newGrid
    })
  }, [gridSize, currentTool, currentColor])

  const floodFill = useCallback((startX, startY) => {
    if (startX < 0 || startX >= gridSize || startY < 0 || startY >= gridSize) return

    const targetColor = grid[startY][startX]
    if (targetColor === currentColor) return

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row])
      const stack = [[startX, startY]]

      while (stack.length > 0) {
        const [x, y] = stack.pop()
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue
        if (newGrid[y][x] !== targetColor) continue

        newGrid[y][x] = currentColor

        stack.push([x + 1, y])
        stack.push([x - 1, y])
        stack.push([x, y + 1])
        stack.push([x, y - 1])
      }

      return newGrid
    })
  }, [gridSize, currentColor, grid])

  const handleGridSizeChange = useCallback((newSize) => {
    if (newSize === gridSize) return
    setGridSize(newSize)
    setGrid(createEmptyGrid(newSize))
  }, [gridSize])

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid(gridSize))
  }, [gridSize])

  const value = {
    grid,
    gridSize,
    currentColor,
    currentTool,
    colorPalette: COLOR_PALETTE,
    setPixel,
    floodFill,
    setCurrentColor,
    setCurrentTool,
    setGridSize: handleGridSizeChange,
    clearGrid
  }

  return (
    <PixelArtContext.Provider value={value}>
      {children}
    </PixelArtContext.Provider>
  )
}
