/**
 * 瀑布图绘制类
 * 使用Canvas绘制资源加载瀑布图
 */
class WaterfallChart {
    constructor(canvasId, tooltipId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = document.getElementById(tooltipId);
        this.resources = [];
        this.filteredResources = [];
        this.maxTime = 0;
        this.minTime = Infinity;
        
        // 配置
        this.config = {
            padding: { top: 30, right: 50, bottom: 50, left: 300 },
            barHeight: 20,
            barGap: 5,
            timelineHeight: 30,
            colorScheme: {
                script: '#3498db',
                style: '#2ecc71',
                image: '#e74c3c',
                font: '#9b59b6',
                fetch: '#f39c12',
                document: '#1abc9c',
                other: '#95a5a6'
            },
            phaseColors: {
                redirect: '#e67e22',
                dns: '#3498db',
                tcp: '#2ecc71',
                ssl: '#9b59b6',
                request: '#f39c12',
                response: '#e74c3c'
            }
        };
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 设置数据
     * @param {Array} resources - 资源数据数组
     */
    setData(resources) {
        this.resources = resources;
        this.filteredResources = [...resources];
        
        // 计算时间范围
        if (resources.length > 0) {
            this.minTime = Math.min(...resources.map(r => r.startTime));
            this.maxTime = Math.max(...resources.map(r => r.startTime + r.duration));
        } else {
            this.minTime = 0;
            this.maxTime = 0;
        }
        
        this.resizeCanvas();
    }

    /**
     * 过滤资源
     * @param {string} type - 资源类型
     */
    filterByType(type) {
        if (type === 'all') {
            this.filteredResources = [...this.resources];
        } else {
            this.filteredResources = this.resources.filter(r => r.type === type);
        }
        this.resizeCanvas();
        this.draw();
    }

    /**
     * 排序资源
     * @param {string} sortType - 排序类型
     */
    sortResources(sortType) {
        const sorted = [...this.filteredResources];
        
        switch (sortType) {
            case 'startTime':
                sorted.sort((a, b) => a.startTime - b.startTime);
                break;
            case 'duration':
                sorted.sort((a, b) => b.duration - a.duration);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        this.filteredResources = sorted;
        this.draw();
    }

    /**
     * 调整Canvas大小
     */
    resizeCanvas() {
        const contentHeight = this.filteredResources.length * (this.config.barHeight + this.config.barGap);
        const totalHeight = this.config.padding.top + contentHeight + this.config.timelineHeight + this.config.padding.bottom;
        const totalWidth = this.canvas.parentElement.clientWidth || 1200;
        
        // 设置Canvas尺寸
        this.canvas.width = totalWidth;
        this.canvas.height = Math.max(totalHeight, 200);
        
        this.draw();
    }

    /**
     * 绘制瀑布图
     */
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.filteredResources.length === 0) {
            this.drawEmptyState();
            return;
        }
        
        // 绘制背景网格
        this.drawGrid();
        
        // 绘制时间线
        this.drawTimeline();
        
        // 绘制资源条
        this.drawResourceBars();
        
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
        const chartHeight = this.filteredResources.length * (this.config.barHeight + this.config.barGap);
        const timeRange = this.maxTime - this.minTime || 1;
        
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
        
        // 水平线
        this.filteredResources.forEach((_, index) => {
            const y = padding.top + index * (this.config.barHeight + this.config.barGap) + this.config.barHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, y);
            this.ctx.lineTo(this.canvas.width - padding.right, y);
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }

    /**
     * 绘制时间线
     */
    drawTimeline() {
        const { padding, timelineHeight } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const chartHeight = this.filteredResources.length * (this.config.barHeight + this.config.barGap);
        const timeRange = this.maxTime - this.minTime || 1;
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
            const time = this.minTime + (i / tickCount) * timeRange;
            
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
     * 绘制资源条
     */
    drawResourceBars() {
        const { padding, barHeight, barGap, colorScheme, phaseColors } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const timeRange = this.maxTime - this.minTime || 1;
        
        this.filteredResources.forEach((resource, index) => {
            const y = padding.top + index * (barHeight + barGap);
            const x = padding.left + ((resource.startTime - this.minTime) / timeRange) * chartWidth;
            const width = (resource.duration / timeRange) * chartWidth;
            
            // 绘制资源名称
            this.ctx.save();
            this.ctx.font = '12px Segoe UI';
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'middle';
            
            const name = this.shortenResourceName(resource.name);
            this.ctx.fillText(name, padding.left - 10, y + barHeight / 2);
            
            // 绘制资源条背景
            this.ctx.fillStyle = '#f8f9fa';
            this.ctx.fillRect(x, y, width, barHeight);
            
            // 绘制各阶段
            this.drawResourcePhases(resource, x, y, width, barHeight, timeRange, chartWidth);
            
            // 绘制总时长标签
            if (width > 40) {
                this.ctx.fillStyle = 'white';
                this.ctx.textAlign = 'center';
                this.ctx.font = '11px Segoe UI';
                this.ctx.fillText(
                    `${resource.duration.toFixed(1)}ms`,
                    x + width / 2,
                    y + barHeight / 2
                );
            }
            
            this.ctx.restore();
            
            // 保存位置信息用于交互
            resource.barRect = { x, y, width, height: barHeight };
        });
    }

    /**
     * 绘制资源各阶段
     */
    drawResourcePhases(resource, x, y, width, barHeight, timeRange, chartWidth) {
        const { phaseColors } = this.config;
        const phases = resource.phases;
        
        Object.entries(phases).forEach(([phaseName, phaseData]) => {
            if (phaseData.duration > 0) {
                const phaseX = x + ((phaseData.start - resource.startTime) / timeRange) * chartWidth;
                const phaseWidth = (phaseData.duration / timeRange) * chartWidth;
                
                this.ctx.fillStyle = phaseColors[phaseName] || '#95a5a6';
                this.ctx.fillRect(phaseX, y, Math.max(phaseWidth, 1), barHeight);
            }
        });
    }

    /**
     * 绘制图例
     */
    drawLegend() {
        const { padding, colorScheme, phaseColors } = this.config;
        const chartWidth = this.canvas.width - padding.left - padding.right;
        const legendY = this.canvas.height - 30;
        
        this.ctx.save();
        this.ctx.font = '12px Segoe UI';
        this.ctx.textBaseline = 'middle';
        
        let x = padding.left;
        const itemWidth = 100;
        const itemHeight = 20;
        
        // 资源类型图例
        Object.entries(colorScheme).forEach(([type, color]) => {
            // 颜色块
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, legendY, 15, 15);
            
            // 标签
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.getResourceTypeName(type), x + 20, legendY + 7);
            
            x += itemWidth;
        });
        
        // 阶段图例
        x += 50;
        Object.entries(phaseColors).forEach(([phase, color]) => {
            // 颜色块
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, legendY, 15, 15);
            
            // 标签
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.getPhaseName(phase), x + 20, legendY + 7);
            
            x += itemWidth;
        });
        
        this.ctx.restore();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 鼠标移动事件
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 鼠标离开事件
        this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * 处理鼠标移动事件
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否在某个资源条上
        const hoveredResource = this.filteredResources.find(resource => {
            if (!resource.barRect) return false;
            const { barRect } = resource;
            return x >= barRect.x && x <= barRect.x + barRect.width &&
                   y >= barRect.y && y <= barRect.y + barRect.height;
        });
        
        if (hoveredResource) {
            this.showTooltip(hoveredResource, e.clientX, e.clientY);
        } else {
            this.hideTooltip();
        }
    }

    /**
     * 显示提示框
     */
    showTooltip(resource, clientX, clientY) {
        const tooltip = this.tooltip;
        
        // 构建提示内容
        const phasesHtml = Object.entries(resource.phases)
            .filter(([_, phase]) => phase.duration > 0)
            .map(([phaseName, phase]) => `
                <tr>
                    <td>${this.getPhaseName(phaseName)}:</td>
                    <td>${phase.duration.toFixed(1)}ms</td>
                </tr>
            `).join('');
        
        const content = `
            <h4>${resource.name}</h4>
            <table>
                <tr>
                    <td>类型:</td>
                    <td>${this.getResourceTypeName(resource.type)}</td>
                </tr>
                <tr>
                    <td>开始时间:</td>
                    <td>${resource.startTime.toFixed(1)}ms</td>
                </tr>
                <tr>
                    <td>总耗时:</td>
                    <td><strong>${resource.duration.toFixed(1)}ms</strong></td>
                </tr>
                <tr>
                    <td>传输大小:</td>
                    <td>${this.formatBytes(resource.transferSize || 0)}</td>
                </tr>
                <tr>
                    <td>协议:</td>
                    <td>${resource.nextHopProtocol || 'N/A'}</td>
                </tr>
            </table>
            <h4 style="margin-top: 10px;">各阶段耗时</h4>
            <table>
                ${phasesHtml}
            </table>
        `;
        
        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        
        // 定位提示框
        const tooltipRect = tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = clientX + 15;
        let top = clientY + 15;
        
        // 确保不超出视口
        if (left + tooltipRect.width > windowWidth) {
            left = clientX - tooltipRect.width - 15;
        }
        if (top + tooltipRect.height > windowHeight) {
            top = clientY - tooltipRect.height - 15;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    /**
     * 隐藏提示框
     */
    hideTooltip() {
        this.tooltip.style.display = 'none';
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

    /**
     * 格式化字节数
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的字符串
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 缩短资源名称
     * @param {string} name - 资源名称
     * @returns {string} 缩短后的名称
     */
    shortenResourceName(name) {
        // 提取文件名
        const urlParts = name.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // 如果文件名太长，缩短它
        const maxLength = 40;
        if (fileName.length > maxLength) {
            const extension = fileName.split('.').pop();
            const baseName = fileName.substring(0, fileName.length - extension.length - 1);
            return `${baseName.substring(0, maxLength - extension.length - 5)}...${extension}`;
        }
        
        return fileName;
    }

    /**
     * 获取资源类型名称
     * @param {string} type - 资源类型
     * @returns {string} 类型名称
     */
    getResourceTypeName(type) {
        const typeNames = {
            script: '脚本',
            style: '样式表',
            image: '图片',
            font: '字体',
            fetch: 'XHR/Fetch',
            document: '文档',
            other: '其他'
        };
        return typeNames[type] || type;
    }

    /**
     * 获取阶段名称
     * @param {string} phase - 阶段名称
     * @returns {string} 阶段中文名称
     */
    getPhaseName(phase) {
        const phaseNames = {
            redirect: '重定向',
            dns: 'DNS查询',
            tcp: 'TCP连接',
            ssl: 'SSL握手',
            request: '请求发送',
            response: '响应接收'
        };
        return phaseNames[phase] || phase;
    }
}

// 导出为全局变量
window.WaterfallChart = WaterfallChart;
