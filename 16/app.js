/**
 * 主应用文件
 * 整合所有功能模块
 */
class PerformanceApp {
    constructor() {
        // 初始化组件
        this.collector = new PerformanceCollector();
        this.waterfallChart = null;
        this.timelineChart = null;
        this.snapshotManager = new SnapshotManager();
        this.diagnostics = new PerformanceDiagnostics();
        
        // 当前性能数据
        this.currentData = null;
        
        // DOM元素
        this.elements = {
            captureBtn: document.getElementById('captureBtn'),
            saveSnapshotBtn: document.getElementById('saveSnapshotBtn'),
            loadSnapshotBtn: document.getElementById('loadSnapshotBtn'),
            compareBtn: document.getElementById('compareBtn'),
            diagnoseBtn: document.getElementById('diagnoseBtn'),
            resourceTypeFilter: document.getElementById('resourceTypeFilter'),
            sortType: document.getElementById('sortType'),
            metricsGrid: document.getElementById('metricsGrid'),
            snapshotsSection: document.getElementById('snapshotsSection'),
            snapshot1Select: document.getElementById('snapshot1Select'),
            snapshot2Select: document.getElementById('snapshot2Select'),
            doCompareBtn: document.getElementById('doCompareBtn'),
            comparisonResults: document.getElementById('comparisonResults'),
            diagnosticsSection: document.getElementById('diagnosticsSection'),
            diagnosticsList: document.getElementById('diagnosticsList')
        };
        
        // 隐藏文件输入框（用于加载快照）
        this.hiddenFileInput = null;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 创建隐藏的文件输入框
        this.createHiddenFileInput();
        
        // 初始化图表
        this.waterfallChart = new WaterfallChart('waterfallCanvas', 'tooltip');
        this.timelineChart = new TimelineChart('timelineCanvas');
        
        // 绑定事件
        this.bindEvents();
        
        // 尝试自动抓取当前页面数据
        this.tryAutoCapture();
    }

    /**
     * 创建隐藏的文件输入框
     */
    createHiddenFileInput() {
        this.hiddenFileInput = document.createElement('input');
        this.hiddenFileInput.type = 'file';
        this.hiddenFileInput.accept = '.json';
        this.hiddenFileInput.style.display = 'none';
        document.body.appendChild(this.hiddenFileInput);
        
        this.hiddenFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
            this.hiddenFileInput.value = '';
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 抓取数据按钮
        this.elements.captureBtn.addEventListener('click', () => this.capturePerformance());
        
        // 保存快照按钮
        this.elements.saveSnapshotBtn.addEventListener('click', () => this.saveSnapshot());
        
        // 加载快照按钮
        this.elements.loadSnapshotBtn.addEventListener('click', () => this.hiddenFileInput.click());
        
        // 对比快照按钮
        this.elements.compareBtn.addEventListener('click', () => this.showComparisonSection());
        
        // 生成诊断建议按钮
        this.elements.diagnoseBtn.addEventListener('click', () => this.generateDiagnostics());
        
        // 资源类型过滤器
        this.elements.resourceTypeFilter.addEventListener('change', (e) => {
            if (this.waterfallChart) {
                this.waterfallChart.filterByType(e.target.value);
            }
        });
        
        // 排序方式
        this.elements.sortType.addEventListener('change', (e) => {
            if (this.waterfallChart) {
                this.waterfallChart.sortResources(e.target.value);
            }
        });
        
        // 执行对比按钮
        this.elements.doCompareBtn.addEventListener('click', () => this.performComparison());
    }

    /**
     * 尝试自动抓取当前页面数据
     */
    tryAutoCapture() {
        // 检查页面是否已经加载完成
        if (document.readyState === 'complete') {
            this.capturePerformance();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.capturePerformance(), 1000);
            });
        }
    }

    /**
     * 抓取性能数据
     */
    capturePerformance() {
        try {
            this.currentData = this.collector.collectAll();
            this.displayPerformanceData();
            this.showMessage('性能数据抓取成功！', 'success');
        } catch (error) {
            console.error('抓取性能数据失败:', error);
            this.showMessage('抓取性能数据失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示性能数据
     */
    displayPerformanceData() {
        if (!this.currentData) {
            return;
        }
        
        // 显示核心指标
        this.displayMetrics();
        
        // 绘制瀑布图
        if (this.currentData.resources && this.currentData.resources.length > 0) {
            this.waterfallChart.setData(this.currentData.resources);
        }
        
        // 绘制时间线
        if (this.currentData.navigation) {
            this.timelineChart.setData(this.currentData.navigation, this.currentData.paint);
        }
    }

    /**
     * 显示核心指标
     */
    displayMetrics() {
        if (!this.currentData) {
            return;
        }
        
        const metrics = this.collector.calculateCoreMetrics(this.currentData);
        const metricsGrid = this.elements.metricsGrid;
        
        // 清空现有内容
        metricsGrid.innerHTML = '';
        
        // 显示主要指标
        const keyMetrics = [
            'ttfb', 'domInteractive', 'domContentLoaded', 'loadComplete',
            'firstPaint', 'firstContentfulPaint', 'resourceCount', 'totalTransferSize'
        ];
        
        keyMetrics.forEach(key => {
            if (metrics[key]) {
                const metric = metrics[key];
                const card = this.createMetricCard(metric.name, metric.value, metric.unit);
                metricsGrid.appendChild(card);
            }
        });
    }

    /**
     * 创建指标卡片
     */
    createMetricCard(name, value, unit) {
        const card = document.createElement('div');
        card.className = 'metric-card';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'metric-name';
        nameDiv.textContent = name;
        
        const valueDiv = document.createElement('div');
        valueDiv.className = 'metric-value';
        valueDiv.innerHTML = `${value}<span class="metric-unit">${unit}</span>`;
        
        card.appendChild(nameDiv);
        card.appendChild(valueDiv);
        
        return card;
    }

    /**
     * 保存快照
     */
    saveSnapshot() {
        if (!this.currentData) {
            this.showMessage('请先抓取性能数据', 'error');
            return;
        }
        
        const snapshotName = prompt('请输入快照名称:', `快照 ${new Date().toLocaleString()}`);
        
        if (snapshotName === null) {
            return; // 用户取消
        }
        
        try {
            const snapshot = this.snapshotManager.saveSnapshot(
                JSON.parse(JSON.stringify(this.currentData)), 
                snapshotName
            );
            this.showMessage(`快照 "${snapshot.name}" 保存成功！`, 'success');
        } catch (error) {
            console.error('保存快照失败:', error);
            this.showMessage('保存快照失败: ' + error.message, 'error');
        }
    }

    /**
     * 处理文件上传
     */
    async handleFileUpload(file) {
        try {
            const snapshot = await this.snapshotManager.importSnapshot(file);
            this.showMessage(`快照 "${snapshot.name}" 加载成功！`, 'success');
            
            // 使用加载的快照数据
            this.currentData = snapshot.data;
            this.displayPerformanceData();
        } catch (error) {
            console.error('加载快照失败:', error);
            this.showMessage('加载快照失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示对比区域
     */
    showComparisonSection() {
        const snapshots = this.snapshotManager.getSnapshots();
        
        if (snapshots.length < 2) {
            this.showMessage('需要至少2个快照才能进行对比', 'error');
            return;
        }
        
        // 显示对比区域
        this.elements.snapshotsSection.style.display = 'block';
        
        // 更新下拉框
        this.updateSnapshotSelects();
        
        // 滚动到对比区域
        this.elements.snapshotsSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 更新快照下拉框
     */
    updateSnapshotSelects() {
        const snapshots = this.snapshotManager.getSnapshots();
        
        // 清空现有选项
        this.elements.snapshot1Select.innerHTML = '';
        this.elements.snapshot2Select.innerHTML = '';
        
        // 添加选项
        snapshots.forEach(snapshot => {
            const option1 = document.createElement('option');
            option1.value = snapshot.id;
            option1.textContent = `${snapshot.name} (${snapshot.dateString})`;
            this.elements.snapshot1Select.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = snapshot.id;
            option2.textContent = `${snapshot.name} (${snapshot.dateString})`;
            this.elements.snapshot2Select.appendChild(option2);
        });
        
        // 默认选择第一个和第二个
        if (snapshots.length > 1) {
            this.elements.snapshot2Select.selectedIndex = 1;
        }
    }

    /**
     * 执行对比
     */
    performComparison() {
        const snapshot1Id = this.elements.snapshot1Select.value;
        const snapshot2Id = this.elements.snapshot2Select.value;
        
        if (snapshot1Id === snapshot2Id) {
            this.showMessage('请选择两个不同的快照进行对比', 'error');
            return;
        }
        
        try {
            const comparison = this.snapshotManager.compareSnapshots(snapshot1Id, snapshot2Id);
            
            if (!comparison.success) {
                this.showMessage(comparison.error, 'error');
                return;
            }
            
            this.displayComparisonResults(comparison);
        } catch (error) {
            console.error('对比快照失败:', error);
            this.showMessage('对比快照失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示对比结果
     */
    displayComparisonResults(comparison) {
        const resultsContainer = this.elements.comparisonResults;
        
        // 清空现有内容
        resultsContainer.innerHTML = '';
        
        // 创建摘要
        const summary = this.createComparisonSummary(comparison);
        resultsContainer.appendChild(summary);
        
        // 创建指标对比
        if (comparison.metrics && comparison.metrics.length > 0) {
            const metricsSection = this.createMetricsComparison(comparison.metrics);
            resultsContainer.appendChild(metricsSection);
        }
        
        // 创建导航阶段对比
        if (comparison.navigation && comparison.navigation.length > 0) {
            const navigationSection = this.createNavigationComparison(comparison.navigation);
            resultsContainer.appendChild(navigationSection);
        }
        
        // 创建资源对比
        if (comparison.resources) {
            const resourcesSection = this.createResourcesComparison(comparison.resources);
            resultsContainer.appendChild(resourcesSection);
        }
    }

    /**
     * 创建对比摘要
     */
    createComparisonSummary(comparison) {
        const summary = document.createElement('div');
        summary.className = 'comparison-summary';
        
        const { snapshot1, snapshot2, summary: summaryData } = comparison;
        
        // 状态颜色
        const statusColors = {
            improved: '#27ae60',
            worsened: '#c0392b',
            neutral: '#f39c12'
        };
        
        const statusLabels = {
            improved: '性能提升',
            worsened: '性能下降',
            neutral: '性能稳定'
        };
        
        const html = `
            <h3>对比摘要</h3>
            <p><strong>快照1:</strong> ${snapshot1.name} (${snapshot1.date})</p>
            <p><strong>快照2:</strong> ${snapshot2.name} (${snapshot2.date})</p>
            <p style="color: ${statusColors[summaryData.overallStatus]}; font-weight: bold; margin-top: 10px;">
                整体评估: ${statusLabels[summaryData.overallStatus]}
            </p>
            <p>${summaryData.overallMessage}</p>
            <p style="margin-top: 10px;">
                改进指标: <span style="color: #27ae60; font-weight: bold;">${summaryData.improvedMetrics}</span> 个 |
                恶化指标: <span style="color: #c0392b; font-weight: bold;">${summaryData.worsenedMetrics}</span> 个
            </p>
            <p>
                新增资源: <span style="color: #e67e22; font-weight: bold;">${summaryData.addedCount}</span> 个 |
                删除资源: <span style="color: #27ae60; font-weight: bold;">${summaryData.removedCount}</span> 个 |
                变化资源: <span style="color: #3498db; font-weight: bold;">${summaryData.changedCount}</span> 个
            </p>
        `;
        
        summary.innerHTML = html;
        return summary;
    }

    /**
     * 创建指标对比
     */
    createMetricsComparison(metrics) {
        const section = document.createElement('div');
        section.className = 'comparison-section';
        
        const title = document.createElement('h3');
        title.textContent = '核心指标对比';
        section.appendChild(title);
        
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metric-comparison';
        
        metrics.forEach(metric => {
            const card = document.createElement('div');
            card.className = 'metric-compare-card';
            
            const diffClass = metric.improved ? 'improved' : 'worsened';
            
            const html = `
                <h4>${metric.name}</h4>
                <div class="metric-values">
                    <div class="metric-value1">
                        <div class="metric-label">快照1</div>
                        <div class="metric-number">${metric.value1}</div>
                    </div>
                    <div class="metric-value2">
                        <div class="metric-label">快照2</div>
                        <div class="metric-number">${metric.value2}</div>
                    </div>
                </div>
                <div class="metric-diff ${diffClass}">
                    ${metric.diff} (${metric.percentage})
                </div>
            `;
            
            card.innerHTML = html;
            metricsContainer.appendChild(card);
        });
        
        section.appendChild(metricsContainer);
        return section;
    }

    /**
     * 创建导航阶段对比
     */
    createNavigationComparison(navigation) {
        const section = document.createElement('div');
        section.className = 'comparison-section';
        
        const title = document.createElement('h3');
        title.textContent = '导航阶段对比';
        section.appendChild(title);
        
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metric-comparison';
        
        navigation.forEach(phase => {
            const card = document.createElement('div');
            card.className = 'metric-compare-card';
            
            const diffClass = phase.improved ? 'improved' : 'worsened';
            
            const html = `
                <h4>${phase.name}</h4>
                <div class="metric-values">
                    <div class="metric-value1">
                        <div class="metric-label">快照1</div>
                        <div class="metric-number">${phase.value1}</div>
                    </div>
                    <div class="metric-value2">
                        <div class="metric-label">快照2</div>
                        <div class="metric-number">${phase.value2}</div>
                    </div>
                </div>
                <div class="metric-diff ${diffClass}">
                    ${phase.diff} (${phase.percentage})
                </div>
            `;
            
            card.innerHTML = html;
            metricsContainer.appendChild(card);
        });
        
        section.appendChild(metricsContainer);
        return section;
    }

    /**
     * 创建资源对比
     */
    createResourcesComparison(resources) {
        const section = document.createElement('div');
        section.className = 'comparison-section';
        
        const title = document.createElement('h3');
        title.textContent = '资源变化对比';
        section.appendChild(title);
        
        // 新增资源
        if (resources.added && resources.added.length > 0) {
            const addedSection = document.createElement('div');
            addedSection.style.marginTop = '15px';
            
            const addedTitle = document.createElement('h4');
            addedTitle.style.color = '#e67e22';
            addedTitle.textContent = `新增资源 (${resources.added.length} 个)`;
            addedSection.appendChild(addedTitle);
            
            const addedList = document.createElement('ul');
            addedList.style.listStyleType = 'none';
            addedList.style.paddingLeft = '0';
            
            resources.added.forEach(resource => {
                const item = document.createElement('li');
                item.style.padding = '5px 0';
                item.style.borderBottom = '1px solid #eee';
                item.innerHTML = `<strong>${this.shortenResourceName(resource.name)}</strong> (${this.formatBytes(resource.transferSize || 0)}, ${resource.duration.toFixed(1)}ms)`;
                addedList.appendChild(item);
            });
            
            addedSection.appendChild(addedList);
            section.appendChild(addedSection);
        }
        
        // 删除资源
        if (resources.removed && resources.removed.length > 0) {
            const removedSection = document.createElement('div');
            removedSection.style.marginTop = '15px';
            
            const removedTitle = document.createElement('h4');
            removedTitle.style.color = '#27ae60';
            removedTitle.textContent = `删除资源 (${resources.removed.length} 个)`;
            removedSection.appendChild(removedTitle);
            
            const removedList = document.createElement('ul');
            removedList.style.listStyleType = 'none';
            removedList.style.paddingLeft = '0';
            
            resources.removed.forEach(resource => {
                const item = document.createElement('li');
                item.style.padding = '5px 0';
                item.style.borderBottom = '1px solid #eee';
                item.innerHTML = `<strong>${this.shortenResourceName(resource.name)}</strong> (${this.formatBytes(resource.transferSize || 0)}, ${resource.duration.toFixed(1)}ms)`;
                removedList.appendChild(item);
            });
            
            removedSection.appendChild(removedList);
            section.appendChild(removedSection);
        }
        
        // 变化资源
        if (resources.changed && resources.changed.length > 0) {
            const changedSection = document.createElement('div');
            changedSection.style.marginTop = '15px';
            
            const changedTitle = document.createElement('h4');
            changedTitle.style.color = '#3498db';
            changedTitle.textContent = `变化资源 (${resources.changed.length} 个)`;
            changedSection.appendChild(changedTitle);
            
            const changedList = document.createElement('ul');
            changedList.style.listStyleType = 'none';
            changedList.style.paddingLeft = '0';
            
            resources.changed.forEach(resource => {
                const item = document.createElement('li');
                item.style.padding = '5px 0';
                item.style.borderBottom = '1px solid #eee';
                
                const durationColor = resource.durationDiff < 0 ? '#27ae60' : '#c0392b';
                const sizeColor = resource.sizeDiff < 0 ? '#27ae60' : '#c0392b';
                
                item.innerHTML = `
                    <strong>${this.shortenResourceName(resource.name)}</strong><br>
                    耗时: ${resource.oldDuration.toFixed(1)}ms → ${resource.newDuration.toFixed(1)}ms 
                    (<span style="color: ${durationColor}">${resource.durationDiff > 0 ? '+' : ''}${resource.durationDiff.toFixed(1)}ms</span>)<br>
                    大小: ${this.formatBytes(resource.oldSize)} → ${this.formatBytes(resource.newSize)} 
                    (<span style="color: ${sizeColor}">${resource.sizeDiff > 0 ? '+' : ''}${this.formatBytes(Math.abs(resource.sizeDiff))}</span>)
                `;
                changedList.appendChild(item);
            });
            
            changedSection.appendChild(changedList);
            section.appendChild(changedSection);
        }
        
        return section;
    }

    /**
     * 生成诊断建议
     */
    generateDiagnostics() {
        if (!this.currentData) {
            this.showMessage('请先抓取性能数据', 'error');
            return;
        }
        
        try {
            const diagnostics = this.diagnostics.generateDiagnostics(this.currentData);
            
            if (diagnostics.length === 0) {
                this.showMessage('未发现明显的性能问题', 'success');
                return;
            }
            
            this.displayDiagnostics(diagnostics);
            
            // 显示诊断区域
            this.elements.diagnosticsSection.style.display = 'block';
            
            // 滚动到诊断区域
            this.elements.diagnosticsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('生成诊断建议失败:', error);
            this.showMessage('生成诊断建议失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示诊断建议
     */
    displayDiagnostics(diagnostics) {
        const listContainer = this.elements.diagnosticsList;
        
        // 清空现有内容
        listContainer.innerHTML = '';
        
        diagnostics.forEach(diagnostic => {
            const item = document.createElement('div');
            item.className = `diagnostic-item ${diagnostic.priority}`;
            
            const priorityLabels = {
                high: '高优先级',
                medium: '中优先级',
                low: '低优先级'
            };
            
            const html = `
                <h4>${diagnostic.title} <span style="font-size: 12px; font-weight: normal;">(${priorityLabels[diagnostic.priority]})</span></h4>
                <p>${diagnostic.description}</p>
                <div class="diagnostic-suggestion">
                    <strong>建议：</strong>${diagnostic.suggestion}
                </div>
            `;
            
            item.innerHTML = html;
            listContainer.appendChild(item);
        });
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // 设置背景颜色
        const colors = {
            success: '#27ae60',
            error: '#c0392b',
            info: '#3498db',
            warning: '#f39c12'
        };
        
        messageElement.style.backgroundColor = colors[type] || colors.info;
        messageElement.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageElement);
        
        // 显示动画
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            messageElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }

    /**
     * 缩短资源名称
     */
    shortenResourceName(name) {
        const urlParts = name.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        const maxLength = 60;
        if (fileName.length > maxLength) {
            const extension = fileName.split('.').pop();
            const baseName = fileName.substring(0, fileName.length - extension.length - 1);
            return `${baseName.substring(0, maxLength - extension.length - 5)}...${extension}`;
        }
        
        return fileName;
    }

    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.performanceApp = new PerformanceApp();
});
