/**
 * 快照管理器
 * 负责保存、加载和对比性能数据快照
 */
class SnapshotManager {
    constructor() {
        this.storageKey = 'performance_snapshots';
        this.snapshots = this.loadSnapshots();
    }

    /**
     * 从localStorage加载快照
     * @returns {Array} 快照数组
     */
    loadSnapshots() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('加载快照失败:', error);
            return [];
        }
    }

    /**
     * 保存快照到localStorage
     */
    saveSnapshotsToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.snapshots));
        } catch (error) {
            console.error('保存快照失败:', error);
        }
    }

    /**
     * 保存新快照
     * @param {Object} data - 性能数据
     * @param {string} name - 快照名称（可选）
     * @returns {Object} 保存的快照
     */
    saveSnapshot(data, name) {
        // 生成默认名称
        const timestamp = new Date();
        const defaultName = `快照 ${timestamp.toLocaleString()}`;
        
        const snapshot = {
            id: this.generateId(),
            name: name || defaultName,
            timestamp: timestamp.getTime(),
            dateString: timestamp.toLocaleString(),
            data: data
        };
        
        // 添加到快照列表
        this.snapshots.push(snapshot);
        
        // 保存到localStorage
        this.saveSnapshotsToStorage();
        
        return snapshot;
    }

    /**
     * 删除快照
     * @param {string} id - 快照ID
     * @returns {boolean} 是否删除成功
     */
    deleteSnapshot(id) {
        const index = this.snapshots.findIndex(s => s.id === id);
        if (index !== -1) {
            this.snapshots.splice(index, 1);
            this.saveSnapshotsToStorage();
            return true;
        }
        return false;
    }

    /**
     * 更新快照名称
     * @param {string} id - 快照ID
     * @param {string} newName - 新名称
     * @returns {boolean} 是否更新成功
     */
    updateSnapshotName(id, newName) {
        const snapshot = this.snapshots.find(s => s.id === id);
        if (snapshot) {
            snapshot.name = newName;
            this.saveSnapshotsToStorage();
            return true;
        }
        return false;
    }

    /**
     * 获取所有快照
     * @returns {Array} 快照数组
     */
    getSnapshots() {
        return this.snapshots;
    }

    /**
     * 根据ID获取快照
     * @param {string} id - 快照ID
     * @returns {Object|null} 快照对象
     */
    getSnapshotById(id) {
        return this.snapshots.find(s => s.id === id) || null;
    }

    /**
     * 对比两个快照
     * @param {string} snapshot1Id - 第一个快照ID
     * @param {string} snapshot2Id - 第二个快照ID
     * @returns {Object} 对比结果
     */
    compareSnapshots(snapshot1Id, snapshot2Id) {
        const snapshot1 = this.getSnapshotById(snapshot1Id);
        const snapshot2 = this.getSnapshotById(snapshot2Id);
        
        if (!snapshot1 || !snapshot2) {
            return {
                success: false,
                error: '无法找到指定的快照'
            };
        }
        
        const data1 = snapshot1.data;
        const data2 = snapshot2.data;
        
        // 计算对比结果
        const comparison = {
            success: true,
            snapshot1: {
                id: snapshot1.id,
                name: snapshot1.name,
                date: snapshot1.dateString
            },
            snapshot2: {
                id: snapshot2.id,
                name: snapshot2.name,
                date: snapshot2.dateString
            },
            metrics: this.compareMetrics(data1, data2),
            resources: this.compareResources(data1, data2),
            navigation: this.compareNavigation(data1, data2),
            summary: this.generateComparisonSummary(data1, data2)
        };
        
        return comparison;
    }

    /**
     * 对比核心指标
     */
    compareMetrics(data1, data2) {
        const metricsComparison = [];
        
        // 导航指标
        if (data1.navigation && data1.navigation.metrics && 
            data2.navigation && data2.navigation.metrics) {
            const metrics1 = data1.navigation.metrics;
            const metrics2 = data2.navigation.metrics;
            
            const metricNames = {
                ttfb: '首字节时间 (TTFB)',
                domInteractive: 'DOM交互时间',
                domContentLoaded: 'DOM内容加载',
                loadComplete: '页面加载完成',
                totalLoadTime: '总加载时间',
                dnsLookupTime: 'DNS查询时间',
                tcpConnectionTime: 'TCP连接时间',
                serverResponseTime: '服务器响应时间',
                domProcessingTime: 'DOM处理时间'
            };
            
            Object.entries(metricNames).forEach(([key, name]) => {
                if (metrics1[key] !== undefined && metrics2[key] !== undefined) {
                    const value1 = metrics1[key];
                    const value2 = metrics2[key];
                    const diff = value2 - value1;
                    const percentage = value1 !== 0 ? (diff / value1 * 100) : 0;
                    
                    metricsComparison.push({
                        name,
                        value1: `${value1.toFixed(1)}ms`,
                        value2: `${value2.toFixed(1)}ms`,
                        diff: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}ms`,
                        percentage: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
                        improved: diff < 0
                    });
                }
            });
        }
        
        // 资源统计
        if (data1.resources && data2.resources) {
            const resources1 = data1.resources;
            const resources2 = data2.resources;
            
            // 资源数量
            const count1 = resources1.length;
            const count2 = resources2.length;
            const countDiff = count2 - count1;
            const countPercentage = count1 !== 0 ? (countDiff / count1 * 100) : 0;
            
            metricsComparison.push({
                name: '资源数量',
                value1: `${count1} 个`,
                value2: `${count2} 个`,
                diff: `${countDiff > 0 ? '+' : ''}${countDiff} 个`,
                percentage: `${countPercentage > 0 ? '+' : ''}${countPercentage.toFixed(1)}%`,
                improved: countDiff < 0
            });
            
            // 总传输大小
            const totalSize1 = resources1.reduce((sum, r) => sum + (r.transferSize || 0), 0);
            const totalSize2 = resources2.reduce((sum, r) => sum + (r.transferSize || 0), 0);
            const sizeDiff = totalSize2 - totalSize1;
            const sizePercentage = totalSize1 !== 0 ? (sizeDiff / totalSize1 * 100) : 0;
            
            metricsComparison.push({
                name: '总传输大小',
                value1: this.formatBytes(totalSize1),
                value2: this.formatBytes(totalSize2),
                diff: `${sizeDiff > 0 ? '+' : ''}${this.formatBytes(Math.abs(sizeDiff))}`,
                percentage: `${sizePercentage > 0 ? '+' : ''}${sizePercentage.toFixed(1)}%`,
                improved: sizeDiff < 0
            });
            
            // 平均加载时间
            const avgTime1 = count1 > 0 ? resources1.reduce((sum, r) => sum + r.duration, 0) / count1 : 0;
            const avgTime2 = count2 > 0 ? resources2.reduce((sum, r) => sum + r.duration, 0) / count2 : 0;
            const timeDiff = avgTime2 - avgTime1;
            const timePercentage = avgTime1 !== 0 ? (timeDiff / avgTime1 * 100) : 0;
            
            metricsComparison.push({
                name: '平均资源加载时间',
                value1: `${avgTime1.toFixed(1)}ms`,
                value2: `${avgTime2.toFixed(1)}ms`,
                diff: `${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(1)}ms`,
                percentage: `${timePercentage > 0 ? '+' : ''}${timePercentage.toFixed(1)}%`,
                improved: timeDiff < 0
            });
        }
        
        return metricsComparison;
    }

    /**
     * 对比资源
     */
    compareResources(data1, data2) {
        if (!data1.resources || !data2.resources) {
            return { added: [], removed: [], changed: [] };
        }
        
        const resources1 = data1.resources;
        const resources2 = data2.resources;
        
        // 创建资源名称映射
        const resourceMap1 = {};
        const resourceMap2 = {};
        
        resources1.forEach(r => {
            resourceMap1[r.name] = r;
        });
        
        resources2.forEach(r => {
            resourceMap2[r.name] = r;
        });
        
        const added = [];
        const removed = [];
        const changed = [];
        
        // 查找新增的资源
        resources2.forEach(r => {
            if (!resourceMap1[r.name]) {
                added.push(r);
            }
        });
        
        // 查找删除的资源
        resources1.forEach(r => {
            if (!resourceMap2[r.name]) {
                removed.push(r);
            }
        });
        
        // 查找变化的资源
        resources2.forEach(r => {
            const oldResource = resourceMap1[r.name];
            if (oldResource) {
                const durationDiff = r.duration - oldResource.duration;
                const sizeDiff = (r.transferSize || 0) - (oldResource.transferSize || 0);
                
                if (Math.abs(durationDiff) > 10 || Math.abs(sizeDiff) > 1024) {
                    changed.push({
                        name: r.name,
                        type: r.type,
                        oldDuration: oldResource.duration,
                        newDuration: r.duration,
                        durationDiff,
                        durationPercentage: oldResource.duration !== 0 ? 
                            (durationDiff / oldResource.duration * 100) : 0,
                        oldSize: oldResource.transferSize || 0,
                        newSize: r.transferSize || 0,
                        sizeDiff,
                        sizePercentage: oldResource.transferSize > 0 ? 
                            (sizeDiff / oldResource.transferSize * 100) : 0,
                        improved: durationDiff < 0 && sizeDiff <= 0
                    });
                }
            }
        });
        
        return { added, removed, changed };
    }

    /**
     * 对比导航阶段
     */
    compareNavigation(data1, data2) {
        if (!data1.navigation || !data1.navigation.phases || 
            !data2.navigation || !data2.navigation.phases) {
            return [];
        }
        
        const phases1 = data1.navigation.phases;
        const phases2 = data2.navigation.phases;
        
        const phaseNames = {
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
        
        const comparison = [];
        
        Object.entries(phaseNames).forEach(([key, name]) => {
            if (phases1[key] && phases2[key]) {
                const phase1 = phases1[key];
                const phase2 = phases2[key];
                const diff = phase2.duration - phase1.duration;
                const percentage = phase1.duration !== 0 ? (diff / phase1.duration * 100) : 0;
                
                comparison.push({
                    name,
                    value1: `${phase1.duration.toFixed(1)}ms`,
                    value2: `${phase2.duration.toFixed(1)}ms`,
                    diff: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}ms`,
                    percentage: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
                    improved: diff < 0
                });
            }
        });
        
        return comparison;
    }

    /**
     * 生成对比摘要
     */
    generateComparisonSummary(data1, data2) {
        const metrics = this.compareMetrics(data1, data2);
        const resources = this.compareResources(data1, data2);
        
        // 统计改进和恶化的指标
        const improvedMetrics = metrics.filter(m => m.improved).length;
        const worsenedMetrics = metrics.filter(m => !m.improved).length;
        
        // 统计资源变化
        const addedCount = resources.added.length;
        const removedCount = resources.removed.length;
        const changedCount = resources.changed.length;
        
        // 计算整体改进情况
        let overallStatus = 'neutral';
        let overallMessage = '性能变化不明显';
        
        if (improvedMetrics > worsenedMetrics) {
            overallStatus = 'improved';
            overallMessage = '性能有所提升';
        } else if (worsenedMetrics > improvedMetrics) {
            overallStatus = 'worsened';
            overallMessage = '性能有所下降';
        }
        
        return {
            overallStatus,
            overallMessage,
            improvedMetrics,
            worsenedMetrics,
            addedCount,
            removedCount,
            changedCount
        };
    }

    /**
     * 导出快照为JSON文件
     * @param {string} id - 快照ID
     */
    exportSnapshot(id) {
        const snapshot = this.getSnapshotById(id);
        if (!snapshot) {
            console.error('无法找到指定的快照');
            return;
        }
        
        const jsonString = JSON.stringify(snapshot, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${snapshot.name.replace(/[\/:*?"<>|]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 从JSON文件导入快照
     * @param {File} file - JSON文件
     * @returns {Promise<Object>} 导入的快照
     */
    importSnapshot(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const snapshot = JSON.parse(e.target.result);
                    
                    // 验证快照格式
                    if (!snapshot.id || !snapshot.data) {
                        reject(new Error('无效的快照格式'));
                        return;
                    }
                    
                    // 检查是否已存在相同ID的快照
                    const existingIndex = this.snapshots.findIndex(s => s.id === snapshot.id);
                    if (existingIndex !== -1) {
                        // 如果已存在，生成新ID
                        snapshot.id = this.generateId();
                        snapshot.name = `${snapshot.name} (导入)`;
                    }
                    
                    // 添加到快照列表
                    this.snapshots.push(snapshot);
                    this.saveSnapshotsToStorage();
                    
                    resolve(snapshot);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('读取文件失败'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
window.SnapshotManager = SnapshotManager;
