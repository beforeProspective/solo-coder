<template>
  <div class="app-container">
    <header class="header">
      <h1>伽利略理想斜面实验</h1>
      <p class="subtitle">探索阻力对运动的影响，理解牛顿第一定律</p>
    </header>

    <div class="canvas-container">
      <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>

    <div class="info-panel">
      <div class="info-item">
        <span class="info-label">当前状态：</span>
        <span class="info-value" :class="statusClass">{{ statusText }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">实时速度：</span>
        <span class="info-value">{{ speed.toFixed(2) }} m/s</span>
      </div>
      <div class="info-item" v-if="showDistance">
        <span class="info-label">滚动距离：</span>
        <span class="info-value">{{ distance.toFixed(1) }} px</span>
      </div>
    </div>

    <div class="controls-container">
      <div class="control-group">
        <label class="control-label">
          右侧斜面倾角：{{ rightAngle }}°
        </label>
        <input 
          type="range" 
          v-model.number="rightAngle" 
          min="15" 
          max="45" 
          step="1"
          class="slider"
          @input="updateRightIncline"
        />
      </div>

      <div class="control-group">
        <label class="control-label">
          表面粗糙度：{{ frictionText }}
        </label>
        <input 
          type="range" 
          v-model.number="frictionLevel" 
          min="0" 
          max="100" 
          step="5"
          class="slider"
          :disabled="idealSmoothMode"
          @input="updateFriction"
        />
      </div>

      <div class="control-group checkbox-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="idealSmoothMode" 
            @change="toggleIdealSmooth"
          />
          <span>理想光滑模式（零摩擦力）</span>
        </label>
      </div>

      <div class="button-group">
        <button 
          class="btn btn-primary" 
          @click="startSimulation"
          :disabled="isRunning && !isPaused"
        >
          {{ isPaused ? '继续' : '开始' }}
        </button>
        <button 
          class="btn btn-warning" 
          @click="pauseSimulation"
          :disabled="!isRunning || isPaused"
        >
          暂停
        </button>
        <button 
          class="btn btn-secondary" 
          @click="resetSimulation"
        >
          重置
        </button>
      </div>
    </div>

    <footer class="explanation">
      <h3>实验原理</h3>
      <p>
        伽利略通过理想斜面实验发现：如果表面越来越光滑，小球受到的阻力越来越小，
        它运动的距离就会越来越远。如果表面完全光滑（理想状态），
        小球将保持恒定速度永远运动下去，或者冲上右侧斜面达到与释放时相同的高度。
      </p>
      <p class="law">
        <strong>牛顿第一定律（惯性定律）：</strong>
        一切物体总保持匀速直线运动状态或静止状态，除非作用在它上面的力迫使它改变这种状态。
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Matter from 'matter-js'

const canvasWidth = 900
const canvasHeight = 500

const canvas = ref(null)
let engine = null
let render = null
let runner = null

const ballRadius = 15
const leftInclineAngle = 30
const rightInclineLength = 200
const horizontalLength = 400

const groundY = canvasHeight - 80
const leftInclineStartX = 100
const leftInclineStartY = groundY - 150

let ballBody = null
let leftInclineBody = null
let rightInclineBody = null
let horizontalBody = null

const isRunning = ref(false)
const isPaused = ref(false)
const speed = ref(0)
const distance = ref(0)
const showDistance = ref(false)

const rightAngle = ref(30)
const frictionLevel = ref(50)
const idealSmoothMode = ref(false)

const frictionCoefficient = computed(() => {
  if (idealSmoothMode.value) return 0
  return frictionLevel.value / 100
})

const frictionText = computed(() => {
  if (idealSmoothMode.value) return '理想光滑（零摩擦）'
  if (frictionLevel.value < 30) return '很光滑'
  if (frictionLevel.value < 60) return '中等'
  return '很粗糙'
})

const statusClass = computed(() => {
  if (isRunning.value && !isPaused.value) return 'status-running'
  if (isPaused.value) return 'status-paused'
  return 'status-ready'
})

const statusText = computed(() => {
  if (isRunning.value && !isPaused.value) return '运行中'
  if (isPaused.value) return '已暂停'
  return '就绪'
})

let lastBallPosition = null
let animationFrameId = null
let startPosition = null

const createPhysicsWorld = () => {
  engine = Matter.Engine.create()
  engine.gravity.y = 1

  engine.positionIterations = 10
  engine.velocityIterations = 8

  const canvasElement = canvas.value
  if (!canvasElement) return

  render = Matter.Render.create({
    canvas: canvasElement,
    engine: engine,
    options: {
      width: canvasWidth,
      height: canvasHeight,
      wireframes: false,
      background: '#f5f7fa'
    }
  })

  runner = Matter.Runner.create({
    delta: 1000 / 60
  })

  createBodies()
}

const createBodies = () => {
  const leftAngleRad = (leftInclineAngle * Math.PI) / 180
  const leftLength = 200
  const thickness = 10

  const leftInclineEndX = leftInclineStartX + leftLength * Math.cos(leftAngleRad)
  const leftInclineEndY = groundY

  const leftInclineStartYActual = leftInclineEndY - leftLength * Math.sin(leftAngleRad)

  const leftInclineCenterX = leftInclineStartX + (leftLength * Math.cos(leftAngleRad)) / 2
  const leftInclineCenterY = leftInclineStartYActual + (leftLength * Math.sin(leftAngleRad)) / 2

  leftInclineBody = Matter.Bodies.rectangle(
    leftInclineCenterX,
    leftInclineCenterY,
    leftLength,
    thickness,
    {
      angle: leftAngleRad,
      isStatic: true,
      render: {
        fillStyle: '#4a90d9'
      },
      friction: 0,
      frictionStatic: 0
    }
  )

  const horizontalStartX = leftInclineEndX - 1
  const horizontalEndX = horizontalStartX + horizontalLength + 2
  const horizontalCenterX = (horizontalStartX + horizontalEndX) / 2
  const actualHorizontalLength = horizontalEndX - horizontalStartX

  horizontalBody = Matter.Bodies.rectangle(
    horizontalCenterX,
    groundY,
    actualHorizontalLength,
    thickness,
    {
      isStatic: true,
      render: {
        fillStyle: '#4a90d9'
      },
      friction: 0,
      frictionStatic: 0
    }
  )

  const rightAngleRad = (rightAngle.value * Math.PI) / 180
  const rightInclineCenterX = horizontalEndX - 1 + (rightInclineLength * Math.cos(rightAngleRad)) / 2
  const rightInclineCenterY = groundY - (rightInclineLength * Math.sin(rightAngleRad)) / 2

  rightInclineBody = Matter.Bodies.rectangle(
    rightInclineCenterX,
    rightInclineCenterY,
    rightInclineLength,
    thickness,
    {
      angle: -rightAngleRad,
      isStatic: true,
      render: {
        fillStyle: '#4a90d9'
      },
      friction: 0,
      frictionStatic: 0
    }
  )

  const ballStartX = leftInclineStartX + 25
  const ballStartY = leftInclineStartYActual - ballRadius + 5

  ballBody = Matter.Bodies.circle(ballStartX, ballStartY, ballRadius, {
    render: {
      fillStyle: '#e74c3c'
    },
    restitution: 0.05,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    slop: 0
  })

  startPosition = { x: ballStartX, y: ballStartY }
  lastBallPosition = { x: ballStartX, y: ballStartY }

  Matter.World.add(engine.world, [
    leftInclineBody,
    horizontalBody,
    rightInclineBody,
    ballBody
  ])

  updateFriction()
}

const updateRightIncline = () => {
  if (engine && rightInclineBody) {
    Matter.World.remove(engine.world, rightInclineBody)
    createRightInclineBody()
  }
}

const createRightInclineBody = () => {
  const leftAngleRad = (leftInclineAngle * Math.PI) / 180
  const leftLength = 200
  const thickness = 10

  const leftInclineEndX = leftInclineStartX + leftLength * Math.cos(leftAngleRad)
  const horizontalStartX = leftInclineEndX - 1
  const horizontalEndX = horizontalStartX + horizontalLength + 2

  const rightAngleRad = (rightAngle.value * Math.PI) / 180
  const rightInclineCenterX = horizontalEndX - 1 + (rightInclineLength * Math.cos(rightAngleRad)) / 2
  const rightInclineCenterY = groundY - (rightInclineLength * Math.sin(rightAngleRad)) / 2

  rightInclineBody = Matter.Bodies.rectangle(
    rightInclineCenterX,
    rightInclineCenterY,
    rightInclineLength,
    thickness,
    {
      angle: -rightAngleRad,
      isStatic: true,
      render: {
        fillStyle: '#4a90d9'
      },
      friction: 0,
      frictionStatic: 0
    }
  )

  Matter.World.add(engine.world, rightInclineBody)
}

const updateFriction = () => {
  if (ballBody) {
    const friction = frictionCoefficient.value
    Matter.Body.set(ballBody, 'friction', friction * 0.01)
    Matter.Body.set(ballBody, 'frictionAir', friction * 0.001)
    Matter.Body.set(ballBody, 'frictionStatic', friction * 0.5)

    const restitutionValue = idealSmoothMode.value ? 0.05 : 0
    Matter.Body.set(ballBody, 'restitution', restitutionValue)
  }
}

const toggleIdealSmooth = () => {
  updateFriction()
}

const startSimulation = () => {
  if (!isRunning.value) {
    isRunning.value = true
    isPaused.value = false
    Matter.Runner.run(runner, engine)
    startAnimationLoop()
  } else if (isPaused.value) {
    isPaused.value = false
    Matter.Runner.run(runner, engine)
    startAnimationLoop()
  }
}

const pauseSimulation = () => {
  isPaused.value = true
  Matter.Runner.stop(runner)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
}

const resetSimulation = () => {
  isRunning.value = false
  isPaused.value = false
  showDistance.value = false
  speed.value = 0
  distance.value = 0

  Matter.Runner.stop(runner)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  if (ballBody) Matter.World.remove(engine.world, ballBody)
  if (leftInclineBody) Matter.World.remove(engine.world, leftInclineBody)
  if (horizontalBody) Matter.World.remove(engine.world, horizontalBody)
  if (rightInclineBody) Matter.World.remove(engine.world, rightInclineBody)

  createBodies()
}

const startAnimationLoop = () => {
  const animate = () => {
    drawReferenceLine()

    if (!isRunning.value || isPaused.value) {
      animationFrameId = requestAnimationFrame(animate)
      return
    }

    if (ballBody) {
      const velocity = ballBody.velocity
      speed.value = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

      if (lastBallPosition) {
        const dx = ballBody.position.x - lastBallPosition.x
        const dy = ballBody.position.y - lastBallPosition.y
        distance.value += Math.sqrt(dx * dx + dy * dy)
        lastBallPosition = { x: ballBody.position.x, y: ballBody.position.y }
      }

      showDistance.value = true
      drawVelocityVector()
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
}

const drawReferenceLine = () => {
  if (!canvas.value || !startPosition) return

  const ctx = canvas.value.getContext('2d')
  const referenceY = startPosition.y

  ctx.save()
  ctx.strokeStyle = '#95a5a6'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 6])

  ctx.beginPath()
  ctx.moveTo(0, referenceY)
  ctx.lineTo(canvasWidth, referenceY)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.fillStyle = '#7f8c8d'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('初始高度', 10, referenceY - 5)

  ctx.restore()
}

const drawVelocityVector = () => {
  if (!canvas.value || !ballBody) return

  const ctx = canvas.value.getContext('2d')
  const arrowScale = 20
  const velocity = ballBody.velocity
  const pos = ballBody.position

  const endX = pos.x + velocity.x * arrowScale
  const endY = pos.y + velocity.y * arrowScale

  ctx.save()
  ctx.strokeStyle = '#2c3e50'
  ctx.lineWidth = 2
  ctx.fillStyle = '#2c3e50'

  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  const angle = Math.atan2(velocity.y, velocity.x)
  const arrowLength = 10

  ctx.beginPath()
  ctx.moveTo(endX, endY)
  ctx.lineTo(
    endX - arrowLength * Math.cos(angle - Math.PI / 6),
    endY - arrowLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    endX - arrowLength * Math.cos(angle + Math.PI / 6),
    endY - arrowLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

onMounted(() => {
  createPhysicsWorld()
  Matter.Render.run(render)
  startAnimationLoop()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  Matter.Render.stop(render)
  Matter.Runner.stop(runner)
  Matter.Engine.clear(engine)
})
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1rem;
}

.canvas-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 15px;
  margin-bottom: 20px;
}

canvas {
  display: block;
  border-radius: 8px;
}

.info-panel {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #5d6d7e;
  font-size: 0.95rem;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
}

.status-ready {
  color: #27ae60;
}

.status-running {
  color: #e74c3c;
}

.status-paused {
  color: #f39c12;
}

.controls-container {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 20px;
}

.control-group {
  margin-bottom: 20px;
}

.control-label {
  display: block;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e6ed;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4a90d9;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(74, 144, 217, 0.4);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(74, 144, 217, 0.5);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4a90d9;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(74, 144, 217, 0.4);
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4a90d9;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e0e6ed;
}

.btn {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #27ae60;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #219a52;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #e67e22;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.btn-secondary {
  background: #3498db;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.explanation {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
}

.explanation h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.explanation p {
  color: #5d6d7e;
  line-height: 1.7;
  margin-bottom: 12px;
}

.law {
  background: #e8f4fd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  margin-top: 15px;
}

.law strong {
  color: #2c3e50;
}
</style>
