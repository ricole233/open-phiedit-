/**
 * 历史记录管理系统
 * 使用命令模式实现撤销/重做功能
 */

// ============================================================================
// 命令基类
// ============================================================================
class Command {
    constructor(description = '') {
        this.description = description;
        this.timestamp = Date.now();
    }

    // 执行命令
    execute() {
        throw new Error('Command.execute() must be implemented');
    }

    // 撤销命令
    undo() {
        throw new Error('Command.undo() must be implemented');
    }

    // 获取命令描述
    getDescription() {
        return this.description;
    }
}

// ============================================================================
// 复合命令 - 用于批量操作
// ============================================================================
class CompositeCommand extends Command {
    constructor(description = '批量操作') {
        super(description);
        this.commands = [];
    }

    addCommand(command) {
        this.commands.push(command);
    }

    execute() {
        this.commands.forEach(cmd => cmd.execute());
    }

    undo() {
        // 逆序撤销
        for (let i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
    }
}

// ============================================================================
// 状态快照命令 - 用于复杂操作的整体撤销
// ============================================================================
class SnapshotCommand extends Command {
    constructor(description, beforeState, afterState, restoreFunction) {
        super(description);
        this.beforeState = beforeState;
        this.afterState = afterState;
        this.restoreFunction = restoreFunction;
    }

    execute() {
        // 快照命令在创建时已经执行，这里只需要应用 afterState
        if (this.restoreFunction) {
            this.restoreFunction(this.afterState);
        }
    }

    undo() {
        if (this.restoreFunction) {
            this.restoreFunction(this.beforeState);
        }
    }
}

// ============================================================================
// 具体命令实现
// ============================================================================

// 添加音符命令
class AddNoteCommand extends Command {
    constructor(noteData, lineIndex = null) {
        super(`添加音符 (${['', 'Tap', 'Hold', 'Flick', 'Drag'][noteData.type]})`);
        this.noteData = JSON.parse(JSON.stringify(noteData));
        this.lineIndex = lineIndex !== null ? lineIndex : lineid_select;
        this.noteIndex = -1;
    }

    execute() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        this.noteIndex = targetLine.notes.length;
        targetLine.notes.push(note_compress(this.noteData));
        notecontrol.update();
        if (this.lineIndex === lineid_select) {
            notecontrol.update();
        }
    }

    undo() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        if (this.noteIndex >= 0 && this.noteIndex < targetLine.notes.length) {
            targetLine.notes.splice(this.noteIndex, 1);
            if (this.lineIndex === lineid_select) {
                notecontrol.update();
            }
        }
    }
}

// 删除音符命令
class DeleteNoteCommand extends Command {
    constructor(noteIndex, lineIndex = null) {
        super('删除音符');
        this.noteIndex = noteIndex;
        this.lineIndex = lineIndex !== null ? lineIndex : lineid_select;
        this.deletedNote = null;
    }

    execute() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        if (this.noteIndex >= 0 && this.noteIndex < targetLine.notes.length) {
            this.deletedNote = targetLine.notes[this.noteIndex];
            targetLine.notes.splice(this.noteIndex, 1);
            if (this.lineIndex === lineid_select) {
                notecontrol.update();
            }
        }
    }

    undo() {
        if (this.deletedNote) {
            const targetLine = all_data.judgeLineList[this.lineIndex];
            targetLine.notes.splice(this.noteIndex, 0, this.deletedNote);
            if (this.lineIndex === lineid_select) {
                notecontrol.update();
            }
        }
    }
}

// 修改音符命令
class ModifyNoteCommand extends Command {
    constructor(noteIndex, oldData, newData, lineIndex = null) {
        super('修改音符属性');
        this.noteIndex = noteIndex;
        this.lineIndex = lineIndex !== null ? lineIndex : lineid_select;
        this.oldData = JSON.parse(JSON.stringify(oldData));
        this.newData = JSON.parse(JSON.stringify(newData));
    }

    execute() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        if (this.noteIndex >= 0 && this.noteIndex < targetLine.notes.length) {
            targetLine.notes[this.noteIndex] = note_compress(this.newData);
            if (this.lineIndex === lineid_select) {
                notecontrol.update();
            }
        }
    }

    undo() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        if (this.noteIndex >= 0 && this.noteIndex < targetLine.notes.length) {
            targetLine.notes[this.noteIndex] = note_compress(this.oldData);
            if (this.lineIndex === lineid_select) {
                notecontrol.update();
            }
        }
    }
}

// 添加判定线命令
class AddJudgeLineCommand extends Command {
    constructor() {
        super('添加判定线');
        this.lineIndex = -1;
    }

    execute() {
        this.lineIndex = all_data.judgeLineList.length;
        all_data.judgeLineList.push(new_judge_line());
    }

    undo() {
        if (this.lineIndex >= 0 && this.lineIndex < all_data.judgeLineList.length) {
            all_data.judgeLineList.splice(this.lineIndex, 1);
            // 如果删除的是当前选中的线，切换到前一条线
            if (lineid_select >= this.lineIndex && lineid_select > 0) {
                change_line(lineid_select - 1);
            } else if (all_data.judgeLineList.length === 0) {
                // 如果所有线都被删除，添加一条新线
                all_data.judgeLineList.push(new_judge_line());
                change_line(0);
            }
        }
    }
}

// 添加事件命令
class AddEventCommand extends Command {
    constructor(eventType, eventData, layerIndex, lineIndex = null) {
        super(`添加事件 (${eventType})`);
        this.eventType = eventType;
        this.eventData = JSON.parse(JSON.stringify(eventData));
        this.layerIndex = layerIndex;
        this.lineIndex = lineIndex !== null ? lineIndex : lineid_select;
        this.eventIndex = -1;
    }

    execute() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        const events = this.layerIndex === "ex" ? 
            targetLine.extended : 
            targetLine.eventLayers[this.layerIndex];
        
        if (!events[this.eventType]) {
            events[this.eventType] = [];
        }
        
        this.eventIndex = events[this.eventType].length;
        events[this.eventType].push(this.eventData);
    }

    undo() {
        const targetLine = all_data.judgeLineList[this.lineIndex];
        const events = this.layerIndex === "ex" ? 
            targetLine.extended : 
            targetLine.eventLayers[this.layerIndex];
        
        if (events[this.eventType] && this.eventIndex >= 0) {
            events[this.eventType].splice(this.eventIndex, 1);
        }
    }
}

// ============================================================================
// 历史记录管理器
// ============================================================================
class HistoryManager {
    constructor(maxHistorySize = 100) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = maxHistorySize;
        this.isExecuting = false; // 防止执行过程中触发新的历史记录
        
        this.initEventListeners();
    }

    // 执行命令并添加到历史记录
    executeCommand(command) {
        if (this.isExecuting) return;
        
        this.isExecuting = true;
        
        try {
            command.execute();
            this.undoStack.push(command);
            this.redoStack = []; // 清空重做栈
            
            // 限制历史记录大小
            if (this.undoStack.length > this.maxHistorySize) {
                this.undoStack.shift();
            }
            
            this.notifyHistoryChanged();
        } catch (error) {
            console.error('Command execution failed:', error);
        } finally {
            this.isExecuting = false;
        }
    }

    // 撤销操作
    undo() {
        if (this.undoStack.length === 0 || this.isExecuting) return false;
        
        this.isExecuting = true;
        
        try {
            const command = this.undoStack.pop();
            command.undo();
            this.redoStack.push(command);
            
            this.notifyHistoryChanged();
            return true;
        } catch (error) {
            console.error('Undo failed:', error);
            return false;
        } finally {
            this.isExecuting = false;
        }
    }

    // 重做操作
    redo() {
        if (this.redoStack.length === 0 || this.isExecuting) return false;
        
        this.isExecuting = true;
        
        try {
            const command = this.redoStack.pop();
            command.execute();
            this.undoStack.push(command);
            
            this.notifyHistoryChanged();
            return true;
        } catch (error) {
            console.error('Redo failed:', error);
            return false;
        } finally {
            this.isExecuting = false;
        }
    }

    // 清空历史记录
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.notifyHistoryChanged();
    }

    // 获取历史记录状态
    getState() {
        return {
            canUndo: this.undoStack.length > 0,
            canRedo: this.redoStack.length > 0,
            undoDescription: this.undoStack.length > 0 ? 
                this.undoStack[this.undoStack.length - 1].getDescription() : '',
            redoDescription: this.redoStack.length > 0 ? 
                this.redoStack[this.redoStack.length - 1].getDescription() : ''
        };
    }

    // 创建状态快照
    createSnapshot(description, beforeState, afterState, restoreFunction) {
        const command = new SnapshotCommand(description, beforeState, afterState, restoreFunction);
        this.executeCommand(command);
    }

    // 通知历史记录状态变化
    notifyHistoryChanged() {
        eventBus.emit(EventTypes.HISTORY_CHANGED, this.getState());
    }

    // 初始化事件监听器
    initEventListeners() {
        // 监听撤销/重做事件
        eventBus.on(EventTypes.HISTORY_UNDO, () => this.undo());
        eventBus.on(EventTypes.HISTORY_REDO, () => this.redo());
        eventBus.on(EventTypes.HISTORY_CLEAR, () => this.clear());
        
        // 监听命令执行事件
        eventBus.on(EventTypes.COMMAND_EXECUTE, (command) => {
            this.executeCommand(command);
        });
    }
}

// ============================================================================
// 历史记录工具函数
// ============================================================================
window.HistoryUtils = {
    // 创建添加音符命令
    createAddNoteCommand(noteData, lineIndex) {
        return new AddNoteCommand(noteData, lineIndex);
    },

    // 创建删除音符命令
    createDeleteNoteCommand(noteIndex, lineIndex) {
        return new DeleteNoteCommand(noteIndex, lineIndex);
    },

    // 创建修改音符命令
    createModifyNoteCommand(noteIndex, oldData, newData, lineIndex) {
        return new ModifyNoteCommand(noteIndex, oldData, newData, lineIndex);
    },

    // 创建添加判定线命令
    createAddJudgeLineCommand() {
        return new AddJudgeLineCommand();
    },

    // 创建添加事件命令
    createAddEventCommand(eventType, eventData, layerIndex, lineIndex) {
        return new AddEventCommand(eventType, eventData, layerIndex, lineIndex);
    },

    // 创建复合命令
    createCompositeCommand(description) {
        return new CompositeCommand(description);
    },

    // 深度复制对象（用于创建快照）
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// 创建全局历史记录管理器实例
window.historyManager = new HistoryManager();

// 导出命令类（供其他模块使用）
window.Commands = {
    Command,
    CompositeCommand,
    SnapshotCommand,
    AddNoteCommand,
    DeleteNoteCommand,
    ModifyNoteCommand,
    AddJudgeLineCommand,
    AddEventCommand
};

// ============================================================================
// 历史记录面板UI组件
// ============================================================================
class HistoryPanel {
    constructor() {
        this.isVisible = false;
        this.maxDisplayItems = 50; // 最多显示50条记录
        
        this.createPanel();
        this.bindEvents();
        this.updatePanel();
    }

    createPanel() {
        // 创建面板HTML结构
        const panelHTML = `
            <div id="history-panel" class="history-panel">
                <div class="history-panel-header">
                    <span class="history-panel-title">
                        <i class="history-icon">📋</i>
                        历史记录
                    </span>
                    <div class="history-panel-controls">
                        <button id="history-clear-btn" class="history-control-btn" title="清空历史记录">
                            <i>🗑️</i>
                        </button>
                        <button id="history-collapse-btn" class="history-control-btn" title="收起面板">
                            <i>❌</i>
                        </button>
                    </div>
                </div>
                <div class="history-panel-content">
                    <div class="history-list-container">
                        <div id="history-list" class="history-list">
                            <!-- 历史记录项将在这里动态生成 -->
                        </div>
                    </div>
                    <div class="history-panel-footer">
                        <div class="history-stats">
                            <span id="history-count">0 个操作</span>
                            <span id="history-position">位置: 0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加面板到页面
        document.body.insertAdjacentHTML('beforeend', panelHTML);
        
        // 添加样式
        this.addStyles();
    }

    addStyles() {
        const styles = `
            <style id="history-panel-styles">
            .history-panel {
                position: fixed;
                top: 50px;
                right: 20px;
                width: 300px;
                height: 400px;
                background: #2a2a2a;
                border: 1px solid #404040;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                z-index: 1000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                color: #e6e6e6;
                display: none;
                flex-direction: column;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .history-panel.visible {
                display: flex;
            }

            .history-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: linear-gradient(135deg, #3a3a3a, #2d2d2d);
                border-bottom: 1px solid #404040;
                border-radius: 8px 8px 0 0;
            }

            .history-panel-title {
                font-weight: 600;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .history-icon {
                font-size: 14px;
                filter: grayscale(1) brightness(1.2);
            }

            .history-panel-controls {
                display: flex;
                gap: 4px;
            }

            .history-control-btn {
                background: transparent;
                border: 1px solid #505050;
                color: #cccccc;
                border-radius: 4px;
                padding: 4px 6px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
            }

            .history-control-btn:hover {
                background: #404040;
                border-color: #606060;
                color: #ffffff;
            }

            .history-panel-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .history-list-container {
                flex: 1;
                overflow-y: auto;
                padding: 8px 0;
            }

            .history-list-container::-webkit-scrollbar {
                width: 6px;
            }

            .history-list-container::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .history-list-container::-webkit-scrollbar-thumb {
                background: #505050;
                border-radius: 3px;
            }

            .history-list-container::-webkit-scrollbar-thumb:hover {
                background: #606060;
            }

            .history-list {
                padding: 0 12px;
            }

            .history-item {
                display: flex;
                align-items: center;
                padding: 6px 8px;
                margin: 2px 0;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                border-left: 3px solid transparent;
                font-size: 11px;
            }

            .history-item:hover {
                background: #3a3a3a;
                border-left-color: #4dacff;
            }

            .history-item.current {
                background: #2d4a6b;
                border-left-color: #4dacff;
                font-weight: 500;
            }

            .history-item.future {
                opacity: 0.5;
                color: #999999;
            }

            .history-item-icon {
                font-size: 12px;
                margin-right: 8px;
                min-width: 16px;
                text-align: center;
            }

            .history-item-text {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .history-item-time {
                font-size: 9px;
                color: #888888;
                margin-left: 8px;
            }

            .history-panel-footer {
                padding: 8px 16px;
                background: #222222;
                border-top: 1px solid #404040;
                border-radius: 0 0 8px 8px;
            }

            .history-stats {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #999999;
            }

            .history-item-separator {
                height: 1px;
                background: #404040;
                margin: 4px 0;
                position: relative;
            }

            .history-item-separator::before {
                content: '当前位置';
                position: absolute;
                right: 0;
                top: -8px;
                font-size: 9px;
                color: #4dacff;
                background: #2a2a2a;
                padding: 0 4px;
            }

            /* 工具栏历史记录按钮样式 */
            .tool-bar .history-btn {
                background: #3a3a3a;
                color: #e6e6e6;
                border: 1px solid #505050;
                padding: 8px 12px;
                margin-left: 3px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .tool-bar .history-btn:hover {
                background: #4a4a4a;
                border-color: #606060;
                color: #4dacff;
            }

            .tool-bar .history-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }

            .tool-bar .history-btn::before {
                font-size: 10px;
            }

            .tool-bar .history-btn[data-action="undo"]::before {
                content: '↶';
            }

            .tool-bar .history-btn[data-action="redo"]::before {
                content: '↷';
            }

            /* 历史记录面板切换按钮 */
            .history-panel-toggle {
                background: #3a3a3a;
                color: #e6e6e6;
                border: 1px solid #505050;
                padding: 8px 12px;
                margin-left: 3px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .history-panel-toggle:hover {
                background: #4a4a4a;
                border-color: #606060;
                color: #4dacff;
            }

            .history-panel-toggle::before {
                content: '📋';
                font-size: 10px;
            }

            /* 响应式设计 */
            @media (max-width: 1200px) {
                .history-panel {
                    width: 250px;
                    height: 350px;
                }
            }

            @media (max-width: 800px) {
                .history-panel {
                    width: 200px;
                    height: 300px;
                    right: 10px;
                }
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        // 清空历史记录
        document.getElementById('history-clear-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
                historyManager.clear();
                this.updatePanel();
            }
        });

        // 收起面板
        document.getElementById('history-collapse-btn').addEventListener('click', () => {
            this.hidePanel();
        });

        // 监听历史记录变化
        eventBus.on(EventTypes.HISTORY_CHANGED, () => {
            this.updatePanel();
        });
    }

    showPanel() {
        this.isVisible = true;
        document.getElementById('history-panel').classList.add('visible');
        this.updatePanel();
    }

    hidePanel() {
        this.isVisible = false;
        document.getElementById('history-panel').classList.remove('visible');
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    updatePanel() {
        const historyList = document.getElementById('history-list');
        const historyCount = document.getElementById('history-count');
        const historyPosition = document.getElementById('history-position');

        if (!historyList) return;

        // 获取历史记录状态
        const state = historyManager.getState();
        const undoStack = historyManager.undoStack;
        const redoStack = historyManager.redoStack;
        const currentPosition = undoStack.length;
        const totalCommands = undoStack.length + redoStack.length;

        // 更新统计信息
        historyCount.textContent = `${totalCommands} 个操作`;
        historyPosition.textContent = `位置: ${currentPosition}/${totalCommands}`;

        // 清空列表
        historyList.innerHTML = '';

        // 添加初始状态
        const initialItem = this.createHistoryItem('📄', '初始状态', '', true, 0 === currentPosition);
        historyList.appendChild(initialItem);

        // 添加撤销栈中的命令（已执行的）
        undoStack.forEach((command, index) => {
            const item = this.createHistoryItem(
                this.getCommandIcon(command),
                command.getDescription(),
                this.formatTime(command.timestamp),
                false,
                index + 1 === currentPosition,
                index
            );
            historyList.appendChild(item);
        });

        // 添加分隔线（如果有重做栈）
        if (redoStack.length > 0) {
            const separator = document.createElement('div');
            separator.className = 'history-item-separator';
            historyList.appendChild(separator);
        }

        // 添加重做栈中的命令（未来的操作）
        redoStack.slice().reverse().forEach((command, index) => {
            const actualIndex = redoStack.length - 1 - index;
            const item = this.createHistoryItem(
                this.getCommandIcon(command),
                command.getDescription(),
                this.formatTime(command.timestamp),
                true,
                false,
                currentPosition + actualIndex + 1
            );
            historyList.appendChild(item);
        });

        // 滚动到当前位置
        this.scrollToCurrentPosition();
    }

    createHistoryItem(icon, text, time, isFuture = false, isCurrent = false, targetPosition = null) {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        if (isCurrent) item.classList.add('current');
        if (isFuture) item.classList.add('future');

        item.innerHTML = `
            <span class="history-item-icon">${icon}</span>
            <span class="history-item-text" title="${text}">${text}</span>
            <span class="history-item-time">${time}</span>
        `;

        // 添加点击事件（跳转到指定历史状态）
        if (targetPosition !== null) {
            item.addEventListener('click', () => {
                this.jumpToPosition(targetPosition);
            });
        }

        return item;
    }

    getCommandIcon(command) {
        const description = command.getDescription();
        
        if (description.includes('添加音符')) return '🎵';
        if (description.includes('删除音符')) return '🗑️';
        if (description.includes('修改音符')) return '✏️';
        if (description.includes('添加判定线')) return '📏';
        if (description.includes('删除判定线')) return '❌';
        if (description.includes('曲线填充')) return '🎭';
        if (description.includes('批量')) return '📦';
        if (description.includes('事件')) return '⚡';
        
        return '⚙️';
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    jumpToPosition(targetPosition) {
        const currentPosition = historyManager.undoStack.length;
        
        if (targetPosition === currentPosition) return;
        
        if (targetPosition < currentPosition) {
            // 需要撤销
            const steps = currentPosition - targetPosition;
            for (let i = 0; i < steps; i++) {
                historyManager.undo();
            }
        } else {
            // 需要重做
            const steps = targetPosition - currentPosition;
            for (let i = 0; i < steps; i++) {
                historyManager.redo();
            }
        }
    }

    scrollToCurrentPosition() {
        setTimeout(() => {
            const currentItem = document.querySelector('.history-item.current');
            if (currentItem) {
                currentItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    }
}

// 创建全局历史记录面板实例
window.historyPanel = new HistoryPanel();

// 历史记录面板工具函数
window.HistoryPanelUtils = {
    show() {
        historyPanel.showPanel();
    },
    
    hide() {
        historyPanel.hidePanel();
    },
    
    toggle() {
        historyPanel.togglePanel();
    },
    
    isVisible() {
        return historyPanel.isVisible;
    }
};
