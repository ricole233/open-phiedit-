<template>
    <div class="keyboard-mapping-container">
        <!-- 键盘可视化部分 -->
        <div class="keyboard-visual-section">
            <keyboard 
                ref="keyboardRef" 
                :min-scale="0.7"
                :highlighted-keys="highlightedKeys"
                @key-click="handleKeyboardKeyClick" 
            />
            <div class="keyboard-legend">
                <div class="legend-item">
                    <div class="legend-color purple"></div>
                    <span>完全面板焦点时，应用程序快捷键都处于活动状态</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color green"></div>
                    <span>面板既有焦点时，面板快捷键会覆盖应用程序快捷键</span>
                </div>
            </div>
        </div>
        
        <!-- 快捷键命令列表部分 -->
        <div class="commands-section">
            <div class="panel-header">
                <h3>键盘快捷键设置</h3>
                <div class="header-actions">
                    <button @click="resetShortcuts" class="reset-btn">重置默认值</button>
                    <button @click="exportShortcuts" class="export-btn">导出配置</button>
                    <input type="file" ref="importInput" class="hidden-input" @change="handleImport" accept=".json" />
                    <button @click="triggerImport" class="import-btn">导入配置</button>
                </div>
            </div>

            <div class="key-visual-display">
                <!-- 键位图形展示区域 -->
                <div class="key-info" v-if="selectedKey">
                    <div class="key-name">{{ selectedKey }}</div>
                    <div class="key-commands">
                        <!-- 固定显示8种组合情况 -->
                        <div class="command-group">
                            <div class="group-header">无修饰键</div>
                            <div v-if="getModifierCommands(selectedKey, []).length === 0" class="no-commands">
                                未绑定命令
                            </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, [])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                                </div>
                </div>
            </div>

                        <div class="command-group">
                            <div class="group-header">Ctrl + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['ctrl']).length === 0" class="no-commands">
                                未绑定命令
                            </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['ctrl'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                                </div>
                            </div>
                </div>

                        <div class="command-group">
                            <div class="group-header">Alt + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['alt']).length === 0" class="no-commands">
                                未绑定命令
                        </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['alt'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                    </div>
                        </div>
                    </div>

                        <div class="command-group">
                            <div class="group-header">Shift + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['shift']).length === 0" class="no-commands">
                                未绑定命令
                        </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['shift'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                    </div>
                        </div>
                    </div>

                        <div class="command-group">
                            <div class="group-header">Ctrl + Alt + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['ctrl', 'alt']).length === 0" class="no-commands">
                                未绑定命令
                        </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['ctrl', 'alt'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                    </div>
                        </div>
                    </div>

                        <div class="command-group">
                            <div class="group-header">Ctrl + Shift + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['ctrl', 'shift']).length === 0" class="no-commands">
                                未绑定命令
                        </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['ctrl', 'shift'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                    </div>
                        </div>
                    </div>

                        <div class="command-group">
                            <div class="group-header">Alt + Shift + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['alt', 'shift']).length === 0" class="no-commands">
                                未绑定命令
                            </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['alt', 'shift'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                            </button> 
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                清除
                            </button>
                        </div>
                            </div>
                        </div>
                        <div class="command-group">
                            <div class="group-header">Ctrl + Alt + Shift + {{ selectedKey }}</div>
                            <div v-if="getModifierCommands(selectedKey, ['ctrl', 'alt', 'shift']).length === 0" class="no-commands">
                                未绑定命令
                            </div>
                            <div v-for="cmd in getModifierCommands(selectedKey, ['ctrl', 'alt', 'shift'])" :key="cmd.id" class="command-item">
                                <div class="command-context" :class="cmd.context">{{ getContextName(cmd.context) }}</div>
                                <div class="command-name">{{ cmd.description || cmd.name }}</div>
                                <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                                <div class="command-actions">
                                    <button @click="startRecordingShortcut(cmd.id)" class="edit-btn">
                                        {{ recordingCommandId === cmd.id ? '按下快捷键...' : '编辑' }}
                                    </button>
                                    <button @click="clearShortcut(cmd.id)" class="clear-btn" :disabled="!cmd.shortcut">
                                        清除
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 键盘按键状态显示 -->
                <div class="pressed-key-display" v-if="lastPressedKey">
                    <div class="pressed-key">
                        <span class="key-label">按下的键:</span>
                        <span class="key-value">{{ lastPressedKey }}</span>
                    </div>
                    <div class="modifier-state">
                        <span class="modifier" :class="{ active: modifierState.ctrlKey }">Ctrl</span>
                        <span class="modifier" :class="{ active: modifierState.shiftKey }">Shift</span>
                        <span class="modifier" :class="{ active: modifierState.altKey }">Alt</span>
                        <span class="modifier" :class="{ active: modifierState.metaKey }">Win</span>
                    </div>
                </div>
                
                <!-- 命令类别筛选 -->
                <div class="commands-filter">
                    <div class="filter-header">按上下文筛选</div>
                    <div class="context-buttons">
                        <button 
                            class="context-btn" 
                            :class="{ active: contextFilter === '' }"
                            @click="contextFilter = ''"
                        >全部</button>
                        <button 
                            class="context-btn" 
                            :class="{ active: contextFilter === 'global' }"
                            @click="contextFilter = 'global'"
                        >全局</button>
                        <button 
                            class="context-btn" 
                            :class="{ active: contextFilter === 'timeline' }"
                            @click="contextFilter = 'timeline'"
                        >时间轴</button>
                        <button 
                            class="context-btn" 
                            :class="{ active: contextFilter === 'preview' }"
                            @click="contextFilter = 'preview'"
                        >预览</button>
                        <button 
                            class="context-btn" 
                            :class="{ active: contextFilter === 'properties' }"
                            @click="contextFilter = 'properties'"
                        >属性面板</button>
                        <button 
                            class="context-btn" 
                            :class="{ active: contextFilter === 'project' }"
                            @click="contextFilter = 'project'"
                        >项目面板</button>
                    </div>
                </div>
                
                <!-- 命令列表展示 -->
                <div class="commands-list">
                    <div class="commands-list-header">
                        <input type="text" v-model="searchTerm" placeholder="搜索命令或快捷键..." class="search-input" />
                        <label class="filter-label">
                            <input type="checkbox" v-model="showUnassigned" /> 
                            仅显示未分配
                        </label>
                    </div>
                    
                    <div class="commands-items">
                        <div v-for="cmd in filteredCommands" :key="cmd.id" class="command-row" :class="{'active': selectedCommand === cmd.id}">
                            <div class="command-info">
                                <span class="context-badge" :class="cmd.context">{{ getContextName(cmd.context) }}</span>
                                <span class="command-name">{{ cmd.description || cmd.name }}</span>
                            </div>
                            <div class="command-shortcut">{{ formatShortcut(cmd.shortcut) }}</div>
                            <div class="row-actions">
                                <button @click="startRecordingShortcut(cmd.id)" class="small-btn edit-btn">
                                    {{ recordingCommandId === cmd.id ? '按下...' : '编辑' }}
                                </button>
                                <button @click="clearShortcut(cmd.id)" class="small-btn clear-btn" :disabled="!cmd.shortcut">
                                    清除
                                </button>
                </div>
            </div>

            <!-- 无结果提示 -->
            <div v-if="filteredCommands.length === 0" class="no-results">
                没有找到匹配的命令
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 快捷键冲突对话框 -->
        <div v-if="showConflictDialog" class="conflict-dialog">
            <div class="conflict-dialog-content">
                <h4>快捷键冲突</h4>
                <p>快捷键 <strong>{{ formatShortcut(pendingShortcut) }}</strong> 已被分配给:</p>
                <p class="conflict-command">{{ conflictCommand?.description || conflictCommand?.name }}</p>
                <p>如何处理这个冲突?</p>
                <div class="conflict-actions">
                    <button @click="resolveConflict(true)" class="replace-btn">替换现有绑定</button>
                    <button @click="resolveConflict(false)" class="cancel-btn">取消</button>
                </div>
            </div>
        </div>
        
        <!-- 修饰符状态指示器 -->
        <div class="modifier-indicators" :class="{ 'active': isRecording }">
            <div class="modifier" :class="{ 'active': modifierState.ctrlKey }">Ctrl</div>
            <div class="modifier" :class="{ 'active': modifierState.altKey }">Alt</div>
            <div class="modifier" :class="{ 'active': modifierState.shiftKey }">Shift</div>
            <div class="modifier" :class="{ 'active': modifierState.metaKey }">Win</div>
        </div>
        
        <!-- 提示消息 -->
        <div v-if="showToast" class="toast-message" :class="toastType">
            {{ toastMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import Keyboard from '../equipment/Keyboard.vue';
import { CommandRegistry } from '../../../core/commands';
import { KeymapManager } from '../../../core/commands/keymap';
import { emitEvent } from '../../../core/events/eventBus';
import type { CommandDefinition, CommandContext } from '../../../core/commands/types';

// 引用键盘组件
const keyboardRef = ref<InstanceType<typeof Keyboard> | null>(null);

// 搜索和过滤状态
const searchTerm = ref('');
const showUnassigned = ref(false);
const contextFilter = ref('');

// 快捷键录制状态
const isRecording = ref(false);
const recordingCommandId = ref<string | null>(null);
const keysPressed = ref<string[]>([]);
const recordingTimeout = ref<number | null>(null);

// 冲突处理状态
const showConflictDialog = ref(false);
const conflictCommand = ref<CommandDefinition | null>(null);
const pendingShortcut = ref('');
const pendingCommandId = ref('');

// 选中的命令
const selectedCommand = ref<string | null>(null);

// 修饰键状态
const modifierState = reactive({
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
});

// 高亮键盘按键
const highlightedKeys = ref<Record<string, string>>({});

// 导入相关
const importInput = ref<HTMLInputElement | null>(null);

// 提示消息
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('');
const toastTimeout = ref<number | null>(null);

// 新增变量
const selectedKey = ref<string | null>(null);
const selectedKeyCommands = ref<CommandDefinition[]>([]);
const lastPressedKey = ref<string | null>(null);

// 获取所有命令并按名称排序
const commands = computed(() => {
    return CommandRegistry.getAllCommands()
        .sort((a, b) => a.description.localeCompare(b.description));
});

// 根据搜索和过滤条件筛选命令
const filteredCommands = computed(() => {
    return commands.value.filter(cmd => {
        // 搜索条件过滤
        const matchesSearch = !searchTerm.value ||
            cmd.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            cmd.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            cmd.shortcut.toLowerCase().includes(searchTerm.value.toLowerCase());
        
        // 未分配过滤
        const matchesUnassigned = !showUnassigned.value || !cmd.shortcut;
        
        // 上下文过滤
        const matchesContext = !contextFilter.value || cmd.context === contextFilter.value;
        
        return matchesSearch && matchesUnassigned && matchesContext;
    });
});

// 更新高亮键盘按键
function updateHighlightedKeys(): void {
    const highlights: Record<string, string> = {};
    const contextColors = {
        global: 'purple',
        timeline: 'green',
        preview: 'green',
        properties: 'green',
        project: 'green'
    };
    
    commands.value.forEach(cmd => {
        if (cmd.shortcut) {
            const keys = parseShortcutToKeys(cmd.shortcut);
            keys.forEach(key => {
                const color = contextColors[cmd.context as keyof typeof contextColors] || 'purple';
                highlights[key] = color;
            });
        }
    });
    
    console.log("[键盘映射] 更新高亮键位:", highlights);
    highlightedKeys.value = highlights;
}

// 将快捷键字符串解析为键盘按键代码
function parseShortcutToKeys(shortcut: string): string[] {
    if (!shortcut) return [];
    
    const parts = shortcut.split('+');
    const keyMapping: Record<string, string> = {
        'ctrl': 'ControlLeft',
        'shift': 'ShiftLeft',
        'alt': 'AltLeft',
        'command': 'MetaLeft',
        'space': 'Space',
        'left': 'ArrowLeft',
        'right': 'ArrowRight',
        'up': 'ArrowUp',
        'down': 'ArrowDown',
        'esc': 'Escape',
        'del': 'Delete',
        'backspace': 'Backspace',
        'tab': 'Tab',
        'enter': 'Enter',
        '0': 'Digit0',
        '1': 'Digit1',
        '2': 'Digit2',
        '3': 'Digit3',
        '4': 'Digit4',
        '5': 'Digit5',
        '6': 'Digit6',
        '7': 'Digit7',
        '8': 'Digit8',
        '9': 'Digit9',
    };
    
    return parts.map(part => {
        const key = part.trim().toLowerCase();
        if (keyMapping[key]) {
            return keyMapping[key];
        }
        
        // 单字符按键转换为键盘代码
        if (key.length === 1 && key >= 'a' && key <= 'z') {
            return `Key${key.toUpperCase()}`;
        }
        
        // 处理功能键
        if (key.match(/^f\d+$/)) {
            return key.toUpperCase();
        }
        
        return key;
    });
}

// 键盘按键点击处理
function handleKeyboardKeyClick(keyCode: string): void {
    console.log(`[键盘映射] 点击键盘按键: ${keyCode}`);
    
    // 查找使用此按键的命令
    const relatedCommands = commands.value.filter(cmd => {
        const keys = parseShortcutToKeys(cmd.shortcut);
        return keys.includes(keyCode);
    });
    
    // 更新选中的键和相关命令
    selectedKey.value = keyCodeToDisplayName(keyCode);
    selectedKeyCommands.value = relatedCommands;
    
    if (relatedCommands.length > 0) {
        // 选中第一个相关命令
        selectedCommand.value = relatedCommands[0].id;
        
        // 显示提示包含所有相关命令
        const commandNames = relatedCommands.map(cmd => cmd.description || cmd.name).join(', ');
        showToastMessage(`按键 ${keyCodeToDisplayName(keyCode)} 已被分配给: ${commandNames}`, 'info');
    } else {
        showToastMessage(`按键 ${keyCodeToDisplayName(keyCode)} 未分配任何命令`, 'info');
    }
}

// 键盘代码转显示名称
function keyCodeToDisplayName(keyCode: string): string {
    const simpleMappings: Record<string, string> = {
        'ControlLeft': 'Ctrl',
        'ShiftLeft': 'Shift',
        'AltLeft': 'Alt',
        'MetaLeft': 'Win',
        'Space': '空格',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'Escape': 'Esc',
        'Delete': 'Del',
        'Backspace': '←',
        'Tab': 'Tab',
        'Enter': 'Enter'
    };
    
    if (simpleMappings[keyCode]) {
        return simpleMappings[keyCode];
    }
    
    if (keyCode.startsWith('Key')) {
        return keyCode.replace('Key', '');
    }
    
    if (keyCode.startsWith('Digit')) {
        return keyCode.replace('Digit', '');
    }
    
    return keyCode;
}

// 滚动到特定命令
function scrollToCommand(commandId: string): void {
    setTimeout(() => {
        const element = document.querySelector(`[data-command-id="${commandId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// 获取上下文显示名称
function getContextName(context: CommandContext): string {
    const contextMap: Record<CommandContext, string> = {
        global: '全局',
        timeline: '时间轴',
        preview: '预览',
        properties: '属性面板',
        project: '项目面板'
    };
    
    return contextMap[context] || context;
}

// 格式化快捷键显示
function formatShortcut(shortcut: string): string {
    if (!shortcut) return '未设置';
    
    return shortcut
        .replace(/\+/g, ' + ')
        .replace(/ctrl/g, 'Ctrl')
        .replace(/shift/g, 'Shift')
        .replace(/alt/g, 'Alt')
        .replace(/command/g, '⌘')
        .replace(/left/g, '←')
        .replace(/right/g, '→')
        .replace(/up/g, '↑')
        .replace(/down/g, '↓')
        .replace(/space/g, '空格');
}

// 开始录制快捷键
function startRecordingShortcut(commandId: string): void {
    console.log(`[键盘映射] 开始录制快捷键，命令ID: ${commandId}`);
    
    recordingCommandId.value = commandId;
    isRecording.value = true;
    keysPressed.value = [];
    selectedCommand.value = commandId;
    
    // 添加键盘事件监听
    document.addEventListener('keydown', recordKey);
    document.addEventListener('keyup', updateModifiers);
    
    // 设置超时，如果长时间未输入则自动取消
    if (recordingTimeout.value) {
        clearTimeout(recordingTimeout.value);
    }
    
    recordingTimeout.value = window.setTimeout(() => {
        stopRecording();
    }, 5000);
}

// 更新修饰键状态
function updateModifiers(e: KeyboardEvent): void {
    if (!isRecording.value) return;
    
    modifierState.ctrlKey = e.ctrlKey;
    modifierState.altKey = e.altKey;
    modifierState.shiftKey = e.shiftKey;
    modifierState.metaKey = e.metaKey;
}

// 记录按键
function recordKey(e: KeyboardEvent): void {
    if (!isRecording.value) return;
    
    // 阻止事件传播和默认行为
    e.preventDefault();
    e.stopPropagation();
    
    // 更新修饰键状态
    updateModifiers(e);
    
    console.log(`[键盘映射] 检测到按键: ${e.key}`);
    
    // 更新最后按下的键
    lastPressedKey.value = e.key;
    
    // 重置超时
    if (recordingTimeout.value) {
        clearTimeout(recordingTimeout.value);
    }
    
    // Esc键取消录制
    if (e.key === 'Escape') {
        stopRecording();
        return;
    }
    
    // 清空现有的按键数组
    keysPressed.value = [];
    
    // 添加修饰键
    if (e.ctrlKey) keysPressed.value.push('ctrl');
    if (e.shiftKey) keysPressed.value.push('shift');
    if (e.altKey) keysPressed.value.push('alt');
    if (e.metaKey) keysPressed.value.push('command');
    
    // 特殊键处理
    const keyName = getKeyName(e.key);
    
    // 如果不是单独的修饰键，添加主键
    if (!['ctrl', 'shift', 'alt', 'command', 'control', 'meta'].includes(keyName.toLowerCase()) && keyName) {
        keysPressed.value.push(keyName);
        
        // 生成快捷键字符串
        const shortcutString = keysPressed.value.join('+');
        
        // 检查是否有非修饰键
        if (keysPressed.value.some(k => !['ctrl', 'shift', 'alt', 'command'].includes(k))) {
            // 检查冲突
            checkConflictAndApply(shortcutString);
        }
    } else {
        // 如果只是修饰键，继续等待
        recordingTimeout.value = window.setTimeout(() => {
            stopRecording();
        }, 2000);
    }
}

// 检查冲突并应用快捷键
function checkConflictAndApply(shortcut: string): void {
    const currentCommandId = recordingCommandId.value;
    if (!currentCommandId) return;
    
    const conflict = KeymapManager.detectConflict(shortcut, currentCommandId);
    
    if (conflict) {
        // 存在冲突，显示确认对话框
        conflictCommand.value = conflict;
        pendingShortcut.value = shortcut;
        pendingCommandId.value = currentCommandId;
        showConflictDialog.value = true;
        stopRecording();
    } else {
        // 无冲突，直接应用
        applyShortcut(currentCommandId, shortcut);
        stopRecording();
    }
}

// 应用快捷键
async function applyShortcut(commandId: string, shortcut: string): Promise<void> {
    try {
        await CommandRegistry.updateShortcut(commandId, shortcut);
        emitEvent('shortcuts:config-changed', undefined);
        showToastMessage('快捷键设置已保存', 'success');
        // 更新高亮键盘按键
        setTimeout(updateHighlightedKeys, 100);
    } catch (error) {
        console.error('[键盘映射] 应用快捷键失败:', error);
        showToastMessage('快捷键设置失败', 'error');
    }
}

// 停止录制
function stopRecording(): void {
    console.log('[键盘映射] 停止录制快捷键');
    
    if (recordingTimeout.value) {
        clearTimeout(recordingTimeout.value);
        recordingTimeout.value = null;
    }
    
    recordingCommandId.value = null;
    isRecording.value = false;
    keysPressed.value = [];
    lastPressedKey.value = null;
    
    // 重置修饰键状态
    Object.keys(modifierState).forEach(key => {
        modifierState[key as keyof typeof modifierState] = false;
    });
    
    // 移除事件监听
    document.removeEventListener('keydown', recordKey);
    document.removeEventListener('keyup', updateModifiers);
}

// 处理快捷键冲突
async function resolveConflict(replace: boolean): Promise<void> {
    if (replace && conflictCommand.value) {
        // 清除冲突的快捷键
        await CommandRegistry.updateShortcut(conflictCommand.value.id, '');
        // 应用新的快捷键
        await applyShortcut(pendingCommandId.value, pendingShortcut.value);
    }
    
    showConflictDialog.value = false;
    conflictCommand.value = null;
    pendingShortcut.value = '';
    pendingCommandId.value = '';
}

// 清除快捷键
async function clearShortcut(commandId: string): Promise<void> {
    try {
        await CommandRegistry.updateShortcut(commandId, '');
        emitEvent('shortcuts:config-changed', undefined);
        showToastMessage('快捷键已清除', 'success');
        // 更新高亮键盘按键
        setTimeout(updateHighlightedKeys, 100);
    } catch (error) {
        console.error('[键盘映射] 清除快捷键失败:', error);
        showToastMessage('清除快捷键失败', 'error');
    }
}

// 提供快捷键建议
async function suggestShortcut(commandId: string): Promise<void> {
    const command = commands.value.find(cmd => cmd.id === commandId);
    if (!command) return;
    
    // 基于命令名称的第一个字符提供建议
    const baseKey = command.name.charAt(0).toLowerCase();
    const suggestion = KeymapManager.suggestAvailableShortcut(baseKey);
    
    if (suggestion) {
        await CommandRegistry.updateShortcut(commandId, suggestion);
        emitEvent('shortcuts:config-changed', undefined);
        showToastMessage(`已设置建议的快捷键: ${formatShortcut(suggestion)}`, 'success');
        // 更新高亮键盘按键
        setTimeout(updateHighlightedKeys, 100);
    } else {
        showToastMessage('无法找到合适的快捷键建议', 'warning');
    }
}

// 重置所有快捷键
async function resetShortcuts(): Promise<void> {
    if (!confirm('确定要重置所有快捷键到默认设置吗？')) return;
    
    try {
        await KeymapManager.resetToDefaults();
        emitEvent('shortcuts:reset-defaults', undefined);
        showToastMessage('所有快捷键已重置为默认值', 'success');
        // 更新高亮键盘按键
        setTimeout(updateHighlightedKeys, 100);
    } catch (error) {
        console.error('[键盘映射] 重置快捷键失败:', error);
        showToastMessage('重置快捷键失败', 'error');
    }
}

// 导出快捷键配置
function exportShortcuts(): void {
    try {
        const jsonData = KeymapManager.exportKeymap();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = 'ae-panel-shortcuts.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToastMessage('快捷键配置已导出', 'success');
    } catch (error) {
        console.error('[键盘映射] 导出快捷键失败:', error);
        showToastMessage('导出快捷键配置失败', 'error');
    }
}

// 触发导入文件选择
function triggerImport(): void {
    if (importInput.value) {
        importInput.value.click();
    }
}

// 处理导入文件
async function handleImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    try {
        const file = input.files[0];
        const text = await file.text();
        
        const result = await KeymapManager.importKeymap(text);
        if (result.success) {
            showToastMessage(`导入成功: ${result.imported} 项快捷键已应用`, 'success');
            // 更新高亮键盘按键
            setTimeout(updateHighlightedKeys, 100);
        } else {
            showToastMessage(`导入部分失败: ${result.errors.length} 个错误`, 'warning');
        }
        
        // 清空文件选择，以便下次选择同一文件时也能触发change事件
        input.value = '';
    } catch (error) {
        console.error('[键盘映射] 导入快捷键失败:', error);
        showToastMessage('导入快捷键配置失败', 'error');
    }
}

// 获取键名
function getKeyName(key: string): string {
    // 特殊键映射
    const specialKeys: Record<string, string> = {
        ' ': 'space',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'Escape': 'esc',
        'Delete': 'del',
        'Backspace': 'backspace',
        'Tab': 'tab',
        'Enter': 'enter'
    };
    
    if (key in specialKeys) {
        return specialKeys[key];
    }
    
    // 单个字符键直接返回小写
    if (key.length === 1) {
        return key.toLowerCase();
    }
    
    return key.toLowerCase();
}

// 显示提示消息
function showToastMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;
    
    if (toastTimeout.value) {
        clearTimeout(toastTimeout.value);
    }
    
    toastTimeout.value = window.setTimeout(() => {
        showToast.value = false;
    }, 3000);
}

// 监听命令变化以更新高亮键盘
watch(commands, () => {
    console.log("[键盘映射] 检测到命令变化，更新高亮键位");
    updateHighlightedKeys();
}, { deep: true });

// 添加全局按键监听以实时显示最后按下的键
function setupGlobalKeyListener(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // 只有在非录制状态下才更新最后按下的键
        if (!isRecording.value) {
            lastPressedKey.value = keyCodeToDisplayName(e.code);
            
            // 更新修饰键状态
            modifierState.ctrlKey = e.ctrlKey;
            modifierState.altKey = e.altKey;
            modifierState.shiftKey = e.shiftKey;
            modifierState.metaKey = e.metaKey;
            
            // 查找相关命令
            const keyCode = e.code;
            const relatedCommands = commands.value.filter(cmd => {
                const keys = parseShortcutToKeys(cmd.shortcut);
                return keys.includes(keyCode);
            });
            
            selectedKey.value = keyCodeToDisplayName(keyCode);
            selectedKeyCommands.value = relatedCommands;
            
            // 5秒后清除显示
            setTimeout(() => {
                if (lastPressedKey.value === keyCodeToDisplayName(keyCode)) {
                    lastPressedKey.value = null;
                }
            }, 5000);
        }
    });
}

// 组件挂载和卸载
onMounted(() => {
    console.log('[键盘映射] 键盘映射组件已挂载');
    // 确保在DOM渲染后执行，允许键盘组件初始化
    setTimeout(updateHighlightedKeys, 200);
    // 设置全局按键监听器
    setupGlobalKeyListener();
});

onUnmounted(() => {
    console.log('[键盘映射] 键盘映射组件即将卸载');
    if (isRecording.value) {
        stopRecording();
    }
    
    if (toastTimeout.value) {
        clearTimeout(toastTimeout.value);
    }
});

// 根据修饰键组合获取相关命令
function getModifierCommands(key: string | null, modifiers: string[]): CommandDefinition[] {
    if (!key) return [];
    
    // 将key名称转换为键盘代码
    let keyCode = '';
    const keyMappingReverse: Record<string, string> = {
        'Ctrl': 'ControlLeft',
        'Shift': 'ShiftLeft',
        'Alt': 'AltLeft',
        'Win': 'MetaLeft',
        '空格': 'Space',
        '←': 'ArrowLeft',
        '→': 'ArrowRight',
        '↑': 'ArrowUp',
        '↓': 'ArrowDown',
        'Esc': 'Escape',
        'Del': 'Delete',
        'Tab': 'Tab',
        'Enter': 'Enter'
    };
    
    if (keyMappingReverse[key]) {
        keyCode = keyMappingReverse[key];
    } else if (key.length === 1 && key.match(/[A-Z]/)) {
        keyCode = `Key${key}`;
    } else if (key.match(/^\d$/)) {
        keyCode = `Digit${key}`;
    } else {
        keyCode = key;
    }
    
    // 查找符合条件的命令
    return commands.value.filter(cmd => {
        if (!cmd.shortcut) return false;
        
        // 解析快捷键
        const shortcutParts = cmd.shortcut.toLowerCase().split('+');
        const mainKey = shortcutParts.find(part => !['ctrl', 'shift', 'alt', 'command'].includes(part));
        
        // 检查主键是否匹配
        if (!mainKey) return false;
        
        // 将主键转换为键代码进行比较
        let mainKeyCode = '';
        if (mainKey.length === 1 && mainKey >= 'a' && mainKey <= 'z') {
            mainKeyCode = `Key${mainKey.toUpperCase()}`;
        } else if (mainKey >= '0' && mainKey <= '9') {
            mainKeyCode = `Digit${mainKey}`;
        } else if (keyMappingReverse[mainKey]) {
            mainKeyCode = keyMappingReverse[mainKey];
        }
        
        if (mainKeyCode !== keyCode && mainKey !== key.toLowerCase()) return false;
        
        // 检查修饰键是否匹配
        const hasCtrl = shortcutParts.includes('ctrl');
        const hasAlt = shortcutParts.includes('alt');
        const hasShift = shortcutParts.includes('shift');
        
        if (modifiers.includes('ctrl') !== hasCtrl) return false;
        if (modifiers.includes('alt') !== hasAlt) return false;
        if (modifiers.includes('shift') !== hasShift) return false;
        
        return true;
    });
}
</script>

<style scoped>
.keyboard-mapping-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #eee;
    font-family: Arial, "Microsoft YaHei", sans-serif;
    background-color: #2d2d2d;
    border-radius: 6px;
    overflow: hidden;
}

.keyboard-visual-section {
    padding: 10px;
    border-bottom: 2px solid #444;
}

.keyboard-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 8px;
    margin-top: 10px;
    font-size: 12px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
}

.legend-color.purple {
    background-color: #805ad5;
}

.legend-color.green {
    background-color: #38a169;
}

.commands-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow-y: auto;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #444;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

.header-actions {
    display: flex;
    gap: 8px;
}

.key-visual-display {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
}

.key-info {
    background: #3a3a3a;
    border-radius: 12px;
    padding: 0px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    animation: fadeIn 0.3s;
}

.key-name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
    padding: 6px;
    background: #4a4a4a;
    border-radius: 4px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.key-commands {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 600px;
    overflow-y: auto;
    padding: 8px 4px;
    scrollbar-width: thin;
    scrollbar-color: #919191 #333;
}

.command-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0px 8px 0px 0px;
    background: #333;
    border-radius: 4px;
    margin-bottom: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    border-left: 3px solid #4a5568;
}

.group-header {
    font-size: 13px;
    font-weight: 600;
    padding-bottom: 1px;
    border-bottom: 1px solid #444;
    color: #e2e8f0;
    display: flex;
    align-items: center;
}

.command-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 8px;
    align-items: center;
    background: #444;
    padding: 6px 10px;
    border-radius: 4px;
    transition: background 0.2s;
}

.command-item:hover {
    background: #505050;
}

.command-context {
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 500;
    text-align: center;
}

.command-context.global {
    background: #805ad5;
    color: white;
}

.command-context.timeline,
.command-context.preview,
.command-context.properties,
.command-context.project {
    background: #38a169;
    color: white;
}

.command-name {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.command-shortcut {
    font-family: monospace;
    background: #333;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 11px;
}

.command-actions {
    display: flex;
    gap: 3px;
}

.no-commands {
    padding: 6px;
    text-align: center;
    color: #a0aec0;
    font-style: italic;
    font-size: 12px;
}

.pressed-key-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #3a3a3a;
    border-radius: 6px;
    padding: 12px 15px;
    margin-bottom: 10px;
    animation: pulseHighlight 1s;
}

.pressed-key {
    display: flex;
    gap: 8px;
    align-items: center;
}

.key-label {
    font-size: 14px;
    opacity: 0.7;
}

.key-value {
    font-size: 18px;
    font-weight: bold;
    background: #4a4a4a;
    padding: 5px 10px;
    border-radius: 4px;
}

.modifier-state {
    display: flex;
    gap: 8px;
}

.modifier {
    padding: 4px 8px;
    background-color: #444;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0.5;
    transition: all 0.2s;
}

.modifier.active {
    opacity: 1;
    background-color: #2b6cb0;
    transform: scale(1.1);
}

.commands-filter {
    margin-top: 10px;
}

.filter-header {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #a0aec0;
}

.context-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.context-btn {
    padding: 5px 10px;
    border-radius: 4px;
    background: #444;
    border: none;
    color: #eee;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.context-btn.active {
    background: #2b6cb0;
    font-weight: bold;
}

.context-btn:hover:not(.active) {
    background: #555;
}

.commands-list {
    background: #333;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 400px;
}

.commands-list-header {
    padding: 12px 15px;
    background: #3a3a3a;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #444;
    position: sticky;
    top: 0;
    z-index: 1;
}

.commands-items {
    overflow-y: auto;
    padding: 5px;
}

.command-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    margin: 2px 0;
    border-radius: 4px;
    transition: background 0.2s;
}

.command-row:hover {
    background: #3a3a3a;
}

.command-row.active {
    background-color: #2c5282;
}

.command-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.context-badge {
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 11px;
    white-space: nowrap;
}

.context-badge.global {
    background: #805ad5;
    color: white;
}

.context-badge.timeline,
.context-badge.preview,
.context-badge.properties,
.context-badge.project {
    background: #38a169;
    color: white;
}

.row-actions {
    display: flex;
    gap: 4px;
}

.small-btn {
    padding: 2px 6px;
    font-size: 11px;
    border-radius: 3px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseHighlight {
    0% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
    100% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
}

.search-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
}

.search-input {
    width: 100%;
    padding: 8px 12px;
    background: #333;
    border: 1px solid #555;
    color: #eee;
    border-radius: 4px;
    font-size: 14px;
}

.filter-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 13px;
}

.context-filter {
    padding: 4px 8px;
    background: #333;
    border: 1px solid #555;
    color: #eee;
    border-radius: 4px;
    font-size: 13px;
}

.commands-table {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 1px solid #444;
    border-radius: 4px;
    overflow: hidden;
}

.table-header {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    background-color: #3a3a3a;
    padding: 8px 10px;
    font-weight: bold;
    font-size: 13px;
    position: sticky;
    top: 0;
    z-index: 1;
}

.table-body {
    overflow-y: auto;
    max-height: 400px;
    background-color: #333;
}

.table-row {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    padding: 6px 10px;
    border-bottom: 1px solid #444;
    align-items: center;
    transition: background-color 0.2s;
}

.table-row:hover {
    background-color: #3a3a3a;
}

.table-row.active {
    background-color: #2c5282;
}

.column-modifier {
    font-family: monospace;
    font-size: 13px;
    background-color: #444;
    padding: 3px 6px;
    border-radius: 3px;
    margin-right: 8px;
}

.column-command {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 8px;
    font-size: 13px;
}

.column-actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
}

button {
    padding: 3px 8px;
    border: none;
    border-radius: 3px;
    background-color: #444;
    color: #eee;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s, opacity 0.2s;
}

button:hover {
    background-color: #555;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.edit-btn {
    background-color: #4299e1;
}

.edit-btn:hover {
    background-color: #3182ce;
}

.reset-btn {
    background-color: #e53e3e;
}

.reset-btn:hover {
    background-color: #c53030;
}

.export-btn {
    background-color: #2b6cb0;
}

.export-btn:hover {
    background-color: #2c5282;
}

.import-btn {
    background-color: #38a169;
}

.import-btn:hover {
    background-color: #2f855a;
}

.clear-btn {
    background-color: #718096;
}

.clear-btn:hover {
    background-color: #4a5568;
}

.hidden-input {
    display: none;
}

.no-results {
    padding: 15px;
    text-align: center;
    color: #a0aec0;
    font-style: italic;
    font-size: 13px;
}

.conflict-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.conflict-dialog-content {
    background-color: #333;
    border-radius: 6px;
    padding: 20px;
    width: 400px;
    max-width: 90vw;
}

.conflict-dialog h4 {
    margin-top: 0;
    color: #e53e3e;
}

.conflict-command {
    background-color: #444;
    padding: 8px;
    border-radius: 4px;
    font-weight: bold;
}

.conflict-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 15px;
}

.replace-btn {
    background-color: #e53e3e;
}

.replace-btn:hover {
    background-color: #c53030;
}

.cancel-btn {
    background-color: #718096;
}

.modifier-indicators {
    display: flex;
    gap: 10px;
    margin: 10px auto;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.modifier-indicators.active {
    opacity: 1;
}

.toast-message {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    border-radius: 4px;
    color: white;
    font-size: 13px;
    z-index: 1100;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
}

.toast-message.success {
    background-color: #38a169;
}

.toast-message.error {
    background-color: #e53e3e;
}

.toast-message.warning {
    background-color: #d69e2e;
}

.toast-message.info {
    background-color: #3182ce;
}

@keyframes pulse {
    0% {
        background-color: #2c5282;
    }

    50% {
        background-color: #1a365d;
    }

    100% {
        background-color: #2c5282;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, 20px);
    }

    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translate(-50%, 0);
    }

    to {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
}

@media (max-width: 768px) {
    .table-header,
    .table-row {
        grid-template-columns: 1fr 2fr;
    }
    
    .column-actions {
        display: none;
    }
}
</style>
