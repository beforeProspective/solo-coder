import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

// 颜色主题 - 梦幻色系
const COLOR_THEMES = [
  { bg: 'rgba(255, 182, 193, 0.85)', border: 'rgba(255, 105, 180, 0.9)', shadow: 'rgba(255, 105, 180, 0.3)' },
  { bg: 'rgba(173, 216, 230, 0.85)', border: 'rgba(100, 149, 237, 0.9)', shadow: 'rgba(100, 149, 237, 0.3)' },
  { bg: 'rgba(221, 160, 221, 0.85)', border: 'rgba(153, 50, 204, 0.9)', shadow: 'rgba(153, 50, 204, 0.3)' },
  { bg: 'rgba(152, 251, 152, 0.85)', border: 'rgba(34, 139, 34, 0.9)', shadow: 'rgba(34, 139, 34, 0.3)' },
  { bg: 'rgba(255, 218, 185, 0.85)', border: 'rgba(255, 140, 0, 0.9)', shadow: 'rgba(255, 140, 0, 0.3)' },
  { bg: 'rgba(176, 224, 230, 0.85)', border: 'rgba(70, 130, 180, 0.9)', shadow: 'rgba(70, 130, 180, 0.3)' },
  { bg: 'rgba(255, 228, 225, 0.85)', border: 'rgba(220, 20, 60, 0.9)', shadow: 'rgba(220, 20, 60, 0.3)' },
  { bg: 'rgba(230, 230, 250, 0.85)', border: 'rgba(138, 43, 226, 0.9)', shadow: 'rgba(138, 43, 226, 0.3)' },
]

// 字体样式
const FONT_STYLES = [
  { family: 'Georgia, serif', italic: false },
  { family: '"Times New Roman", serif', italic: true },
  { family: '"Courier New", monospace', italic: false },
  { family: 'Verdana, sans-serif', italic: false },
  { family: 'Impact, sans-serif', italic: false },
  { family: '"Palatino Linotype", serif', italic: true },
]

// 碎片样式类型
const FRAGMENT_TYPES = ['rounded', 'folded', 'star', 'cloud']

const STORAGE_KEY = 'text_fragments'
const MAX_FRAGMENTS = 200

// 粒子类 - 用于删除时的碎掉散开效果
class Particle {
  constructor(x, y, color, size) {
    this.x = x
    this.y = y
    this.color = color
    this.size = size
    this.baseSize = size
    
    // 随机速度 - 向四周散开
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 4 + 2
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    
    // 重力和摩擦力
    this.gravity = 0.05
    this.friction = 0.98
    
    // 生命周期
    this.life = 1
    this.decay = Math.random() * 0.02 + 0.01
    
    // 旋转
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.2
    
    // 形状类型
    this.shapeType = Math.floor(Math.random() * 3) // 0: 矩形, 1: 三角形, 2: 圆形
  }

  update() {
    // 应用速度
    this.x += this.vx
    this.y += this.vy
    
    // 应用重力
    this.vy += this.gravity
    
    // 应用摩擦力
    this.vx *= this.friction
    this.vy *= this.friction
    
    // 更新生命周期
    this.life -= this.decay
    
    // 更新旋转
    this.rotation += this.rotationSpeed
    
    // 逐渐变小
    this.size = this.baseSize * this.life
    
    return this.life > 0
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.fillStyle = this.color
    
    switch (this.shapeType) {
      case 0: // 矩形
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
        break
      case 1: // 三角形
        ctx.beginPath()
        ctx.moveTo(0, -this.size)
        ctx.lineTo(this.size * 0.866, this.size * 0.5)
        ctx.lineTo(-this.size * 0.866, this.size * 0.5)
        ctx.closePath()
        ctx.fill()
        break
      case 2: // 圆形
      default:
        ctx.beginPath()
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
    }
    
    ctx.restore()
  }
}

// 文字粒子类 - 用于文字的碎掉效果
class TextParticle {
  constructor(char, x, y, color, font) {
    this.char = char
    this.x = x
    this.y = y
    this.color = color
    this.font = font
    
    // 随机速度
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 1
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    
    // 额外的随机运动
    this.randomX = (Math.random() - 0.5) * 2
    this.randomY = (Math.random() - 0.5) * 2
    
    // 生命周期
    this.life = 1
    this.decay = Math.random() * 0.015 + 0.01
    
    // 旋转
    this.rotation = 0
    this.rotationSpeed = (Math.random() - 0.5) * 0.15
  }

  update() {
    this.x += this.vx + this.randomX
    this.y += this.vy + this.randomY
    
    // 模拟重力
    this.vy += 0.03
    
    this.life -= this.decay
    this.rotation += this.rotationSpeed
    
    return this.life > 0
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.life
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.fillStyle = this.color
    ctx.font = this.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.char, 0, 0)
    ctx.restore()
  }
}

class Fragment {
  constructor(text, canvasWidth, canvasHeight, existingData = null) {
    if (existingData) {
      this.id = existingData.id
      this.text = existingData.text
      this.x = existingData.x
      this.y = existingData.y
      this.vx = existingData.vx || (Math.random() - 0.5) * 0.5
      this.vy = existingData.vy || (Math.random() - 0.5) * 0.5
      this.width = existingData.width
      this.height = existingData.height
      this.rotation = existingData.rotation || (Math.random() - 0.5) * 0.3
      this.rotationSpeed = existingData.rotationSpeed || (Math.random() - 0.5) * 0.005
      this.colorIndex = existingData.colorIndex
      this.fontIndex = existingData.fontIndex
      this.type = existingData.type
      this.pinned = existingData.pinned || false
      this.opacity = existingData.opacity || 1
      this.removing = false
      this.removeProgress = 0
      this.particles = []
      this.textParticles = []
      this.particlesGenerated = false
      return
    }

    this.id = Date.now() + Math.random()
    this.text = text
    this.x = Math.random() * (canvasWidth - 200) + 100
    this.y = Math.random() * (canvasHeight - 100) + 50
    
    // 缓慢的随机漂流速度
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5
    
    // 根据文字长度计算大小
    const textLength = Math.min(text.length, 30)
    this.width = Math.max(100, Math.min(250, textLength * 12 + 40))
    this.height = 50
    
    // 旋转
    this.rotation = (Math.random() - 0.5) * 0.3
    this.rotationSpeed = (Math.random() - 0.5) * 0.005
    
    // 样式
    this.colorIndex = Math.floor(Math.random() * COLOR_THEMES.length)
    this.fontIndex = Math.floor(Math.random() * FONT_STYLES.length)
    this.type = FRAGMENT_TYPES[Math.floor(Math.random() * FRAGMENT_TYPES.length)]
    
    // 状态
    this.pinned = false
    this.opacity = 1
    this.removing = false
    this.removeProgress = 0
    this.particles = []
    this.textParticles = []
    this.particlesGenerated = false
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      colorIndex: this.colorIndex,
      fontIndex: this.fontIndex,
      type: this.type,
      pinned: this.pinned,
      opacity: this.opacity,
    }
  }

  // 生成删除时的粒子
  generateRemoveParticles(ctx) {
    if (this.particlesGenerated) return
    
    const colors = COLOR_THEMES[this.colorIndex]
    const font = FONT_STYLES[this.fontIndex]
    const fontStyle = font.italic ? 'italic' : 'normal'
    const fontStr = `${fontStyle} 14px ${font.family}`
    
    // 保存当前变换
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    
    // 生成背景粒子 - 在碎片区域内随机分布
    const halfW = this.width / 2
    const halfH = this.height / 2
    const particleCount = Math.floor(this.width * this.height / 80) // 根据大小调整粒子数量
    
    for (let i = 0; i < particleCount; i++) {
      // 在圆角矩形区域内随机位置
      let px, py
      // 简单的随机位置，确保在矩形内
      px = (Math.random() - 0.5) * (this.width - 20)
      py = (Math.random() - 0.5) * (this.height - 10)
      
      // 转换为全局坐标
      const cos = Math.cos(this.rotation)
      const sin = Math.sin(this.rotation)
      const globalX = this.x + px * cos - py * sin
      const globalY = this.y + px * sin + py * cos
      
      // 随机选择颜色（背景色或边框色）
      const color = Math.random() > 0.5 ? colors.bg : colors.border
      // 移除rgba的透明度部分，转换为hex或保留rgb
      const size = Math.random() * 8 + 4
      
      this.particles.push(new Particle(globalX, globalY, color, size))
    }
    
    // 生成文字粒子
    // 先计算文字的布局
    ctx.font = fontStr
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const words = this.text.split('')
    const maxWidth = this.width - 20
    let lines = []
    let currentLine = ''
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    
    const lineHeight = 18
    const startY = -(lines.length * lineHeight) / 2 + lineHeight / 2
    
    // 为每个字符创建粒子
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx]
      const lineY = startY + lineIdx * lineHeight
      
      // 计算每个字符的位置
      let currentX = 0
      const lineWidth = ctx.measureText(line).width
      const startX = -lineWidth / 2
      
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx]
        const charWidth = ctx.measureText(char).width
        const charX = startX + currentX + charWidth / 2
        
        // 转换为全局坐标
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
        const globalX = this.x + charX * cos - lineY * sin
        const globalY = this.y + charX * sin + lineY * cos
        
        this.textParticles.push(new TextParticle(
          char, 
          globalX, 
          globalY, 
          '#2c3e50', 
          fontStr
        ))
        
        currentX += charWidth
      }
    }
    
    ctx.restore()
    this.particlesGenerated = true
  }

  update(canvasWidth, canvasHeight, ctx) {
    if (this.removing) {
      // 第一次进入删除状态时生成粒子
      if (!this.particlesGenerated && ctx) {
        this.generateRemoveParticles(ctx)
      }
      
      this.removeProgress += 0.015
      // 碎片本身快速消失
      this.opacity = Math.max(0, 1 - this.removeProgress * 3)
      this.rotation += 0.02
      
      // 更新粒子
      let particlesAlive = false
      
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const alive = this.particles[i].update()
        if (!alive) {
          this.particles.splice(i, 1)
        } else {
          particlesAlive = true
        }
      }
      
      for (let i = this.textParticles.length - 1; i >= 0; i--) {
        const alive = this.textParticles[i].update()
        if (!alive) {
          this.textParticles.splice(i, 1)
        } else {
          particlesAlive = true
        }
      }
      
      // 只要还有粒子，就继续渲染
      return this.removeProgress < 1 || particlesAlive
    }

    if (this.pinned) return true

    this.x += this.vx
    this.y += this.vy
    this.rotation += this.rotationSpeed

    // 边界反弹
    if (this.x - this.width / 2 < 0) {
      this.x = this.width / 2
      this.vx = Math.abs(this.vx)
    }
    if (this.x + this.width / 2 > canvasWidth) {
      this.x = canvasWidth - this.width / 2
      this.vx = -Math.abs(this.vx)
    }
    if (this.y - this.height / 2 < 0) {
      this.y = this.height / 2
      this.vy = Math.abs(this.vy)
    }
    if (this.y + this.height / 2 > canvasHeight) {
      this.y = canvasHeight - this.height / 2
      this.vy = -Math.abs(this.vy)
    }

    return true
  }

  checkCollision(other) {
    const dx = other.x - this.x
    const dy = other.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = (this.width + other.width) / 2.5

    if (distance < minDist && distance > 0) {
      // 碰撞反弹
      const nx = dx / distance
      const ny = dy / distance
      
      const dvx = this.vx - other.vx
      const dvy = this.vy - other.vy
      const dvn = dvx * nx + dvy * ny

      if (dvn > 0) {
        const restitution = 0.8
        this.vx -= restitution * dvn * nx
        this.vy -= restitution * dvn * ny
        other.vx += restitution * dvn * nx
        other.vy += restitution * dvn * ny

        // 分离重叠
        const overlap = minDist - distance
        this.x -= (overlap / 2) * nx
        this.y -= (overlap / 2) * ny
        other.x += (overlap / 2) * nx
        other.y += (overlap / 2) * ny
      }
    }
  }

  containsPoint(px, py, canvas) {
    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    
    const halfW = this.width / 2
    const halfH = this.height / 2
    const localX = px - this.x
    const localY = py - this.y
    
    // 反向旋转点
    const cos = Math.cos(-this.rotation)
    const sin = Math.sin(-this.rotation)
    const rotatedX = localX * cos - localY * sin
    const rotatedY = localX * sin + localY * cos
    
    ctx.restore()
    
    return Math.abs(rotatedX) < halfW && Math.abs(rotatedY) < halfH
  }

  draw(ctx) {
    // 先绘制粒子（在碎片下面或一起）
    if (this.removing && this.particles.length > 0) {
      this.particles.forEach(particle => {
        particle.draw(ctx)
      })
    }
    
    if (this.removing && this.textParticles.length > 0) {
      this.textParticles.forEach(particle => {
        particle.draw(ctx)
      })
    }
    
    // 如果透明度为0，就不绘制碎片本身了
    if (this.opacity <= 0) return
    
    const colors = COLOR_THEMES[this.colorIndex]
    const font = FONT_STYLES[this.fontIndex]
    
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    
    // 阴影
    ctx.shadowColor = colors.shadow
    ctx.shadowBlur = this.pinned ? 20 : 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    // 绘制背景
    this.drawBackground(ctx, colors)
    
    // 绘制文字
    ctx.shadowBlur = 0
    ctx.fillStyle = '#2c3e50'
    const fontStyle = font.italic ? 'italic' : 'normal'
    ctx.font = `${fontStyle} 14px ${font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 文字换行处理
    const words = this.text.split('')
    const maxWidth = this.width - 20
    let lines = []
    let currentLine = ''
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    
    const lineHeight = 18
    const startY = -(lines.length * lineHeight) / 2 + lineHeight / 2
    
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 0, startY + i * lineHeight)
    }
    
    // 固定标记
    if (this.pinned) {
      ctx.fillStyle = colors.border
      ctx.beginPath()
      ctx.arc(this.width / 2 - 10, -this.height / 2 + 10, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }

  drawBackground(ctx, colors) {
    const halfW = this.width / 2
    const halfH = this.height / 2
    const radius = 8
    
    ctx.fillStyle = colors.bg
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 2
    
    switch (this.type) {
      case 'rounded':
        this.drawRoundedRect(ctx, -halfW, -halfH, this.width, this.height, radius)
        ctx.fill()
        ctx.stroke()
        break
        
      case 'folded':
        this.drawFoldedPaper(ctx, -halfW, -halfH, this.width, this.height, radius)
        break
        
      case 'star':
        this.drawStarBackground(ctx, colors, radius)
        break
        
      case 'cloud':
        this.drawCloudBackground(ctx, colors)
        break
        
      default:
        this.drawRoundedRect(ctx, -halfW, -halfH, this.width, this.height, radius)
        ctx.fill()
        ctx.stroke()
    }
  }

  drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  drawFoldedPaper(ctx, x, y, w, h, r) {
    const foldSize = 15
    const colors = COLOR_THEMES[this.colorIndex]
    
    // 主矩形
    this.drawRoundedRect(ctx, x, y, w, h, r)
    ctx.fill()
    ctx.stroke()
    
    // 折叠角
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.moveTo(x + w - foldSize, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + foldSize)
    ctx.lineTo(x + w - foldSize, y)
    ctx.closePath()
    ctx.fill()
    
    // 折叠阴影
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.beginPath()
    ctx.moveTo(x + w - foldSize, y)
    ctx.lineTo(x + w, y + foldSize)
    ctx.stroke()
  }

  drawStarBackground(ctx, colors, radius) {
    const halfW = this.width / 2
    const halfH = this.height / 2
    
    // 圆角矩形背景
    this.drawRoundedRect(ctx, -halfW, -halfH, this.width, this.height, radius)
    ctx.fill()
    ctx.stroke()
    
    // 添加星星装饰
    ctx.fillStyle = colors.border
    const starPositions = [
      { x: -halfW + 15, y: -halfH + 15 },
      { x: halfW - 15, y: halfH - 15 },
    ]
    
    starPositions.forEach(pos => {
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const r = i % 2 === 0 ? 4 : 2
        ctx.lineTo(pos.x + Math.cos(angle) * r, pos.y + Math.sin(angle) * r)
      }
      ctx.closePath()
      ctx.fill()
    })
  }

  drawCloudBackground(ctx, colors) {
    const halfW = this.width / 2
    const halfH = this.height / 2
    
    // 云朵形状
    ctx.beginPath()
    
    // 底部
    ctx.moveTo(-halfW + 10, halfH)
    ctx.quadraticCurveTo(-halfW, halfH, -halfW, halfH - 10)
    
    // 左侧
    ctx.quadraticCurveTo(-halfW, 0, -halfW + 10, -halfH + 10)
    ctx.quadraticCurveTo(-halfW + 10, -halfH, -halfW + 20, -halfH)
    
    // 顶部云朵凸起
    const segments = 5
    for (let i = 0; i < segments; i++) {
      const x1 = -halfW + 20 + (i * (this.width - 40)) / segments
      const x2 = -halfW + 20 + ((i + 0.5) * (this.width - 40)) / segments
      const x3 = -halfW + 20 + ((i + 1) * (this.width - 40)) / segments
      const peakY = -halfH - (Math.sin((i + 1) * 0.8) + 1) * 5
      
      if (i === 0) {
        ctx.lineTo(x1, -halfH)
      }
      ctx.quadraticCurveTo(x2, peakY, x3, -halfH)
    }
    
    // 右侧
    ctx.quadraticCurveTo(halfW - 10, -halfH, halfW - 10, -halfH + 10)
    ctx.quadraticCurveTo(halfW, 0, halfW - 10, halfH - 10)
    ctx.quadraticCurveTo(halfW - 10, halfH, halfW - 20, halfH)
    
    // 连接回起点
    ctx.lineTo(-halfW + 10, halfH)
    ctx.closePath()
    
    ctx.fill()
    ctx.stroke()
  }
}

function App() {
  const canvasRef = useRef(null)
  const [inputText, setInputText] = useState('')
  const [fragmentCount, setFragmentCount] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fragmentToDelete, setFragmentToDelete] = useState(null)
  
  const fragmentsRef = useRef([])
  const animationRef = useRef(null)
  const draggedFragmentRef = useRef(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const lastClickTimeRef = useRef(0)
  const lastClickedFragmentRef = useRef(null)

  // 从localStorage加载数据
  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        const canvas = canvasRef.current
        if (canvas) {
          fragmentsRef.current = data.map(item => 
            new Fragment(item.text, canvas.width, canvas.height, item)
          )
          setFragmentCount(fragmentsRef.current.length)
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }, [])

  // 保存到localStorage
  const saveToStorage = useCallback(() => {
    try {
      const data = fragmentsRef.current
        .filter(f => !f.removing)
        .map(f => f.toJSON())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [])

  // 添加新碎片
  const addFragment = useCallback((text) => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    
    if (fragmentsRef.current.length >= MAX_FRAGMENTS) {
      alert(`碎片数量已达上限 (${MAX_FRAGMENTS} 个)，请先删除一些碎片。`)
      return
    }
    
    const fragment = new Fragment(text.trim(), canvas.width, canvas.height)
    fragmentsRef.current.push(fragment)
    setFragmentCount(fragmentsRef.current.length)
    saveToStorage()
  }, [saveToStorage])

  // 删除碎片
  const deleteFragment = useCallback((fragment) => {
    fragment.removing = true
  }, [])

  // 确认删除
  const confirmDelete = useCallback(() => {
    if (fragmentToDelete) {
      deleteFragment(fragmentToDelete)
    }
    setShowDeleteConfirm(false)
    setFragmentToDelete(null)
  }, [fragmentToDelete, deleteFragment])

  // 取消删除
  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false)
    setFragmentToDelete(null)
  }, [])

  // 导出为图片
  const exportImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // 创建临时canvas用于导出（带深色背景）
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const ctx = exportCanvas.getContext('2d')
    
    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制闪烁星星背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    for (let i = 0; i < 100; i++) {
      const x = Math.sin(i * 123.456) * 0.5 + 0.5
      const y = Math.cos(i * 78.9) * 0.5 + 0.5
      const size = (Math.sin(i * 45.6) + 1) * 1.5
      ctx.beginPath()
      ctx.arc(x * canvas.width, y * canvas.height, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 绘制所有碎片
    fragmentsRef.current.forEach(fragment => {
      if (!fragment.removing) {
        fragment.draw(ctx)
      }
    })
    
    // 导出
    const link = document.createElement('a')
    link.download = `text-fragments-${Date.now()}.png`
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
  }, [])

  // 调整canvas大小
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }, [])

  // 绘制背景星星
  const drawBackgroundStars = useCallback((ctx, width, height) => {
    // 保存时间用于闪烁效果
    const time = Date.now() * 0.001
    
    // 绘制星星
    for (let i = 0; i < 150; i++) {
      const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * width
      const y = (Math.cos(i * 78.9) * 0.5 + 0.5) * height
      const baseSize = (Math.sin(i * 45.6) + 1) * 1.5
      const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5
      const size = baseSize * (0.5 + twinkle * 0.5)
      const alpha = 0.3 + twinkle * 0.4
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    
    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // 绘制背景星星
    drawBackgroundStars(ctx, width, height)
    
    // 更新和绘制碎片
    const fragments = fragmentsRef.current
    let needsSave = false
    
    // 更新位置
    for (let i = fragments.length - 1; i >= 0; i--) {
      const fragment = fragments[i]
      const stillAlive = fragment.update(width, height, ctx)
      
      if (!stillAlive) {
        fragments.splice(i, 1)
        needsSave = true
      }
    }
    
    // 碰撞检测
    for (let i = 0; i < fragments.length; i++) {
      for (let j = i + 1; j < fragments.length; j++) {
        const f1 = fragments[i]
        const f2 = fragments[j]
        if (!f1.pinned && !f2.pinned && !f1.removing && !f2.removing) {
          f1.checkCollision(f2)
        }
      }
    }
    
    // 绘制（按z-index，被拖拽的在最上面）
    fragments
      .sort((a, b) => {
        if (a === draggedFragmentRef.current) return 1
        if (b === draggedFragmentRef.current) return -1
        return 0
      })
      .forEach(fragment => {
        if (!fragment.removing || fragment.opacity > 0) {
          fragment.draw(ctx)
        }
      })
    
    if (needsSave) {
      setFragmentCount(fragments.filter(f => !f.removing).length)
      saveToStorage()
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [drawBackgroundStars, saveToStorage])

  // 获取鼠标在canvas上的位置
  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }, [])

  // 找到点击位置的碎片
  const findFragmentAtPosition = useCallback((x, y) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    // 从后往前找（后面的在上面）
    const fragments = fragmentsRef.current.slice().reverse()
    for (const fragment of fragments) {
      if (!fragment.removing && fragment.containsPoint(x, y, canvas)) {
        return fragment
      }
    }
    return null
  }, [])

  // 鼠标按下事件
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    const pos = getMousePos(e)
    const fragment = findFragmentAtPosition(pos.x, pos.y)
    const now = Date.now()
    
    if (fragment) {
      // 检测双击
      if (lastClickedFragmentRef.current === fragment && now - lastClickTimeRef.current < 300) {
        // 双击 - 弹出删除确认
        setFragmentToDelete(fragment)
        setShowDeleteConfirm(true)
        lastClickedFragmentRef.current = null
        lastClickTimeRef.current = 0
        return
      }
      
      // 单击 - 开始拖拽
      draggedFragmentRef.current = fragment
      dragOffsetRef.current = {
        x: pos.x - fragment.x,
        y: pos.y - fragment.y
      }
      fragment.pinned = true
      
      lastClickedFragmentRef.current = fragment
      lastClickTimeRef.current = now
    } else {
      lastClickedFragmentRef.current = null
      lastClickTimeRef.current = 0
    }
  }, [getMousePos, findFragmentAtPosition])

  // 鼠标移动事件
  const handleMouseMove = useCallback((e) => {
    if (!draggedFragmentRef.current) return
    
    const pos = getMousePos(e)
    const fragment = draggedFragmentRef.current
    
    fragment.x = pos.x - dragOffsetRef.current.x
    fragment.y = pos.y - dragOffsetRef.current.y
    
    // 边界检查
    const canvas = canvasRef.current
    if (canvas) {
      fragment.x = Math.max(fragment.width / 2, Math.min(canvas.width - fragment.width / 2, fragment.x))
      fragment.y = Math.max(fragment.height / 2, Math.min(canvas.height - fragment.height / 2, fragment.y))
    }
  }, [getMousePos])

  // 鼠标释放事件
  const handleMouseUp = useCallback(() => {
    if (draggedFragmentRef.current) {
      // 释放后保持固定（用户可以通过再次点击来选择是否固定）
      // 这里我们让用户拖拽后就固定住，再次点击可以取消固定
      // 或者保持原来的行为：拖拽后继续漂移
      
      // 为了更好的用户体验，拖拽后我们让它继续漂移，但位置已更新
      draggedFragmentRef.current.pinned = false
      draggedFragmentRef.current = null
      saveToStorage()
    }
  }, [saveToStorage])

  // 键盘事件 - 双击固定/取消固定
  const handleCanvasClick = useCallback((e) => {
    // 这里由mousedown处理
  }, [])

  // 表单提交
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (inputText.trim()) {
      addFragment(inputText)
      setInputText('')
    }
  }, [inputText, addFragment])

  // 初始化
  useEffect(() => {
    resizeCanvas()
    loadFromStorage()
    animate()
    
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [resizeCanvas, loadFromStorage, animate])

  return (
    <div className="app-container">
      <canvas
        ref={canvasRef}
        className="fragment-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={handleCanvasClick}
      />
      
      {/* 顶部标题 */}
      <div className="header">
        <h1 className="title">✨ 文字碎片收集器 ✨</h1>
        <p className="subtitle">收集每一段触动你的文字，让它们在星空中漂流</p>
      </div>
      
      {/* 输入区域 */}
      <div className="input-panel">
        <div className="input-left">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入你喜欢的句子、歌词、台词..."
              className="text-input"
              maxLength={100}
            />
          </form>
          <span className="count-info">
            碎片数量: <span className="count-number">{fragmentCount}</span> / {MAX_FRAGMENTS}
          </span>
        </div>
        <div className="input-right">
          <button 
            type="button"
            onClick={handleSubmit}
            className="submit-btn" 
            disabled={!inputText.trim()}
          >
            <span>✦</span> 放飞
          </button>
          <button 
            onClick={exportImage} 
            className="export-btn"
            disabled={fragmentCount === 0}
          >
            📷 导出图片
          </button>
        </div>
      </div>
      
      {/* 操作提示 */}
      <div className="tips">
        <span className="tip-item">🖱️ 拖拽碎片可移动位置</span>
        <span className="tip-item">👆 双击碎片可删除</span>
      </div>
      
      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">确认删除</h3>
            <p className="modal-text">
              确定要删除这段文字碎片吗？
              <br/>
              <span className="fragment-preview">"{fragmentToDelete?.text}"</span>
            </p>
            <div className="modal-buttons">
              <button onClick={cancelDelete} className="modal-btn cancel-btn">
                取消
              </button>
              <button onClick={confirmDelete} className="modal-btn confirm-btn">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App