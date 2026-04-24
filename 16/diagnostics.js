/**
 * 性能诊断类
 * 分析性能数据并生成优化建议
 */
class PerformanceDiagnostics {
    constructor() {
        // 阈值配置
        this.thresholds = {
            // 时间阈值（毫秒）
            ttfb: 200,
            domInteractive: 3000,
            domContentLoaded: 4000,
            loadComplete: 5000,
            dnsLookup: 100,
            tcpConnection: 100,
            sslHandshake: 100,
            serverResponse: 200,
            
            // 资源大小阈值（字节）
            largeScript: 100 * 1024, // 100KB
            largeStyle: 50 * 1024, // 50KB
            largeImage: 100 * 1024, // 100KB
            largeFont: 50 * 1024, // 50KB
            
            // 资源数量阈值
            maxScripts: 20,
            maxStyles: 10,
            maxImages: 50,
            maxFonts: 5,
            
            // 资源加载时间阈值（毫秒）
            slowResource: 1000,
            
            // 内存阈值
            memoryUsage: 50 // 百分比
        };
        
        // 建议优先级
        this.priorities = {
            high: 'high',
            medium: 'medium',
            low: 'low'
        };
    }

    /**
     * 生成诊断建议
     * @param {Object} data - 性能数据
     * @returns {Array} 诊断建议数组
     */
    generateDiagnostics(data) {
        const diagnostics = [];
        
        // 导航计时诊断
        if (data.navigation) {
            diagnostics.push(...this.diagnoseNavigation(data.navigation));
        }
        
        // 资源诊断
        if (data.resources && data.resources.length > 0) {
            diagnostics.push(...this.diagnoseResources(data.resources));
        }
        
        // 内存诊断
        if (data.memory) {
            diagnostics.push(...this.diagnoseMemory(data.memory));
        }
        
        // 绘制计时诊断
        if (data.paint && data.paint.length > 0) {
            diagnostics.push(...this.diagnosePaint(data.paint));
        }
        
        // 按优先级排序
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        diagnostics.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        return diagnostics;
    }

    /**
     * 诊断导航计时
     */
    diagnoseNavigation(navigation) {
        const diagnostics = [];
        const { metrics, phases } = navigation;
        
        if (!metrics || !phases) {
            return diagnostics;
        }
        
        // TTFB检查
        if (metrics.ttfb > this.thresholds.ttfb) {
            diagnostics.push({
                priority: this.priorities.high,
                title: '首字节时间过长',
                description: `首字节时间 (TTFB) 为 ${metrics.ttfb.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.ttfb}ms。`,
                suggestion: '优化服务器响应时间，考虑使用CDN加速、缓存策略或服务器端优化。'
            });
        }
        
        // DOM交互时间检查
        if (metrics.domInteractive > this.thresholds.domInteractive) {
            diagnostics.push({
                priority: this.priorities.high,
                title: 'DOM交互时间过长',
                description: `DOM交互时间为 ${metrics.domInteractive.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.domInteractive}ms。`,
                suggestion: '优化关键渲染路径，延迟非关键JavaScript的加载和执行。'
            });
        }
        
        // 页面加载完成时间检查
        if (metrics.loadComplete > this.thresholds.loadComplete) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: '页面加载时间过长',
                description: `页面完全加载时间为 ${metrics.loadComplete.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.loadComplete}ms。`,
                suggestion: '综合优化资源加载，考虑使用懒加载、代码分割、资源压缩等技术。'
            });
        }
        
        // DNS查询时间检查
        if (metrics.dnsLookupTime > this.thresholds.dnsLookup) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: 'DNS查询时间过长',
                description: `DNS查询时间为 ${metrics.dnsLookupTime.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.dnsLookup}ms。`,
                suggestion: '减少DNS查询次数，使用DNS预解析，考虑使用CDN。'
            });
        }
        
        // TCP连接时间检查
        if (metrics.tcpConnectionTime > this.thresholds.tcpConnection) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: 'TCP连接时间过长',
                description: `TCP连接时间为 ${metrics.tcpConnectionTime.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.tcpConnection}ms。`,
                suggestion: '减少域名数量，启用HTTP/2，使用持久连接。'
            });
        }
        
        // 服务器响应时间检查
        if (metrics.serverResponseTime > this.thresholds.serverResponse) {
            diagnostics.push({
                priority: this.priorities.high,
                title: '服务器响应时间过长',
                description: `服务器响应时间为 ${metrics.serverResponseTime.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.serverResponse}ms。`,
                suggestion: '优化数据库查询、使用缓存、优化服务器端代码、考虑升级服务器配置。'
            });
        }
        
        // SSL握手时间检查
        if (phases.sslHandshake && phases.sslHandshake.duration > this.thresholds.sslHandshake) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: 'SSL握手时间过长',
                description: `SSL握手时间为 ${phases.sslHandshake.duration.toFixed(1)}ms，超过了推荐阈值 ${this.thresholds.sslHandshake}ms。`,
                suggestion: '启用SSL会话恢复、使用OCSP装订、选择合适的证书链。'
            });
        }
        
        return diagnostics;
    }

    /**
     * 诊断资源
     */
    diagnoseResources(resources) {
        const diagnostics = [];
        
        // 按类型分组
        const resourcesByType = {};
        resources.forEach(r => {
            if (!resourcesByType[r.type]) {
                resourcesByType[r.type] = [];
            }
            resourcesByType[r.type].push(r);
        });
        
        // 大文件检查
        const largeScripts = resources.filter(r => 
            r.type === 'script' && (r.transferSize || 0) > this.thresholds.largeScript
        );
        
        if (largeScripts.length > 0) {
            diagnostics.push({
                priority: this.priorities.high,
                title: '存在大型JavaScript文件',
                description: `发现 ${largeScripts.length} 个超过 ${this.thresholds.largeScript / 1024}KB 的JavaScript文件，最大的为 ${this.formatBytes(Math.max(...largeScripts.map(r => r.transferSize || 0)))}。`,
                suggestion: '使用代码分割、Tree Shaking、压缩JavaScript文件，考虑使用懒加载。'
            });
        }
        
        // 大图片检查
        const largeImages = resources.filter(r => 
            r.type === 'image' && (r.transferSize || 0) > this.thresholds.largeImage
        );
        
        if (largeImages.length > 0) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: '存在大型图片文件',
                description: `发现 ${largeImages.length} 个超过 ${this.thresholds.largeImage / 1024}KB 的图片文件，最大的为 ${this.formatBytes(Math.max(...largeImages.map(r => r.transferSize || 0)))}。`,
                suggestion: '使用现代图片格式（如WebP、AVIF）、压缩图片、使用响应式图片、考虑使用懒加载。'
            });
        }
        
        // 大样式表检查
        const largeStyles = resources.filter(r => 
            r.type === 'style' && (r.transferSize || 0) > this.thresholds.largeStyle
        );
        
        if (largeStyles.length > 0) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: '存在大型CSS文件',
                description: `发现 ${largeStyles.length} 个超过 ${this.thresholds.largeStyle / 1024}KB 的CSS文件，最大的为 ${this.formatBytes(Math.max(...largeStyles.map(r => r.transferSize || 0)))}。`,
                suggestion: '使用CSS压缩、移除未使用的CSS、使用CSS Modules或CSS-in-JS进行样式隔离。'
            });
        }
        
        // 资源数量检查
        const scriptCount = resources.filter(r => r.type === 'script').length;
        const styleCount = resources.filter(r => r.type === 'style').length;
        const imageCount = resources.filter(r => r.type === 'image').length;
        const fontCount = resources.filter(r => r.type === 'font').length;
        
        if (scriptCount > this.thresholds.maxScripts) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: 'JavaScript文件数量过多',
                description: `页面加载了 ${scriptCount} 个JavaScript文件，超过了推荐阈值 ${this.thresholds.maxScripts} 个。`,
                suggestion: '合并JavaScript文件、使用代码分割减少初始加载数量、考虑使用模块打包工具。'
            });
        }
        
        if (styleCount > this.thresholds.maxStyles) {
            diagnostics.push({
                priority: this.priorities.low,
                title: 'CSS文件数量过多',
                description: `页面加载了 ${styleCount} 个CSS文件，超过了推荐阈值 ${this.thresholds.maxStyles} 个。`,
                suggestion: '合并CSS文件、使用CSS预处理器、考虑使用CSS-in-JS。'
            });
        }
        
        if (fontCount > this.thresholds.maxFonts) {
            diagnostics.push({
                priority: this.priorities.low,
                title: '字体文件数量过多',
                description: `页面加载了 ${fontCount} 个字体文件，超过了推荐阈值 ${this.thresholds.maxFonts} 个。`,
                suggestion: '减少字体文件数量、使用字体子集、考虑使用系统字体。'
            });
        }
        
        // 慢资源检查
        const slowResources = resources.filter(r => r.duration > this.thresholds.slowResource);
        
        if (slowResources.length > 0) {
            diagnostics.push({
                priority: this.priorities.high,
                title: '存在加载缓慢的资源',
                description: `发现 ${slowResources.length} 个加载时间超过 ${this.thresholds.slowResource}ms 的资源，最慢的为 ${slowResources.reduce((max, r) => r.duration > max.duration ? r : max).duration.toFixed(1)}ms。`,
                suggestion: '分析慢资源的原因，考虑使用CDN、优化资源大小、使用缓存策略。'
            });
        }
        
        // 阻塞资源检查
        const blockingResources = resources.filter(r => 
            (r.type === 'script' || r.type === 'style') && 
            r.startTime < (this.thresholds.domInteractive * 0.5)
        );
        
        if (blockingResources.length > 5) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: '存在过多阻塞渲染的资源',
                description: `发现 ${blockingResources.length} 个可能阻塞渲染的资源在页面加载早期加载。`,
                suggestion: '使用defer或async属性加载JavaScript，使用media属性加载CSS，内联关键CSS。'
            });
        }
        
        // 总传输大小检查
        const totalTransferSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        
        if (totalTransferSize > 5 * 1024 * 1024) { // 5MB
            diagnostics.push({
                priority: this.priorities.high,
                title: '总传输大小过大',
                description: `页面总传输大小为 ${this.formatBytes(totalTransferSize)}，超过了推荐阈值 5MB。`,
                suggestion: '综合优化所有资源，考虑使用压缩、懒加载、代码分割等技术。'
            });
        }
        
        return diagnostics;
    }

    /**
     * 诊断内存
     */
    diagnoseMemory(memory) {
        const diagnostics = [];
        
        if (!memory) {
            return diagnostics;
        }
        
        // 内存使用率检查
        const usedPercentage = parseFloat(memory.usedPercentage);
        
        if (usedPercentage > this.thresholds.memoryUsage) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: '内存使用率过高',
                description: `JavaScript堆内存使用率为 ${usedPercentage}%，超过了推荐阈值 ${this.thresholds.memoryUsage}%。`,
                suggestion: '检查内存泄漏，优化数据结构，及时释放不再使用的资源，使用WeakMap和WeakSet。'
            });
        }
        
        // 内存使用量检查
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
            diagnostics.push({
                priority: this.priorities.low,
                title: '内存使用量较大',
                description: `JavaScript堆内存使用量为 ${this.formatBytes(memory.usedJSHeapSize)}。`,
                suggestion: '优化数据存储，考虑使用虚拟滚动、分页加载等技术减少内存占用。'
            });
        }
        
        return diagnostics;
    }

    /**
     * 诊断绘制计时
     */
    diagnosePaint(paint) {
        const diagnostics = [];
        
        if (!paint || paint.length === 0) {
            return diagnostics;
        }
        
        // 首次绘制时间检查
        const firstPaint = paint.find(p => p.name === 'first-paint');
        const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint');
        
        if (firstPaint && firstPaint.startTime > 1000) {
            diagnostics.push({
                priority: this.priorities.medium,
                title: '首次绘制时间过长',
                description: `首次绘制 (FP) 时间为 ${firstPaint.startTime.toFixed(1)}ms，超过了推荐阈值 1000ms。`,
                suggestion: '优化关键渲染路径，减少阻塞资源，内联关键CSS。'
            });
        }
        
        if (firstContentfulPaint && firstContentfulPaint.startTime > 1500) {
            diagnostics.push({
                priority: this.priorities.high,
                title: '首次内容绘制时间过长',
                description: `首次内容绘制 (FCP) 时间为 ${firstContentfulPaint.startTime.toFixed(1)}ms，超过了推荐阈值 1500ms。`,
                suggestion: '优化首屏内容，减少首屏资源大小，使用预加载，优化服务器响应时间。'
            });
        }
        
        // FP和FCP差距检查
        if (firstPaint && firstContentfulPaint) {
            const gap = firstContentfulPaint.startTime - firstPaint.startTime;
            if (gap > 500) {
                diagnostics.push({
                    priority: this.priorities.low,
                    title: '首次绘制和首次内容绘制差距较大',
                    description: `首次绘制 (FP) 和首次内容绘制 (FCP) 之间的差距为 ${gap.toFixed(1)}ms，超过了推荐阈值 500ms。`,
                    suggestion: '检查首屏内容是否被阻塞，优化关键渲染路径。'
                });
            }
        }
        
        return diagnostics;
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
}

// 导出为全局变量
window.PerformanceDiagnostics = PerformanceDiagnostics;
