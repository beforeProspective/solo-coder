/**
 * Performance API 数据收集器
 * 负责抓取和整理页面性能数据
 */
class PerformanceCollector {
    constructor() {
        this.performanceData = null;
    }

    /**
     * 收集所有性能数据
     */
    collectAll() {
        this.performanceData = {
            timestamp: Date.now(),
            navigation: this.collectNavigationTiming(),
            resources: this.collectResourceTiming(),
            marks: this.collectMarks(),
            measures: this.collectMeasures(),
            memory: this.collectMemory(),
            paint: this.collectPaintTiming()
        };
        return this.performanceData;
    }

    /**
     * 收集导航计时数据
     */
    collectNavigationTiming() {
        if (!window.performance || !window.performance.timing) {
            return null;
        }

        const timing = window.performance.timing;
        const navigationStart = timing.navigationStart;

        // 计算各阶段耗时
        const phases = {
            // DNS查询
            dnsLookup: {
                start: timing.domainLookupStart - navigationStart,
                end: timing.domainLookupEnd - navigationStart,
                duration: timing.domainLookupEnd - timing.domainLookupStart
            },
            // TCP连接
            tcpConnection: {
                start: timing.connectStart - navigationStart,
                end: timing.connectEnd - navigationStart,
                duration: timing.connectEnd - timing.connectStart
            },
            // SSL握手
            sslHandshake: {
                start: timing.secureConnectionStart > 0 ? timing.secureConnectionStart - navigationStart : 0,
                end: timing.connectEnd - navigationStart,
                duration: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0
            },
            // 请求发送
            requestSent: {
                start: timing.requestStart - navigationStart,
                end: timing.responseStart - navigationStart,
                duration: timing.responseStart - timing.requestStart
            },
            // 响应接收
            responseReceived: {
                start: timing.responseStart - navigationStart,
                end: timing.responseEnd - navigationStart,
                duration: timing.responseEnd - timing.responseStart
            },
            // DOM解析
            domParsing: {
                start: timing.domLoading - navigationStart,
                end: timing.domInteractive - navigationStart,
                duration: timing.domInteractive - timing.domLoading
            },
            // DOM处理
            domProcessing: {
                start: timing.domInteractive - navigationStart,
                end: timing.domContentLoadedEventStart - navigationStart,
                duration: timing.domContentLoadedEventStart - timing.domInteractive
            },
            // DOMContentLoaded事件
            domContentLoaded: {
                start: timing.domContentLoadedEventStart - navigationStart,
                end: timing.domContentLoadedEventEnd - navigationStart,
                duration: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart
            },
            // 资源加载
            resourceLoading: {
                start: timing.domInteractive - navigationStart,
                end: timing.loadEventStart - navigationStart,
                duration: timing.loadEventStart - timing.domInteractive
            },
            // load事件
            loadEvent: {
                start: timing.loadEventStart - navigationStart,
                end: timing.loadEventEnd - navigationStart,
                duration: timing.loadEventEnd - timing.loadEventStart
            }
        };

        // 计算核心指标
        const metrics = {
            // 首字节时间 (TTFB)
            ttfb: timing.responseStart - navigationStart,
            // DOM解析完成时间
            domInteractive: timing.domInteractive - navigationStart,
            // DOMContentLoaded时间
            domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
            // 页面完全加载时间
            loadComplete: timing.loadEventEnd - navigationStart,
            // DNS查询时间
            dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
            // TCP连接时间
            tcpConnectionTime: timing.connectEnd - timing.connectStart,
            // 服务器响应时间
            serverResponseTime: timing.responseStart - timing.requestStart,
            // DOM处理时间
            domProcessingTime: timing.domContentLoadedEventStart - timing.domLoading,
            // 页面总加载时间
            totalLoadTime: timing.loadEventEnd - navigationStart
        };

        return {
            timing,
            phases,
            metrics,
            navigationStart
        };
    }

    /**
     * 收集资源计时数据
     */
    collectResourceTiming() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return [];
        }

        const resources = window.performance.getEntriesByType('resource');
        
        return resources.map(resource => {
            // 提取资源类型
            const resourceType = this.getResourceType(resource);
            
            // 计算各阶段耗时
            const phases = {
                // 重定向
                redirect: {
                    start: resource.redirectStart,
                    end: resource.redirectEnd,
                    duration: resource.redirectEnd - resource.redirectStart
                },
                // DNS查询
                dns: {
                    start: resource.domainLookupStart,
                    end: resource.domainLookupEnd,
                    duration: resource.domainLookupEnd - resource.domainLookupStart
                },
                // TCP连接
                tcp: {
                    start: resource.connectStart,
                    end: resource.connectEnd,
                    duration: resource.connectEnd - resource.connectStart
                },
                // SSL握手
                ssl: {
                    start: resource.secureConnectionStart > 0 ? resource.secureConnectionStart : 0,
                    end: resource.connectEnd,
                    duration: resource.secureConnectionStart > 0 ? resource.connectEnd - resource.secureConnectionStart : 0
                },
                // 请求发送
                request: {
                    start: resource.requestStart,
                    end: resource.responseStart,
                    duration: resource.responseStart - resource.requestStart
                },
                // 响应接收
                response: {
                    start: resource.responseStart,
                    end: resource.responseEnd,
                    duration: resource.responseEnd - resource.responseStart
                }
            };

            // 计算总耗时
            const totalDuration = resource.duration;

            return {
                name: resource.name,
                type: resourceType,
                initiatorType: resource.initiatorType,
                startTime: resource.startTime,
                duration: totalDuration,
                phases,
                transferSize: resource.transferSize,
                encodedBodySize: resource.encodedBodySize,
                decodedBodySize: resource.decodedBodySize,
                nextHopProtocol: resource.nextHopProtocol,
                workerStart: resource.workerStart,
                fetchStart: resource.fetchStart
            };
        });
    }

    /**
     * 收集自定义标记
     */
    collectMarks() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return [];
        }

        return window.performance.getEntriesByType('mark').map(mark => ({
            name: mark.name,
            startTime: mark.startTime,
            duration: mark.duration
        }));
    }

    /**
     * 收集自定义测量
     */
    collectMeasures() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return [];
        }

        return window.performance.getEntriesByType('measure').map(measure => ({
            name: measure.name,
            startTime: measure.startTime,
            duration: measure.duration
        }));
    }

    /**
     * 收集内存信息
     */
    collectMemory() {
        if (!window.performance || !window.performance.memory) {
            return null;
        }

        const memory = window.performance.memory;
        return {
            totalJSHeapSize: memory.totalJSHeapSize,
            usedJSHeapSize: memory.usedJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2)
        };
    }

    /**
     * 收集绘制计时数据
     */
    collectPaintTiming() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return [];
        }

        return window.performance.getEntriesByType('paint').map(paint => ({
            name: paint.name,
            startTime: paint.startTime,
            duration: paint.duration
        }));
    }

    /**
     * 获取资源类型
     * @param {PerformanceResourceTiming} resource - 资源计时对象
     * @returns {string} 资源类型
     */
    getResourceType(resource) {
        const name = resource.name.toLowerCase();
        const initiatorType = resource.initiatorType;

        // 按initiatorType判断
        if (initiatorType === 'script') return 'script';
        if (initiatorType === 'link' || initiatorType === 'css') return 'style';
        if (initiatorType === 'img' || initiatorType === 'image') return 'image';
        if (initiatorType === 'font') return 'font';
        if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') return 'fetch';
        if (initiatorType === 'iframe' || initiatorType === 'frame') return 'document';

        // 按文件扩展名判断
        if (/\.(js)$/.test(name)) return 'script';
        if (/\.(css)$/.test(name)) return 'style';
        if (/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/.test(name)) return 'image';
        if (/\.(woff|woff2|ttf|otf|eot)$/.test(name)) return 'font';
        if (/\.(html|htm)$/.test(name)) return 'document';

        return 'other';
    }

    /**
     * 计算核心性能指标
     * @param {Object} data - 性能数据
     * @returns {Object} 核心指标
     */
    calculateCoreMetrics(data) {
        const metrics = {};

        // 从导航计时获取指标
        if (data.navigation && data.navigation.metrics) {
            const navMetrics = data.navigation.metrics;
            metrics.ttfb = { value: navMetrics.ttfb, unit: 'ms', name: '首字节时间 (TTFB)' };
            metrics.domInteractive = { value: navMetrics.domInteractive, unit: 'ms', name: 'DOM交互时间' };
            metrics.domContentLoaded = { value: navMetrics.domContentLoaded, unit: 'ms', name: 'DOM内容加载' };
            metrics.loadComplete = { value: navMetrics.loadComplete, unit: 'ms', name: '页面加载完成' };
            metrics.totalLoadTime = { value: navMetrics.totalLoadTime, unit: 'ms', name: '总加载时间' };
        }

        // 从绘制计时获取指标
        if (data.paint && data.paint.length > 0) {
            data.paint.forEach(paint => {
                if (paint.name === 'first-paint') {
                    metrics.firstPaint = { value: paint.startTime, unit: 'ms', name: '首次绘制 (FP)' };
                }
                if (paint.name === 'first-contentful-paint') {
                    metrics.firstContentfulPaint = { value: paint.startTime, unit: 'ms', name: '首次内容绘制 (FCP)' };
                }
            });
        }

        // 从资源数据计算统计指标
        if (data.resources && data.resources.length > 0) {
            const resources = data.resources;
            
            // 资源数量
            metrics.resourceCount = { value: resources.length, unit: '个', name: '资源总数' };
            
            // 按类型统计
            const typeCounts = {};
            resources.forEach(resource => {
                typeCounts[resource.type] = (typeCounts[resource.type] || 0) + 1;
            });
            metrics.resourceTypeCounts = { value: typeCounts, unit: '', name: '各类型资源数量' };
            
            // 总传输大小
            const totalTransferSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
            metrics.totalTransferSize = { 
                value: this.formatBytes(totalTransferSize), 
                unit: '', 
                name: '总传输大小',
                rawValue: totalTransferSize
            };
            
            // 平均资源大小
            const averageSize = resources.length > 0 ? totalTransferSize / resources.length : 0;
            metrics.averageResourceSize = { 
                value: this.formatBytes(averageSize), 
                unit: '', 
                name: '平均资源大小',
                rawValue: averageSize
            };
            
            // 最大资源
            const largestResource = resources.reduce((max, r) => 
                (r.transferSize || 0) > (max.transferSize || 0) ? r : max, resources[0]);
            metrics.largestResource = { 
                value: largestResource, 
                unit: '', 
                name: '最大资源'
            };
            
            // 最慢资源
            const slowestResource = resources.reduce((max, r) => 
                r.duration > max.duration ? r : max, resources[0]);
            metrics.slowestResource = { 
                value: slowestResource, 
                unit: '', 
                name: '最慢资源'
            };
        }

        // 内存信息
        if (data.memory) {
            metrics.memoryUsage = { 
                value: this.formatBytes(data.memory.usedJSHeapSize), 
                unit: '', 
                name: '内存使用量',
                rawValue: data.memory.usedJSHeapSize
            };
            metrics.memoryPercentage = { 
                value: data.memory.usedPercentage, 
                unit: '%', 
                name: '内存使用率'
            };
        }

        return metrics;
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
window.PerformanceCollector = PerformanceCollector;
