<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import * as d3 from 'd3';

  // 物理常量
  const g = 9.8; // 重力加速度 m/s²
  const towerHeight = 56; // 比萨斜塔高度 (米)
  const ironBallMass = 10; // 铁球质量 (kg)
  const featherMass = 0.01; // 羽毛质量 (kg)
  const ironBallRadius = 0.1; // 铁球半径 (m)
  const featherRadius = 0.2; // 羽毛等效半径 (m)
  const dragCoefficient = 0.47; // 阻力系数 (球体)
  const airDensity = 1.225; // 空气密度 (kg/m³)

  // 状态管理
  let mode = 'vacuum'; // 'vacuum' | 'air'
  let isRunning = false;
  let time = 0;
  let animationId = null;
  let lastTimestamp = null;
  let ironBall = null;
  let feather = null;
  let velocityHistory = [];

  // SVG 元素引用
  let towerSvg;
  let chartSvg;

  // 缩放比例 (像素/米)
  const scale = 8;
  const canvasHeight = towerHeight * scale;
  const canvasWidth = 400;

  // 初始化物体状态
  function initObjects() {
    ironBall = {
      y: 0,
      velocity: 0,
      mass: ironBallMass,
      radius: ironBallRadius,
      area: Math.PI * ironBallRadius * ironBallRadius,
      landed: false,
      landTime: null,
      landVelocity: null
    };

    feather = {
      y: 0,
      velocity: 0,
      mass: featherMass,
      radius: featherRadius,
      area: Math.PI * featherRadius * featherRadius,
      landed: false,
      landTime: null,
      landVelocity: null
    };

    velocityHistory = [];
    time = 0;
    lastTimestamp = null;
  }

  // 计算空气阻力 (与速度平方成正比)
  function calculateDrag(velocity, area) {
    if (mode === 'vacuum') return 0;
    const dragForce = 0.5 * dragCoefficient * airDensity * area * velocity * velocity;
    return dragForce;
  }

  // 物理更新
  function updatePhysics(dt) {
    if (!ironBall || !feather) return;

    // 更新铁球
    if (!ironBall.landed) {
      const dragForce = calculateDrag(ironBall.velocity, ironBall.area);
      const netForce = ironBall.mass * g - dragForce;
      const acceleration = netForce / ironBall.mass;
      
      ironBall.velocity += acceleration * dt;
      ironBall.y += ironBall.velocity * dt;

      if (ironBall.y >= towerHeight) {
        ironBall.y = towerHeight;
        ironBall.landed = true;
        ironBall.landTime = time;
        ironBall.landVelocity = ironBall.velocity;
      }
    }

    // 更新羽毛
    if (!feather.landed) {
      const dragForce = calculateDrag(feather.velocity, feather.area);
      const netForce = feather.mass * g - dragForce;
      const acceleration = netForce / feather.mass;
      
      feather.velocity += acceleration * dt;
      feather.y += feather.velocity * dt;

      if (feather.y >= towerHeight) {
        feather.y = towerHeight;
        feather.landed = true;
        feather.landTime = time;
        feather.landVelocity = feather.velocity;
      }
    }

    // 记录速度历史
    velocityHistory.push({
      time: time,
      ironVelocity: ironBall.velocity,
      featherVelocity: feather.velocity
    });
  }

  // 动画循环
  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000; // 转换为秒
    lastTimestamp = timestamp;

    if (dt > 0.1) { // 防止大的时间跳跃
      animationId = requestAnimationFrame(animate);
      return;
    }

    time += dt;
    updatePhysics(dt);
    drawTower();
    drawChart();

    // 检查是否都落地了
    if (ironBall.landed && feather.landed) {
      isRunning = false;
      return;
    }

    animationId = requestAnimationFrame(animate);
  }

  // 开始模拟
  function startSimulation() {
    if (isRunning) return;
    initObjects();
    isRunning = true;
    animationId = requestAnimationFrame(animate);
  }

  // 重置模拟
  function resetSimulation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    isRunning = false;
    initObjects();
    drawTower();
    drawChart();
  }

  // 切换模式
  function changeMode(newMode) {
    if (isRunning) return;
    mode = newMode;
    resetSimulation();
  }

  // 绘制高塔和球体
  function drawTower() {
    if (!towerSvg || !ironBall || !feather) return;

    const svg = d3.select(towerSvg);
    svg.selectAll('*').remove();

    // 背景
    svg.append('rect')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight)
      .attr('fill', '#f8f9fa');

    // 地面
    svg.append('rect')
      .attr('x', 0)
      .attr('y', canvasHeight - 20)
      .attr('width', canvasWidth)
      .attr('height', 20)
      .attr('fill', '#8B4513');

    // 塔身 (简化的比萨斜塔)
    const towerX = canvasWidth / 2;
    const towerWidth = 60;
    const tilt = 3; // 倾斜角度

    // 塔的各层
    for (let i = 0; i < 8; i++) {
      const layerY = i * (canvasHeight - 20) / 8;
      const layerWidth = towerWidth - i * 3;
      const offset = (i * tilt);

      svg.append('rect')
        .attr('x', towerX - layerWidth / 2 + offset)
        .attr('y', layerY)
        .attr('width', layerWidth)
        .attr('height', (canvasHeight - 20) / 8 - 5)
        .attr('fill', '#D4C4A8')
        .attr('stroke', '#A0926B')
        .attr('stroke-width', 1);
    }

    // 塔顶平台
    svg.append('rect')
      .attr('x', towerX - towerWidth / 2 + 8 * tilt - 10)
      .attr('y', 0)
      .attr('width', towerWidth + 20)
      .attr('height', 30)
      .attr('fill', '#C4B498')
      .attr('stroke', '#A0926B')
      .attr('stroke-width', 2);

    // 铁球
    const ironBallX = towerX - 30 + 8 * tilt;
    const ironBallY = ironBall.y * scale;
    svg.append('circle')
      .attr('cx', ironBallX)
      .attr('cy', Math.min(ironBallY, canvasHeight - 20 - ironBall.radius * scale))
      .attr('r', ironBall.radius * scale)
      .attr('fill', '#4A4A4A')
      .attr('stroke', '#2A2A2A')
      .attr('stroke-width', 2);

    // 铁球标签
    svg.append('text')
      .attr('x', ironBallX)
      .attr('y', Math.min(ironBallY, canvasHeight - 20 - ironBall.radius * scale) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#4A4A4A')
      .text('铁球');

    // 羽毛 (用椭圆表示)
    const featherX = towerX + 30 + 8 * tilt;
    const featherY = feather.y * scale;
    svg.append('ellipse')
      .attr('cx', featherX)
      .attr('cy', Math.min(featherY, canvasHeight - 20 - feather.radius * scale))
      .attr('rx', feather.radius * scale * 1.5)
      .attr('ry', feather.radius * scale * 0.8)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#E0E0E0')
      .attr('stroke-width', 1);

    // 羽毛标签
    svg.append('text')
      .attr('x', featherX)
      .attr('y', Math.min(featherY, canvasHeight - 20 - feather.radius * scale) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#999')
      .text('羽毛');

    // 高度标尺
    const scaleX = 20;
    for (let h = 0; h <= towerHeight; h += 10) {
      const y = h * scale;
      svg.append('line')
        .attr('x1', scaleX - 5)
        .attr('x2', scaleX + 5)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#999')
        .attr('stroke-width', 1);
      
      svg.append('text')
        .attr('x', scaleX - 10)
        .attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(`${h}m`);
    }
  }

  // 绘制速度-时间图表
  function drawChart() {
    if (!chartSvg) return;

    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 450 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(chartSvg);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 计算数据范围
    const maxTime = Math.max(time, 5);
    const maxVelocity = Math.max(
      d3.max(velocityHistory, d => d.ironVelocity) || 0,
      d3.max(velocityHistory, d => d.featherVelocity) || 0,
      20
    );

    // 比例尺
    const x = d3.scaleLinear()
      .domain([0, maxTime])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, maxVelocity])
      .range([height, 0]);

    // 网格线
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(''));

    // X 轴
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('时间 (秒)');

    // Y 轴
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('速度 (m/s)');

    // 铁球速度线
    if (velocityHistory.length > 1) {
      const ironLine = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.ironVelocity))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(velocityHistory)
        .attr('fill', 'none')
        .attr('stroke', '#4A4A4A')
        .attr('stroke-width', 2.5)
        .attr('d', ironLine);
    }

    // 羽毛速度线
    if (velocityHistory.length > 1) {
      const featherLine = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.featherVelocity))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(velocityHistory)
        .attr('fill', 'none')
        .attr('stroke', '#1E90FF')
        .attr('stroke-width', 2.5)
        .attr('d', featherLine);
    }

    // 图例
    const legend = g.append('g')
      .attr('transform', `translate(${width - 100}, 10)`);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 5)
      .attr('y2', 5)
      .attr('stroke', '#4A4A4A')
      .attr('stroke-width', 2.5);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 9)
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('铁球');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 25)
      .attr('y2', 25)
      .attr('stroke', '#1E90FF')
      .attr('stroke-width', 2.5);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 29)
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('羽毛');

    // 图表标题
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('速度-时间关系图');
  }

  onMount(() => {
    initObjects();
    tick().then(() => {
      drawTower();
      drawChart();
    });
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .header h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 10px;
  }

  .header p {
    color: #666;
    font-size: 16px;
  }

  .main-content {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    flex: 1;
    min-width: 400px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid #667eea;
  }

  .tower-container {
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .chart-container {
    display: flex;
    justify-content: center;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .mode-selector {
    display: flex;
    gap: 10px;
  }

  .mode-btn {
    flex: 1;
    padding: 12px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    transition: all 0.3s ease;
  }

  .mode-btn:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
  }

  .mode-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .btn {
    flex: 1;
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: #f5f5f5;
    color: #666;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .timer {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  .timer-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .timer-value {
    font-size: 32px;
    font-weight: 700;
    color: #667eea;
    font-family: 'Courier New', monospace;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .result-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #333;
  }

  .result-value {
    font-weight: 600;
    color: #667eea;
  }

  .result-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot-iron {
    background: #4A4A4A;
  }

  .dot-feather {
    background: #1E90FF;
  }

  .info-box {
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-left: 4px solid #667eea;
    padding: 16px;
    border-radius: 0 8px 8px 0;
    margin-top: 16px;
  }

  .info-box h3 {
    font-size: 14px;
    color: #667eea;
    margin-bottom: 8px;
  }

  .info-box p {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }

  .physics-info {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-top: 20px;
  }

  .physics-info h4 {
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
    font-weight: 600;
  }

  .physics-info .formula {
    background: white;
    padding: 20px 24px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    color: #667eea;
    font-weight: 600;
    border-left: 4px solid #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  .physics-info .description {
    font-size: 16px;
    color: #666;
    line-height: 1.8;
    background: white;
    padding: 16px 20px;
    border-radius: 8px;
  }
</style>

<div class="container">
  <div class="header">
    <h1>🗼 比萨斜塔自由落体实验模拟器</h1>
    <p>探索重力与空气阻力对物体下落的影响</p>
  </div>

  <div class="main-content">
    <div class="card">
      <div class="card-title">实验装置</div>
      <div class="tower-container">
        <svg bind:this={towerSvg} width={canvasWidth} height={canvasHeight}></svg>
      </div>
    </div>

    <div class="card">
      <div class="card-title">数据分析</div>
      <div class="chart-container">
        <svg bind:this={chartSvg} width={450} height={400}></svg>
      </div>
    </div>
  </div>

  <div class="main-content">
    <div class="card">
      <div class="card-title">实验控制</div>
      <div class="controls">
        <div class="timer">
          <div class="timer-label">下落时间</div>
          <div class="timer-value">{time.toFixed(2)} s</div>
        </div>

        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 14px; color: #666; font-weight: 500;">
            实验模式
          </label>
          <div class="mode-selector">
            <button 
              class="mode-btn {mode === 'vacuum' ? 'active' : ''}"
              on:click={() => changeMode('vacuum')}
              disabled={isRunning}
            >
              🧪 真空模式
            </button>
            <button 
              class="mode-btn {mode === 'air' ? 'active' : ''}"
              on:click={() => changeMode('air')}
              disabled={isRunning}
            >
              🌬️ 空气模式
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            class="btn btn-primary" 
            on:click={startSimulation}
            disabled={isRunning}
          >
            {isRunning ? '⏳ 实验进行中...' : '🚀 开始实验'}
          </button>
          <button 
            class="btn btn-secondary" 
            on:click={resetSimulation}
          >
            🔄 重置
          </button>
        </div>

        <div class="info-box">
          <h3>💡 实验原理</h3>
          <p>
            根据伽利略的自由落体定律，在没有空气阻力的情况下，所有物体下落的加速度相同（g = 9.8 m/s²）。
            但在现实中，空气阻力会使较轻的物体下落得更慢。
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">实验结果</div>
      <div class="results">
        {#if ironBall?.landed && feather?.landed}
          <div class="result-item">
            <div class="result-label">
              <span class="result-dot dot-iron"></span>
              铁球落地时间
            </div>
            <div class="result-value">{ironBall.landTime?.toFixed(2)} s</div>
          </div>
          <div class="result-item">
            <div class="result-label">
              <span class="result-dot dot-iron"></span>
              铁球落地速度
            </div>
            <div class="result-value">{ironBall.landVelocity?.toFixed(2)} m/s</div>
          </div>
          <div class="result-item">
            <div class="result-label">
              <span class="result-dot dot-feather"></span>
              羽毛落地时间
            </div>
            <div class="result-value">{feather.landTime?.toFixed(2)} s</div>
          </div>
          <div class="result-item">
            <div class="result-label">
              <span class="result-dot dot-feather"></span>
              羽毛落地速度
            </div>
            <div class="result-value">{feather.landVelocity?.toFixed(2)} m/s</div>
          </div>
          
          <div class="info-box">
            {#if mode === 'vacuum'}
              <h3>✅ 真空模式结论</h3>
              <p>
                在真空环境中，铁球和羽毛同时落地，落地时间均为 {ironBall.landTime?.toFixed(2)} 秒，
                落地速度均为 {ironBall.landVelocity?.toFixed(2)} m/s。
                这验证了伽利略的自由落体定律：在没有空气阻力时，轻重物体下落一样快！
              </p>
            {:else}
              <h3>✅ 空气模式结论</h3>
              <p>
                在有空气阻力的情况下，铁球先落地（{ironBall.landTime?.toFixed(2)} 秒），
                羽毛后落地（{feather.landTime?.toFixed(2)} 秒）。
                铁球受到的空气阻力相对于其重力可以忽略，而羽毛的空气阻力则显著影响其下落速度。
                观察速度-时间图可以看到：铁球持续加速，而羽毛很快达到终端速度。
              </p>
            {/if}
          </div>
        {:else if isRunning}
          <div class="info-box">
            <h3>⏳ 实验进行中</h3>
            <p>
              观察两个物体的下落过程。注意速度-时间图中两条曲线的变化：
              {#if mode === 'vacuum'}
                在真空模式下，两条曲线应该完全重合！
              {:else}
                在空气模式下，铁球的速度会持续增加，而羽毛的速度会逐渐趋于稳定（终端速度）。
              {/if}
            </p>
          </div>
        {:else}
          <div class="info-box">
            <h3>📋 实验准备就绪</h3>
            <p>
              选择实验模式后点击"开始实验"按钮。
              <br><br>
              <strong>真空模式：</strong>两球将完全同步下落，同时落地。
              <br><br>
              <strong>空气模式：</strong>铁球快速下落，羽毛缓慢飘落。
            </p>
          </div>
        {/if}
      </div>

      <div class="physics-info">
        <h4>📐 物理公式</h4>
        <div class="formula">
          自由落体: y = ½ × g × t²
        </div>
        <div class="formula">
          空气阻力: F<sub>drag</sub> = ½ × C<sub>d</sub> × ρ × A × v²
        </div>
        <div class="description">
          <strong>符号说明：</strong><br>
          g = 9.8 m/s² (重力加速度)<br>
          C<sub>d</sub> = 0.47 (阻力系数)<br>
          ρ = 1.225 kg/m³ (空气密度)<br>
          A = 物体迎风面积<br>
          v = 物体速度
        </div>
      </div>
    </div>
  </div>
</div>
