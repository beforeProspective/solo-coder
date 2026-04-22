import React from 'react'
import { PixelArtProvider } from './context/PixelArtContext'
import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import './App.css'

function App() {
  return (
    <PixelArtProvider>
      <div className="app">
        <h1 className="title">像素画编辑器</h1>
        <Toolbar />
        <Canvas />
      </div>
    </PixelArtProvider>
  )
}

export default App
