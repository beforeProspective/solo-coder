/**
 * 时间线图表类
 * 使用Canvas绘制页面生命周期时间线
 */
class TimelineChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.navigationData = null;
        this.paintData = [];
        this.maxTime = 0;
        
        // 配置
        this.config = {
            padding: { top: 30, right: 50, bottom: 50, left: 150 },
            barHeight: 25,
            barGap: 10,
            timelineHeight: 30,
            colorScheme: {
                dnsLookup: '#3498db',
                tcpConnection: '#2ecc71',
                sslHandshake: '#9b59b6',
                requestSent: '#f39c12',
                responseReceived: '#e74c3c',
                domParsing: '#1abc9c',
                domProcessing: '#e67e22',
                domContentLoaded: '#34495e',
                resourceLoading: '#95a5a6',
                loadEvent: '#2c3e50'
            }
        };
        
        // 阶段名称映射
        this.phaseNames = {
            dnsLookup: 'DNS查询',
            tcpConnection: 'TCP连接',
            sslHandshake: 'SSL握手',
            requestSent: '请求发送',
            responseReceived: '响应接收',
            domParsing: 'DOM解析',
            domProcessing: 'DOM处理',
            domContentLoaded: 'DOMContentLoaded',
            resourceLoading: '资源加载',
            loadEvent: 'Load事件'
        };
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 设置数据
     * @param {Object} navigationData - 导航计时数据
     * @param {Array} paintData - 绘制计时数据
     */
    setData(navigationData, paintData = []) {
        this.navigationData = navigationData;
        this.paintData = paintData || [];
        
        // 计算最大时间
        if (navigationData && navigationData.phases) {
            const phases = navigationData.phases;
            const phaseTimes = Object.values(phases).map(p => p.end);
            this.maxTime = Math.max(...phaseTimes);
        } else {
            this.maxTime = 0;
        }
        
        this.resizeCanvas();
    }

    /**
     * 调整Canvas大小
     */
    resizeCanvas() {
        const phaseCount = this.navigationData && this.navigationData.phases ? 
            Object.keys(this.navigationData.phases).length : 0;
        const contentHeight = phaseCount * (this.config.barHeight + this.config.barGap);
        const totalHeight = this.config.padding.top + contentHeight + this.config.timelineHeight + this.config.padding.bottom;
        const totalWidth = this.canvas.parentElement.clientWidth || 1200;
        
        // 设置Canvas尺寸
        this.canvas.width = totalWidth;
        this.canvas.height = Math.max(totalHeight, 200);
        
        this.draw();
    }

    /**
     * 绘制时间线
     */
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.navigationData || !this.navigationData.phases) {
            this.drawEmptyState();
            return;
        }
        
        // 绘制背景网格
        this.drawGrid();
        
        // 绘制时间线
        this.drawTimeline();
        
        // 绘制阶段条
        this.drawPhaseBars();
        
        // 绘制绘制事件标记
        this.drawPaintMarkers();
        
        // 绘制图例
        this.drawLegend();
    }

    /**
     * 绘制空状态
     */
    drawEmptyState() {
        this.ctx.save();
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '16px Segoe UI';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('暂无数据，请先抓取性能数据', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();
    }

    /**
     * 绘制背景网格
     */
    drawGrid() {
        const { padding, timelineHeight } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const phases = this.navigationData.phases;
        const phaseCount = Object.keys(phases).length;
        const chartHeight = phaseCount * (this.config.barHeight + this.config.barGap);
        const timeRange = this.maxTime || 1;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        const lineCount = 10;
        for (let i = 0; i <= lineCount; i++) {
            const x = padding.left + (i / lineCount) * chartWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding.top);
            this.ctx.lineTo(x, padding.top + chartHeight);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    /**
     * 绘制时间线
     */
    drawTimeline() {
        const { padding, timelineHeight } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const phases = this.navigationData.phases;
        const phaseCount = Object.keys(phases).length;
        const chartHeight = phaseCount * (this.config.barHeight + this.config.barGap);
        const timeRange = this.maxTime || 1;
        const timelineY = padding.top + chartHeight + 10;
        
        this.ctx.save();
        
        // 时间线背景
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(padding.left, timelineY, chartWidth, timelineHeight);
        
        // 时间线边框
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(padding.left, timelineY, chartWidth, timelineHeight);
        
        // 时间刻度
        const tickCount = 10;
        this.ctx.font = '12px Segoe UI';
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i <= tickCount; i++) {
            const x = padding.left + (i / tickCount) * chartWidth;
            const time = (i / tickCount) * timeRange;
            
            // 刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(x, timelineY);
            this.ctx.lineTo(x, timelineY + 10);
            this.ctx.stroke();
            
            // 时间标签
            this.ctx.fillText(this.formatTime(time), x, timelineY + 22);
        }
        
        this.ctx.restore();
    }

    /**
     * 绘制阶段条
     */
    drawPhaseBars() {
        const { padding, barHeight, barGap, colorScheme } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const phases = this.navigationData.phases;
        const phaseEntries = Object.entries(phases);
        const timeRange = this.maxTime || 1;
        
        phaseEntries.forEach(([phaseName, phaseData], index) => {
            const y = padding.top + index * (barHeight + barGap);
            const x = padding.left + (phaseData.start / timeRange) * chartWidth;
            const width = (phaseData.duration / timeRange) * chartWidth;
            
            // 绘制阶段名称
            this.ctx.save();
            this.ctx.font = '12px Segoe UI';
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'middle';
            
            const name = this.phaseNames[phaseName] || phaseName;
            this.ctx.fillText(name, padding.left - 10, y + barHeight / 2);
            
            // 绘制阶段条
            this.ctx.fillStyle = colorScheme[phaseName] || '#95a5a6';
            this.ctx.fillRect(x, y, Math.max(width, 2), barHeight);
            
            // 绘制耗时标签
            if (width > 50) {
                this.ctx.fillStyle = 'white';
                this.ctx.textAlign = 'center';
                this.ctx.font = '11px Segoe UI';
                this.ctx.fillText(
                    `${phaseData.duration.toFixed(1)}ms`,
                    x + width / 2,
                    y + barHeight / 2
                );
            }
            
            this.ctx.restore();
        });
    }

    /**
     * 绘制绘制事件标记
     */
    drawPaintMarkers() {
        if (!this.paintData || this.paintData.length === 0) return;
        
        const { padding, barHeight, barGap } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const phases = this.navigationData.phases;
        const phaseCount = Object.keys(phases).length;
        const chartHeight = phaseCount * (barHeight + barGap);
        const timeRange = this.maxTime || 1;
        
        const paintNames = {
            'first-paint': '首次绘制 (FP)',
            'first-contentful-paint': '首次内容绘制 (FCP)'
        };
        
        const paintColors = {
            'first-paint': '#e74c3c',
            'first-contentful-paint': '#27ae60'
        };
        
        this.paintData.forEach(paint => {
            const x = padding.left + (paint.startTime / timeRange) * chartWidth;
            const name = paintNames[paint.name] || paint.name;
            const color = paintColors[paint.name] || '#95a5a6';
            
            this.ctx.save();
            
            // 绘制垂直线
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding.top);
            this.ctx.lineTo(x, padding.top + chartHeight);
            this.ctx.stroke();
            
            // 绘制标记
            this.ctx.setLineDash([]);
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, padding.top + chartHeight + 5, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制标签
            this.ctx.font = '11px Segoe UI';
            this.ctx.fillStyle = color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${name}: ${paint.startTime.toFixed(1)}ms`,
                x,
                padding.top + chartHeight + 25
            );
            
            this.ctx.restore();
        });
    }

    /**
     * 绘制图例
     */
    drawLegend() {
        if (!this.paintData || this.paintData.length === 0) return;
        
        const { padding } = this.config;
        const legendY = this.canvas.height - 25;
        
        const paintNames = {
            'first-paint': '首次绘制 (FP)',
            'first-contentful-paint': '首次内容绘制 (FCP)'
        };
        
        const paintColors = {
            'first-paint': '#e74c3c',
            'first-contentful-paint': '#27ae60'
        };
        
        this.ctx.save();
        this.ctx.font = '12px Segoe UI';
        this.ctx.textBaseline = 'middle';
        
        let x = padding.left;
        const itemWidth = 150;
        
        this.paintData.forEach(paint => {
            const color = paintColors[paint.name] || '#95a5a6';
            const name = paintNames[paint.name] || paint.name;
            
            // 颜色块
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, legendY, 15, 15);
            
            // 标签
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(name, x + 20, legendY + 7);
            
            x += itemWidth;
        });
        
        this.ctx.restore();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * 格式化时间
     * @param {number} time - 时间（毫秒）
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(time) {
        if (time < 1000) {
            return `${time.toFixed(1)}ms`;
        }
        return `${(time / 1000).toFixed(2)}s`;
    }
}

// 导出为全局变量
window.TimelineChart = TimelineChart;
