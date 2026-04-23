<template>
  <div class="simulator-container">
    <div class="main-content">
      <div class="canvas-wrapper">
        <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
      </div>
      
      <div class="data-panel">
        <h3>实时数据</h3>
        <div class="data-item">
          <span class="label">物块密度:</span>
          <span class="value">{{ objectDensity.toFixed(2) }} g/cm³</span>
        </div>
        <div class="data-item">
          <span class="label">液体密度:</span>
          <span class="value">{{ liquidDensity.toFixed(2) }} g/cm³</span>
        </div>
        <div class="data-item">
          <span class="label">物块体积:</span>
          <span class="value">{{ objectVolume.toFixed(2) }} cm³</span>
        </div>
        <div class="data-item highlight">
          <span class="label">物块质量:</span>
          <span class="value">{{ objectMass.toFixed(2) }} g</span>
        </div>
        
        <div class="divider"></div>
        
        <h3>受力分析</h3>
        <div class="data-item gravity">
          <span class="label">重力 G:</span>
          <span class="value">{{ gravity.toFixed(4) }} N</span>
        </div>
        <div class="data-item buoyancy">
          <span class="label">浮力 F浮:</span>
          <span class="value">{{ buoyancy.toFixed(4) }} N</span>
        </div>
        <div class="data-item highlight">
          <span class="label">排开液体重量:</span>
          <span class="value">{{ displacedLiquidWeight.toFixed(4) }} N</span>
        </div>
        <div class="data-item">
          <span class="label">排开液体体积:</span>
          <span class="value">{{ displacedVolume.toFixed(2) }} cm³</span>
        </div>
        
        <div class="divider"></div>
        
        <h3>状态</h3>
        <div class="status-badge" :class="statusClass">
          {{ statusText }}
        </div>
      </div>
    </div>
    
    <div class="controls">
      <div class="control-section">
        <h3>物块参数</h3>
        <div class="control-item">
          <label>
            物块密度:
            <span class="control-value">{{ objectDensity.toFixed(2) }} g/cm³</span>
          </label>
          <input 
            type="range" 
            v-model.number="objectDensity" 
            :min="0.5" 
            :max="2.0" 
            :step="0.01"
            class="slider"
          >
        </div>
        
        <div class="control-item">
          <label>
            物块体积:
            <span class="control-value">{{ objectVolume.toFixed(1) }} cm³</span>
          </label>
          <input 
            type="range" 
            v-model.number="objectVolume" 
            :min="20" 
            :max="150" 
            :step="1"
            class="slider"
          >
        </div>
      </div>
      
      <div class="control-section">
        <h3>液体参数</h3>
        <div class="control-item">
          <label>
            液体密度:
            <span class="control-value">{{ liquidDensity.toFixed(2) }} g/cm³</span>
          </label>
          <input 
            type="range" 
            v-model.number="liquidDensity" 
            :min="0.7" 
            :max="1.3" 
            :step="0.01"
            class="slider"
          >
        </div>
        
        <div class="preset-buttons">
          <button 
            class="preset-btn" 
            :class="{ active: liquidDensity === 0.8 }"
            @click="liquidDensity = 0.8"
          >
            酒精 (0.8)
          </button>
          <button 
            class="preset-btn" 
            :class="{ active: liquidDensity === 1.0 }"
            @click="liquidDensity = 1.0"
          >
            水 (1.0)
          </button>
          <button 
            class="preset-btn" 
            :class="{ active: liquidDensity === 1.2 }"
            @click="liquidDensity = 1.2"
          >
            盐水 (1.2)
          </button>
        </div>
      </div>
      
      <div class="control-section">
        <h3>操作</h3>
        <button class="action-btn" @click="resetPosition">
          重置位置
        </button>
        <button class="action-btn" @click="togglePause">
          {{ isPaused ? '继续' : '暂停' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const canvas = ref(null)
const canvasWidth = 600
const canvasHeight = 500

const objectDensity = ref(1.0)
const liquidDensity = ref(1.0)
const objectVolume = ref(80)
const isPaused = ref(false)

const objectMass = computed(() => objectDensity.value * objectVolume.value)
const gravity = computed(() => (objectMass.value / 1000) * 9.8)

const objectState = ref({
  y: 0,
  velocity: 0,
  width: 0,
  height: 0
})

const displacedVolume = computed(() => {
  const state = objectState.value
  const liquidTop = canvasHeight * 0.3
  const bottom = canvasHeight - 50
  
  const objectTop = state.y - state.height / 2
  const objectBottom = state.y + state.height / 2
  
  if (objectBottom <= liquidTop) return 0
  if (objectTop >= bottom) return objectVolume.value
  
  const submergedTop = Math.max(objectTop, liquidTop)
  const submergedBottom = Math.min(objectBottom, bottom)
  const submergedHeight = submergedBottom - submergedTop
  
  const submergedRatio = Math.min(1, submergedHeight / state.height)
  return objectVolume.value * submergedRatio
})

const buoyancy = computed(() => {
  const densityKgM3 = liquidDensity.value * 1000
  const volumeM3 = displacedVolume.value / 1000000
  return densityKgM3 * volumeM3 * 9.8
})

const displacedLiquidWeight = computed(() => buoyancy.value)

const statusText = computed(() => {
  if (gravity.value > buoyancy.value + 0.0001) return '下沉'
  if (gravity.value < buoyancy.value - 0.0001) return '上浮'
  return '悬浮'
})

const statusClass = computed(() => {
  if (gravity.value > buoyancy.value + 0.0001) return 'sinking'
  if (gravity.value < buoyancy.value - 0.0001) return 'floating'
  return 'suspended'
})

let animationFrameId = null
let lastTime = 0
let wavePhase = 0

const resetPosition = () => {
  objectState.value.y = canvasHeight * 0.15
  objectState.value.velocity = 0
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const updatePhysics = (dt) => {
  if (isPaused.value) return
  
  const state = objectState.value
  const g = 9.8
  const densityRatio = objectDensity.value / liquidDensity.value
  
  const netForce = gravity.value - buoyancy.value
  const massKg = objectMass.value / 1000
  const acceleration = netForce / massKg
  
  state.velocity += acceleration * dt
  state.velocity *= 0.98
  state.y += state.velocity * dt * 100
  
  const liquidTop = canvasHeight * 0.3
  const bottom = canvasHeight - 50
  
  const halfHeight = state.height / 2
  
  if (state.y + halfHeight > bottom) {
    state.y = bottom - halfHeight
    state.velocity = -state.velocity * 0.3
  }
  
  if (state.y - halfHeight < 0) {
    state.y = halfHeight
    state.velocity = Math.abs(state.velocity) * 0.2
  }
}

const drawArrow = (ctx, x, y, length, direction, color, label) => {
  const arrowSize = 10
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  
  const endY = direction === 'up' ? y - length : y + length
  
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, endY)
  ctx.stroke()
  
  ctx.beginPath()
  if (direction === 'up') {
    ctx.moveTo(x, endY)
    ctx.lineTo(x - arrowSize, endY + arrowSize)
    ctx.lineTo(x + arrowSize, endY + arrowSize)
  } else {
    ctx.moveTo(x, endY)
    ctx.lineTo(x - arrowSize, endY - arrowSize)
    ctx.lineTo(x + arrowSize, endY - arrowSize)
  }
  ctx.closePath()
  ctx.fill()
  
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  const labelY = direction === 'up' ? endY - 15 : endY + 25
  ctx.fillText(label, x, labelY)
  
  ctx.restore()
}

const draw = (time) => {
  const ctx = canvas.value.getContext('2d')
  const width = canvasWidth
  const height = canvasHeight
  
  ctx.clearRect(0, 0, width, height)
  
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, width, height)
  
  const containerX = width * 0.15
  const containerY = height * 0.3
  const containerWidth = width * 0.6
  const containerHeight = height * 0.65
  
  ctx.strokeStyle = '#2c3e50'
  ctx.lineWidth = 4
  ctx.strokeRect(containerX, containerY, containerWidth, containerHeight)
  
  wavePhase += 0.02
  const liquidTop = containerY
  const waveAmplitude = 3
  const waveFrequency = 0.05
  
  const getLiquidColor = () => {
    if (liquidDensity.value <= 0.8) return 'rgba(255, 255, 200, 0.7)'
    if (liquidDensity.value <= 1.0) return 'rgba(100, 180, 255, 0.7)'
    return 'rgba(150, 220, 200, 0.7)'
  }
  
  ctx.fillStyle = getLiquidColor()
  ctx.beginPath()
  ctx.moveTo(containerX, liquidTop)
  
  for (let x = containerX; x <= containerX + containerWidth; x += 2) {
    const waveY = liquidTop + Math.sin((x * waveFrequency) + wavePhase) * waveAmplitude
    ctx.lineTo(x, waveY)
  }
  
  ctx.lineTo(containerX + containerWidth, containerY + containerHeight)
  ctx.lineTo(containerX, containerY + containerHeight)
  ctx.closePath()
  ctx.fill()
  
  ctx.strokeStyle = getLiquidColor().replace('0.7', '0.9')
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(containerX, liquidTop)
  for (let x = containerX; x <= containerX + containerWidth; x += 2) {
    const waveY = liquidTop + Math.sin((x * waveFrequency) + wavePhase) * waveAmplitude
    ctx.lineTo(x, waveY)
  }
  ctx.stroke()
  
  const state = objectState.value
  const objectCenterX = containerX + containerWidth / 2
  
  const volumeRatio = objectVolume.value / 150
  const baseSize = 40
  const maxSize = 100
  const objectSize = baseSize + (maxSize - baseSize) * volumeRatio
  
  state.width = objectSize
  state.height = objectSize
  
  const objectX = objectCenterX - objectSize / 2
  const objectY = state.y - objectSize / 2
  
  const objectSubmergedRatio = displacedVolume.value / objectVolume.value
  const submergedHeight = objectSize * objectSubmergedRatio
  
  ctx.fillStyle = 'rgba(255, 107, 107, 0.8)'
  ctx.fillRect(objectX, objectY, objectSize, objectSize)
  
  if (objectSubmergedRatio > 0 && objectSubmergedRatio < 1) {
    ctx.fillStyle = 'rgba(0, 100, 200, 0.4)'
    ctx.fillRect(objectX, objectY + objectSize - submergedHeight, objectSize, submergedHeight)
  } else if (objectSubmergedRatio >= 1) {
    ctx.fillStyle = 'rgba(0, 100, 200, 0.4)'
    ctx.fillRect(objectX, objectY, objectSize, objectSize)
  }
  
  ctx.strokeStyle = '#c0392b'
  ctx.lineWidth = 3
  ctx.strokeRect(objectX, objectY, objectSize, objectSize)
  
  ctx.font = 'bold 16px Arial'
  ctx.fillStyle = '#2c3e50'
  ctx.textAlign = 'center'
  ctx.fillText(
    `ρ = ${objectDensity.value.toFixed(2)}`,
    objectCenterX,
    objectY + objectSize / 2
  )
  
  const arrowStartX = objectCenterX + objectSize / 2 + 50
  
  const maxArrowLength = 120
  const maxForce = Math.max(gravity.value, buoyancy.value, 0.01)
  
  const gravityLength = Math.min(maxArrowLength, (gravity.value / maxForce) * maxArrowLength)
  const buoyancyLength = Math.min(maxArrowLength, (buoyancy.value / maxForce) * maxArrowLength)
  
  const forceCenterY = state.y
  
  const labelMargin = 35
  const arrowHeadMargin = 15
  
  const maxGravityLength = canvasHeight - forceCenterY - labelMargin - arrowHeadMargin
  const clampedGravityLength = Math.min(gravityLength, Math.max(20, maxGravityLength))
  
  const maxBuoyancyLength = forceCenterY - labelMargin - arrowHeadMargin
  const clampedBuoyancyLength = Math.min(buoyancyLength, Math.max(20, maxBuoyancyLength))
  
  if (gravity.value > 0.001) {
    drawArrow(
      ctx,
      arrowStartX,
      forceCenterY,
      clampedGravityLength,
      'down',
      '#e74c3c',
      `G = ${gravity.value.toFixed(3)}N`
    )
  }
  
  if (buoyancy.value > 0.001) {
    drawArrow(
      ctx,
      arrowStartX + 40,
      forceCenterY,
      clampedBuoyancyLength,
      'up',
      '#3498db',
      `F浮 = ${buoyancy.value.toFixed(3)}N`
    )
  }
  
  if (objectSubmergedRatio > 0) {
    ctx.font = 'bold 14px Arial'
    ctx.fillStyle = '#2c3e50'
    ctx.textAlign = 'center'
    ctx.fillText(
      `排开: ${displacedVolume.value.toFixed(1)} cm³`,
      objectCenterX,
      objectY - 15
    )
  }
  
  ctx.font = '14px Arial'
  ctx.fillStyle = '#34495e'
  ctx.textAlign = 'center'
  ctx.fillText(
    `液体密度: ${liquidDensity.value.toFixed(2)} g/cm³`,
    containerX + containerWidth / 2,
    containerY - 10
  )
}

const gameLoop = (time) => {
  const dt = lastTime ? (time - lastTime) / 1000 : 0.016
  lastTime = time
  
  updatePhysics(Math.min(dt, 0.05))
  draw(time)
  
  animationFrameId = requestAnimationFrame(gameLoop)
}

const init = () => {
  resetPosition()
  animationFrameId = requestAnimationFrame(gameLoop)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.simulator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
}

.canvas-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

canvas {
  display: block;
  border-radius: 8px;
}

.data-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-width: 280px;
}

.data-panel h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 15px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.data-item.highlight {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.data-item.gravity {
  border-left: 4px solid #e74c3c;
}

.data-item.buoyancy {
  border-left: 4px solid #3498db;
}

.data-item .label {
  font-weight: 500;
  color: #34495e;
}

.data-item .value {
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Consolas', monospace;
}

.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 20px 0;
}

.status-badge {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-badge.floating {
  background: linear-gradient(135deg, #a8e6cf, #88d8b0);
  color: #1b5e20;
}

.status-badge.sinking {
  background: linear-gradient(135deg, #ff8a80, #ff5252);
  color: #b71c1c;
}

.status-badge.suspended {
  background: linear-gradient(135deg, #81d4fa, #4fc3f7);
  color: #01579b;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  justify-items: center;
}

.control-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 350px;
}

.control-section h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.control-item {
  margin-bottom: 20px;
}

.control-item label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: #34495e;
}

.control-value {
  background: #e3f2fd;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  color: #1976d2;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2196f3;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.4);
  transition: transform 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.preset-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preset-btn {
  flex: 1;
  min-width: 80px;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #34495e;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.preset-btn:hover {
  border-color: #2196f3;
  background: #e3f2fd;
}

.preset-btn.active {
  background: #2196f3;
  color: white;
  border-color: #1976d2;
}

.action-btn {
  width: 100%;
  padding: 12px 20px;
  margin-bottom: 10px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .data-panel {
    width: 100%;
  }
}
</style>
