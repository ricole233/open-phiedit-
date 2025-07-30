<template>
    <div class="mouse-container" :class="{ 'disabled': disabled }">
        <!-- 鼠标矢量图形展示区域 -->
        <div class="mouse-vector-container">
            <!-- 鼠标主体 -->
            <div class="mouse-body">

                <!-- 侧键区域 -->
                <div class="side-buttons-container">
                    <div class="side-button side-button-2"
                        :class="{ 'active': isSideButtonForwardPressed, 'configured': hasKeyBinding('sideForward') }"
                        @click="handleKeyBinding('sideForward')">
                        <span v-if="keyBindings.sideForward" class="side-binding">{{
                            keyBindings.sideForward }}</span>
                    </div>
                    <div class="side-button side-button-1"
                        :class="{ 'active': isSideButtonBackPressed, 'configured': hasKeyBinding('sideBack') }"
                        @click="handleKeyBinding('sideBack')">
                        <span v-if="keyBindings.sideBack" class="side-binding">{{ keyBindings.sideBack
                            }}</span>
                    </div>
                </div>
                <!-- 左键区域 -->
                <div class="mouse-left-button"
                    :class="{ 'active': isLeftButtonPressed, 'configured': hasKeyBinding('leftClick') }"
                    @click="handleKeyBinding('leftClick')">
                    <span v-if="keyBindings.leftClick" class="button-binding">{{ keyBindings.leftClick
                        }}</span>
                </div>

                <!-- 右键区域 -->
                <div class="mouse-right-button"
                    :class="{ 'active': isRightButtonPressed, 'configured': hasKeyBinding('rightClick') }"
                    @click="handleKeyBinding('rightClick')">
                    <span v-if="keyBindings.rightClick" class="button-binding">{{ keyBindings.rightClick
                        }}</span>
                </div>

                <!-- 滚轮区域 -->
                <div class="mouse-wheel-container">
                    <!-- 滚轮上滚 -->
                    <div class="wheel-up"
                        :class="{ 'active': isWheelUpPressed, 'configured': hasKeyBinding('wheelUp') }"
                        @click="handleKeyBinding('wheelUp')">
                        <span v-if="keyBindings.wheelUp" class="wheel-binding wheel-up-binding">{{
                            keyBindings.wheelUp }}</span>
                    </div>

                    <!-- 中键 -->
                    <div class="wheel-middle"
                        :class="{ 'active': isMiddleButtonPressed, 'configured': hasKeyBinding('middleClick') }"
                        @click="handleKeyBinding('middleClick')">
                        <span v-if="keyBindings.middleClick" class="wheel-binding">{{
                            keyBindings.middleClick }}</span>
                    </div>

                    <!-- 滚轮下滚 -->
                    <div class="wheel-down"
                        :class="{ 'active': isWheelDownPressed, 'configured': hasKeyBinding('wheelDown') }"
                        @click="handleKeyBinding('wheelDown')">
                        <span v-if="keyBindings.wheelDown" class="wheel-binding wheel-down-binding">{{
                            keyBindings.wheelDown }}</span>
                    </div>
                </div>

                <!-- 鼠标线 -->
                <div class="mouse-cable"></div>
            </div>
        </div>

        <!-- 快捷键设置面板 -->
        <div class="control-panel" :class="{ 'expanded': showBindingPanel }">
            <div class="panel-header">
                <h3>鼠标快捷键设置</h3>
                <button @click="toggleBindingPanel" class="toggle-panel-btn">
                    {{ showBindingPanel ? '收起面板' : '展开面板' }}
                </button>
            </div>

            <div v-if="showBindingPanel" class="panel-content">
                <div v-if="activeConfigKey" class="binding-prompt">
                    <p>请按下键盘按键来绑定 <strong>{{ getButtonLabel(activeConfigKey) }}</strong></p>
                    <p class="current-binding">当前绑定: {{ tempKeyBinding || '无' }}</p>
                    <div class="binding-actions">
                        <button @click="clearBinding" class="clear-btn">清除绑定</button>
                        <button @click="cancelBinding" class="cancel-btn">取消</button>
                    </div>
                </div>

                <div v-else class="binding-table">
                    <div class="table-header">
                        <span class="col-button">鼠标按键</span>
                        <span class="col-binding">绑定快捷键</span>
                        <span class="col-action">操作</span>
                    </div>

                    <div class="table-body">
                        <div v-for="(binding, key) in keyBindings" :key="key" class="table-row">
                            <span class="col-button">{{ getButtonLabel(key) }}</span>
                            <span class="col-binding">{{ binding || '未设置' }}</span>
                            <button @click="handleKeyBinding(key)" class="action-btn set-btn">设置</button>
                        </div>
                    </div>

                    <div class="table-footer">
                        <button @click="resetBindings" class="reset-all-btn">重置全部</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 按键监听覆盖层 -->
        <div v-if="isListening" class="key-listener-overlay">
            <div class="key-listener-content">
                <p>按下键盘按键设置快捷键...</p>
                <p class="current-binding">{{ tempKeyBinding || '等待按键...' }}</p>
                <button @click="cancelBinding" class="cancel-btn">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';

// 组件属性
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    },
    initialBindings: {
        type: Object,
        default: () => ({})
    }
});

// 事件
const emit = defineEmits([
    'binding-change',
    'binding-complete',
    'key-activated'
]);

// 状态数据
const isLeftButtonPressed = ref(false);
const isRightButtonPressed = ref(false);
const isMiddleButtonPressed = ref(false);
const isWheelUpPressed = ref(false);
const isWheelDownPressed = ref(false);
const isSideButtonBackPressed = ref(false);
const isSideButtonForwardPressed = ref(false);

// 快捷键设置相关状态
const showBindingPanel = ref(false);
const isListening = ref(false);
const activeConfigKey = ref<string | null>(null);
const tempKeyBinding = ref('');

// 按键绑定数据
const keyBindings = reactive({
    leftClick: '',
    rightClick: '',
    middleClick: '',
    wheelUp: '',
    wheelDown: '',
    sideBack: '',
    sideForward: ''
});

// 初始化绑定
onMounted(() => {
    // 加载初始绑定
    if (props.initialBindings) {
        Object.assign(keyBindings, props.initialBindings);
    }

    // 添加键盘事件监听器用于捕获快捷键
    window.addEventListener('keydown', handleKeyDown);

    // 添加全局鼠标事件监听器
    window.addEventListener('mousedown', handleGlobalMouseDown);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('wheel', handleGlobalWheel);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('mousedown', handleGlobalMouseDown);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    window.removeEventListener('wheel', handleGlobalWheel);
});

// 处理全局鼠标按下事件
const handleGlobalMouseDown = (event: MouseEvent) => {
    // 如果正在监听按键，忽略鼠标事件
    if (isListening.value) return;

    // 根据按钮类型处理
    switch (event.button) {
        case 0: // 左键
            isLeftButtonPressed.value = true;
            if (keyBindings.leftClick) {
                activateBinding('leftClick');
            }
            break;
        case 1: // 中键
            isMiddleButtonPressed.value = true;
            if (keyBindings.middleClick) {
                activateBinding('middleClick');
            }
            break;
        case 2: // 右键
            isRightButtonPressed.value = true;
            if (keyBindings.rightClick) {
                activateBinding('rightClick');
            }
            break;
        case 3: // 侧键后退
            isSideButtonBackPressed.value = true;
            if (keyBindings.sideBack) {
                activateBinding('sideBack');
            }
            break;
        case 4: // 侧键前进
            isSideButtonForwardPressed.value = true;
            if (keyBindings.sideForward) {
                activateBinding('sideForward');
            }
            break;
    }
};

// 处理全局鼠标释放事件
const handleGlobalMouseUp = (event: MouseEvent) => {
    switch (event.button) {
        case 0: isLeftButtonPressed.value = false; break;
        case 1: isMiddleButtonPressed.value = false; break;
        case 2: isRightButtonPressed.value = false; break;
        case 3: isSideButtonBackPressed.value = false; break;
        case 4: isSideButtonForwardPressed.value = false; break;
    }
};

// 处理全局滚轮事件
const handleGlobalWheel = (event: WheelEvent) => {
    // 如果正在监听按键，忽略滚轮事件
    if (isListening.value) return;

    if (event.deltaY < 0) {
        // 向上滚动
        isWheelUpPressed.value = true;
        if (keyBindings.wheelUp) {
            activateBinding('wheelUp');
        }
        setTimeout(() => { isWheelUpPressed.value = false }, 200);
    } else {
        // 向下滚动
        isWheelDownPressed.value = true;
        if (keyBindings.wheelDown) {
            activateBinding('wheelDown');
        }
        setTimeout(() => { isWheelDownPressed.value = false }, 200);
    }
};

// 键盘按键处理（用于绑定快捷键）
const handleKeyDown = (event: KeyboardEvent) => {
    if (!isListening.value) return;

    // 处理特殊键
    if (event.key === 'Escape') {
        cancelBinding();
        return;
    }

    // 组合键处理
    let keyBinding = '';
    if (event.ctrlKey) keyBinding += 'Ctrl+';
    if (event.altKey) keyBinding += 'Alt+';
    if (event.shiftKey) keyBinding += 'Shift+';
    if (event.metaKey) keyBinding += 'Meta+';

    // 添加主键
    if (event.key !== 'Control' && event.key !== 'Alt' &&
        event.key !== 'Shift' && event.key !== 'Meta') {
        const displayKey = getDisplayKey(event.key);
        keyBinding += displayKey;

        tempKeyBinding.value = keyBinding;

        // 提交绑定
        if (activeConfigKey.value) {
            keyBindings[activeConfigKey.value as keyof typeof keyBindings] = keyBinding;
            emit('binding-change', {
                button: activeConfigKey.value,
                binding: keyBinding
            });

            // 短暂延迟后结束监听
            setTimeout(() => {
                isListening.value = false;
                activeConfigKey.value = null;
                tempKeyBinding.value = '';
            }, 500);
        }
    }
};

// 处理快捷键绑定
const handleKeyBinding = (buttonKey: string) => {
    if (props.disabled) return;

    if (!showBindingPanel.value) {
        showBindingPanel.value = true;
        setTimeout(() => {
            activeConfigKey.value = buttonKey;
            isListening.value = true;
            tempKeyBinding.value = '';
        }, 100);
    } else {
        // 开始监听键盘输入
        activeConfigKey.value = buttonKey;
        isListening.value = true;
        tempKeyBinding.value = '';
    }
};

// 切换绑定面板显示
const toggleBindingPanel = () => {
    showBindingPanel.value = !showBindingPanel.value;
    if (!showBindingPanel.value) {
        isListening.value = false;
        activeConfigKey.value = null;
        tempKeyBinding.value = '';

        emit('binding-complete', keyBindings);
    }
};

// 取消绑定操作
const cancelBinding = () => {
    isListening.value = false;
    activeConfigKey.value = null;
    tempKeyBinding.value = '';
};

// 清除当前按钮的绑定
const clearBinding = () => {
    if (activeConfigKey.value) {
        keyBindings[activeConfigKey.value as keyof typeof keyBindings] = '';
        emit('binding-change', {
            button: activeConfigKey.value,
            binding: ''
        });

        cancelBinding();
    }
};

// 重置所有绑定
const resetBindings = () => {
    Object.keys(keyBindings).forEach(key => {
        keyBindings[key as keyof typeof keyBindings] = '';
    });

    emit('binding-complete', keyBindings);
};

// 检查按钮是否有绑定
const hasKeyBinding = (buttonKey: string) => {
    return !!keyBindings[buttonKey as keyof typeof keyBindings];
};

// 激活绑定
const activateBinding = (buttonKey: string) => {
    if (showBindingPanel.value) return; // 配置模式下不激活

    emit('key-activated', {
        button: buttonKey,
        binding: keyBindings[buttonKey as keyof typeof keyBindings]
    });
};

// 获取按钮显示名称
const getButtonLabel = (buttonKey: string) => {
    const labels: Record<string, string> = {
        leftClick: '鼠标左键',
        rightClick: '鼠标右键',
        middleClick: '鼠标中键',
        wheelUp: '滚轮向上',
        wheelDown: '滚轮向下',
        sideBack: '侧键1',
        sideForward: '侧键2'
    };

    return labels[buttonKey] || buttonKey;
};

// 获取键盘按键的显示名称
const getDisplayKey = (key: string) => {
    const keyMap: Record<string, string> = {
        ' ': 'Space',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→'
    };

    return keyMap[key] || key;
};

// 暴露方法
defineExpose({
    getBindings: () => keyBindings,
    setBindings: (newBindings: Record<string, string>) => {
        Object.assign(keyBindings, newBindings);
    },
    clearAllBindings: resetBindings,
    showBindingPanel: () => {
        showBindingPanel.value = true;
    },
    hideBindingPanel: () => {
        showBindingPanel.value = false;
    }
});
</script>

<style scoped>
.mouse-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 10px;
    font-family: 'Arial', sans-serif;
}

.mouse-container.disabled {
    opacity: 0.6;
    pointer-events: none;
}

/* 鼠标矢量图形样式 */
.mouse-vector-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
}

.mouse-body {
    position: relative;
    width: 120px;
    height: 200px;
    background-color: #e6f2ff;
    border: 3px solid #4a89dc;
    border-radius: 60px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

/* 鼠标左右按键 */
.mouse-left-button,
.mouse-right-button {
    position: absolute;
    top: 0;
    height: 70px;
    width: 50%;
    background-color: #e6f2ff;
    cursor: pointer;
    transition: background-color 0.2s;
}

.mouse-left-button {
    left: 0;
    border-top-left-radius: 60px;
    border-right: 1px solid #4a89dc;
}

.mouse-right-button {
    right: 0;
    border-top-right-radius: 60px;
    border-left: 1px solid #4a89dc;
}

/* 鼠标滚轮区域 */
.mouse-wheel-container {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 18px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
}

.wheel-up,
.wheel-middle,
.wheel-down {
    width: 18px;
    cursor: pointer;
    border-radius: 10px;
}

.wheel-up,
.wheel-down {
    height: 10px;
}

.wheel-middle {
    height: 20px;
    background-color: #4a89dc;
    border-radius: 5px;
    margin: 2px 0;
}

/* 鼠标线 */
.mouse-cable {
    position: absolute;
    width: 6px;
    height: 60px;
    background-color: #4a89dc;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 3px;
}

/* 侧键区域 */
.side-buttons-container {
    position: absolute;
    left: -10px;
    top: 50px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.side-button {
    width: 10px;
    height: 40px;
    background-color: #4a89dc;
    border-radius: 5px 0 0 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

/* 活动状态样式 */
.mouse-left-button.active,
.mouse-right-button.active {
    background-color: #c6d9f1;
}

.wheel-up.active,
.wheel-down.active {
    background-color: #4a89dc;
}

.wheel-middle.active {
    background-color: #2a69bc;
}

.side-button.active {
    background-color: #2a69bc;
}

/* 已配置样式 */
.configured {
    position: relative;
    border: 2px solid #43b581 !important;
}

/* 绑定显示 */
.button-binding,
.wheel-binding,
.side-binding {
    position: absolute;
    padding: 2px 4px;
    background-color: #ebf5ff;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    color: #2d3748;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 3;
    min-width: 30px;
}

.button-binding {
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
}

.wheel-binding {
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
}

.wheel-up-binding {
    top: 0;
}

.wheel-down-binding {
    bottom: 0;
    top: auto;
}

.side-binding {
    left: 35px;
    top: 50%;
    transform: translateY(-50%);
}

/* 控制面板 */
.control-panel {
    width: 100%;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #4a89dc;
    color: white;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}

.panel-content {
    padding: 15px;
}

/* 绑定表格样式 */
.binding-table {
    width: 100%;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    padding: 8px 0;
    border-bottom: 1px solid #edf2f7;
}

.table-header {
    font-weight: bold;
    color: #4a5568;
}

.col-button,
.col-binding,
.col-action {
    padding: 5px;
}

/* 按钮样式 */
button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.toggle-panel-btn {
    background-color: #3c74c3;
    color: white;
}

.action-btn {
    padding: 5px 8px;
    font-size: 12px;
    background-color: #4a89dc;
    color: white;
}

.set-btn:hover {
    background-color: #3c74c3;
}

.reset-all-btn {
    margin-top: 10px;
    background-color: #e53e3e;
    color: white;
}

.clear-btn {
    background-color: #f56565;
    color: white;
}

.cancel-btn {
    background-color: #a0aec0;
    color: white;
}

/* 快捷键监听覆盖层 */
.key-listener-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.key-listener-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    width: 100%;
}

.current-binding {
    padding: 10px;
    margin: 10px 0;
    background-color: #ebf8ff;
    border-radius: 4px;
    font-weight: bold;
}

.binding-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
}

.binding-prompt {
    text-align: center;
    padding: 10px;
}

.table-footer {
    margin-top: 15px;
    text-align: right;
}

/* 响应式调整 */
@media (max-width: 500px) {
    .mouse-body {
        width: 100px;
        height: 170px;
    }

    .side-buttons-container {
        left: -30px;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1.5fr 1.5fr 1fr;
        font-size: 12px;
    }

    .button-binding,
    .wheel-binding,
    .side-binding {
        font-size: 9px;
    }
}
</style>
