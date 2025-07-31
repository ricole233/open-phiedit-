/**
 * 事件总线 - 用于解耦组件间通信，特别是历史记录管理
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    // 注册事件监听器
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // 移除事件监听器
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    // 触发事件
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('EventBus error:', error);
            }
        });
    }

    // 只执行一次的事件监听器
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// 全局事件总线实例
window.eventBus = new EventBus();

// 定义事件类型常量
window.EventTypes = {
    // 历史记录相关
    COMMAND_EXECUTE: 'command:execute',
    HISTORY_UNDO: 'history:undo',
    HISTORY_REDO: 'history:redo',
    HISTORY_CLEAR: 'history:clear',
    HISTORY_CHANGED: 'history:changed',
    
    // 音符操作相关
    NOTE_ADD: 'note:add',
    NOTE_DELETE: 'note:delete',
    NOTE_MODIFY: 'note:modify',
    NOTE_BULK_OPERATION: 'note:bulk_operation',
    
    // 判定线操作相关
    JUDGELINE_ADD: 'judgeline:add',
    JUDGELINE_DELETE: 'judgeline:delete',
    JUDGELINE_MODIFY: 'judgeline:modify',
    
    // 事件操作相关
    EVENT_ADD: 'event:add',
    EVENT_DELETE: 'event:delete',
    EVENT_MODIFY: 'event:modify',
    
    // 其他操作
    FILL_NOTES: 'operation:fill_notes',
    PASTE_OPERATION: 'operation:paste'
};
