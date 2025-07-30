<template>
  <div 
    ref="keyboardContainer" 
    class="keyboard-container" 
    :style="containerStyle"
  >
    <div 
      class="keyboard" 
      :style="keyboardStyle"
    >
      <!-- 功能键区域 -->
      <div class="function-keys-area">
        <div class="keyboard-row function-keys">
          <div 
            v-for="key in functionKeys" 
            :key="key.code" 
            :class="[
              'key', 
              { 
                'active': activeKeys.includes(key.code),
                'key-purple': highlightedKeys[key.code] === 'purple',
                'key-green': highlightedKeys[key.code] === 'green'
              }
            ]"
            :data-key="key.code"
            @click="handleKeyClick(key)"
          >
            <span class="key-text">{{ key.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="main-layout">
        <!-- 主键区 -->
        <div class="main-keyboard">
          <div v-for="(row, index) in mainKeys" :key="index" class="keyboard-row">
            <div 
              v-for="key in row" 
              :key="key.code" 
              :class="[
                'key', 
                { 
                  'key-wide': key.width > 1,
                  'key-space': key.code === 'Space',
                  'active': activeKeys.includes(key.code),
                  'key-purple': highlightedKeys[key.code] === 'purple',
                  'key-green': highlightedKeys[key.code] === 'green'
                }
              ]"
              :style="{ width: key.width ? `${key.width * 50}px` : '50px' }"
              :data-key="key.code"
              @click="handleKeyClick(key)"
            >
              <template v-if="key.icon">
                <span class="key-icon">{{ key.icon }}</span>
              </template>
              <template v-else-if="key.primaryLabel && key.secondaryLabel">
                <span class="key-secondary">{{ key.secondaryLabel }}</span>
                <span class="key-primary">{{ key.primaryLabel }}</span>
              </template>
              <template v-else>
                <span class="key-text">{{ key.label }}</span>
              </template>
            </div>
          </div>
        </div>
        
        <!-- 中间控制键区 -->
        <div class="control-keys">
          <div class="keyboard-row">
            <div 
              v-for="key in navigationTopKeys" 
              :key="key.code" 
              :class="[
                'key', 
                'control-key', 
                { 
                  'active': activeKeys.includes(key.code),
                  'key-purple': highlightedKeys[key.code] === 'purple',
                  'key-green': highlightedKeys[key.code] === 'green'
                }
              ]"
              :data-key="key.code"
              @click="handleKeyClick(key)"
            >
              <span class="key-text">{{ key.label }}</span>
            </div>
          </div>
          <div class="keyboard-row">
            <div 
              v-for="key in navigationMiddleKeys" 
              :key="key.code" 
              :class="[
                'key', 
                'control-key', 
                { 
                  'active': activeKeys.includes(key.code),
                  'key-purple': highlightedKeys[key.code] === 'purple',
                  'key-green': highlightedKeys[key.code] === 'green'
                }
              ]"
              :data-key="key.code"
              @click="handleKeyClick(key)"
            >
              <span class="key-text">{{ key.label }}</span>
            </div>
          </div>
          
          <!-- 方向键区域 -->
          <div class="arrow-keys">
            <div class="keyboard-row">
              <div class="key arrow-key" style="visibility: hidden">
                <span class="key-text"></span>
              </div>
            </div>
            <div class="top-arrow">
              <div 
                class="key arrow-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('ArrowUp'),
                    'key-purple': highlightedKeys['ArrowUp'] === 'purple',
                    'key-green': highlightedKeys['ArrowUp'] === 'green'
                  }
                ]"
                data-key="ArrowUp"
                @click="handleKeyClick({ code: 'ArrowUp', label: '↑' })"
              >
                <span class="key-text">↑</span>
              </div>
            </div>
            <div class="bottom-arrows">
              <div 
                class="key arrow-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('ArrowLeft'),
                    'key-purple': highlightedKeys['ArrowLeft'] === 'purple',
                    'key-green': highlightedKeys['ArrowLeft'] === 'green'
                  }
                ]"
                data-key="ArrowLeft"
                @click="handleKeyClick({ code: 'ArrowLeft', label: '←' })"
              >
                <span class="key-text">←</span>
              </div>
              <div 
                class="key arrow-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('ArrowDown'),
                    'key-purple': highlightedKeys['ArrowDown'] === 'purple',
                    'key-green': highlightedKeys['ArrowDown'] === 'green'
                  }
                ]"
                data-key="ArrowDown"
                @click="handleKeyClick({ code: 'ArrowDown', label: '↓' })"
              >
                <span class="key-text">↓</span>
              </div>
              <div 
                class="key arrow-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('ArrowRight'),
                    'key-purple': highlightedKeys['ArrowRight'] === 'purple',
                    'key-green': highlightedKeys['ArrowRight'] === 'green'
                  }
                ]"
                data-key="ArrowRight"
                @click="handleKeyClick({ code: 'ArrowRight', label: '→' })"
              >
                <span class="key-text">→</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 数字小键盘区域 -->
        <div class="numpad">
          <div class="numpad-top">
            <div class="keyboard-row">
              <div 
                class="key numpad-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('NumLock'),
                    'key-purple': highlightedKeys['NumLock'] === 'purple',
                    'key-green': highlightedKeys['NumLock'] === 'green'
                  }
                ]"
                data-key="NumLock"
                @click="handleKeyClick({ code: 'NumLock', label: 'Num' })"
              >
                <span class="key-text">Num</span>
              </div>
              <div 
                class="key numpad-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('NumpadDivide'),
                    'key-purple': highlightedKeys['NumpadDivide'] === 'purple',
                    'key-green': highlightedKeys['NumpadDivide'] === 'green'
                  }
                ]"
                data-key="NumpadDivide"
                @click="handleKeyClick({ code: 'NumpadDivide', label: '/' })"
              >
                <span class="key-text">/</span>
              </div>
              <div 
                class="key numpad-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('NumpadMultiply'),
                    'key-purple': highlightedKeys['NumpadMultiply'] === 'purple',
                    'key-green': highlightedKeys['NumpadMultiply'] === 'green'
                  }
                ]"
                data-key="NumpadMultiply"
                @click="handleKeyClick({ code: 'NumpadMultiply', label: '*' })"
              >
                <span class="key-text">*</span>
              </div>
              <div 
                class="key numpad-key" 
                :class="[
                  { 
                    'active': activeKeys.includes('NumpadSubtract'),
                    'key-purple': highlightedKeys['NumpadSubtract'] === 'purple',
                    'key-green': highlightedKeys['NumpadSubtract'] === 'green'
                  }
                ]"
                data-key="NumpadSubtract"
                @click="handleKeyClick({ code: 'NumpadSubtract', label: '-' })"
              >
                <span class="key-text">-</span>
              </div>
            </div>
          </div>
          
          <div class="numpad-grid">
            <div class="numpad-grid-left">
              <!-- 数字键盘7-9 -->
              <div class="keyboard-row">
                <div 
                  v-for="key in ['7', '8', '9']" 
                  :key="`Numpad${key}`" 
                  class="key numpad-key"
                  :class="[
                    { 
                      'active': activeKeys.includes(`Numpad${key}`),
                      'key-purple': highlightedKeys[`Numpad${key}`] === 'purple',
                      'key-green': highlightedKeys[`Numpad${key}`] === 'green'
                    }
                  ]"
                  :data-key="`Numpad${key}`"
                  @click="handleKeyClick({ code: `Numpad${key}`, label: key })"
                >
                  <span class="key-text">{{ key }}</span>
                </div>
              </div>
              
              <!-- 数字键盘4-6 -->
              <div class="keyboard-row">
                <div 
                  v-for="key in ['4', '5', '6']" 
                  :key="`Numpad${key}`" 
                  class="key numpad-key"
                  :class="[
                    { 
                      'active': activeKeys.includes(`Numpad${key}`),
                      'key-purple': highlightedKeys[`Numpad${key}`] === 'purple',
                      'key-green': highlightedKeys[`Numpad${key}`] === 'green'
                    }
                  ]"
                  :data-key="`Numpad${key}`"
                  @click="handleKeyClick({ code: `Numpad${key}`, label: key })"
                >
                  <span class="key-text">{{ key }}</span>
                </div>
              </div>
              
              <!-- 数字键盘1-3 -->
              <div class="keyboard-row">
                <div 
                  v-for="key in ['1', '2', '3']" 
                  :key="`Numpad${key}`" 
                  class="key numpad-key"
                  :class="[
                    { 
                      'active': activeKeys.includes(`Numpad${key}`),
                      'key-purple': highlightedKeys[`Numpad${key}`] === 'purple',
                      'key-green': highlightedKeys[`Numpad${key}`] === 'green'
                    }
                  ]"
                  :data-key="`Numpad${key}`"
                  @click="handleKeyClick({ code: `Numpad${key}`, label: key })"
                >
                  <span class="key-text">{{ key }}</span>
                </div>
              </div>
              
              <!-- 数字键盘0和小数点 -->
              <div class="keyboard-row">
                <div 
                  class="key numpad-key numpad-zero" 
                  :class="[
                    { 
                      'active': activeKeys.includes('Numpad0'),
                      'key-purple': highlightedKeys['Numpad0'] === 'purple',
                      'key-green': highlightedKeys['Numpad0'] === 'green'
                    }
                  ]"
                  data-key="Numpad0"
                  @click="handleKeyClick({ code: 'Numpad0', label: '0' })"
                >
                  <span class="key-text">0</span>
                </div>
                <div 
                  class="key numpad-key" 
                  :class="[
                    { 
                      'active': activeKeys.includes('NumpadDecimal'),
                      'key-purple': highlightedKeys['NumpadDecimal'] === 'purple',
                      'key-green': highlightedKeys['NumpadDecimal'] === 'green'
                    }
                  ]"
                  data-key="NumpadDecimal"
                  @click="handleKeyClick({ code: 'NumpadDecimal', label: '.' })"
                >
                  <span class="key-text">.</span>
                </div>
              </div>
            </div>
            
            <div class="numpad-grid-right">
              <!-- 加号键 -->
              <div 
                class="key numpad-plus" 
                :class="[
                  { 
                    'active': activeKeys.includes('NumpadAdd'),
                    'key-purple': highlightedKeys['NumpadAdd'] === 'purple',
                    'key-green': highlightedKeys['NumpadAdd'] === 'green'
                  }
                ]"
                data-key="NumpadAdd"
                @click="handleKeyClick({ code: 'NumpadAdd', label: '+' })"
              >
                <span class="key-text">+</span>
              </div>
              
              <!-- Enter键 -->
              <div 
                class="key numpad-enter" 
                :class="[
                  { 
                    'active': activeKeys.includes('NumpadEnter'),
                    'key-purple': highlightedKeys['NumpadEnter'] === 'purple',
                    'key-green': highlightedKeys['NumpadEnter'] === 'green'
                  }
                ]"
                data-key="NumpadEnter"
                @click="handleKeyClick({ code: 'NumpadEnter', label: 'Enter' })"
              >
                <span class="key-text">Enter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可以显示当前按下的键 -->
    <!-- <div v-if="showCurrentKeys" class="current-keys">
      当前按下的键: {{ activeKeys.length > 0 ? activeKeys.join(' + ') : '' }}
    </div> -->
    
    <!-- 显示输入内容 -->
    <!-- <div v-if="showInputDisplay" class="input-display">
      <div class="input-content">{{ inputContent }}</div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// 定义组件接受的属性
const props = defineProps({
  showCurrentKeys: {
    type: Boolean,
    default: true
  },
  showInputDisplay: {
    type: Boolean,
    default: true
  },
  initialInput: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  keyboardLayout: {
    type: String,
    default: 'standard' // 可以是 'standard', 'compact', 'custom' 等
  },
  highlightedKeys: {
    type: Object as () => Record<string, string>,
    default: () => ({})
  },
  // 新增: 缩放系数，控制键盘大小
  scale: {
    type: Number,
    default: 1
  },
  // 新增: 最小缩放系数
  minScale: {
    type: Number,
    default: 0.5
  },
  // 新增: 是否自动缩放以适应容器宽度
  autoScale: {
    type: Boolean,
    default: true
  }
});

// 键盘容器ref，用于获取容器宽度
const keyboardContainer = ref<HTMLElement | null>(null);
// 当前使用的缩放系数
const currentScale = ref(props.scale);

// 计算基于容器宽度的缩放系数
const calculateScale = () => {
  if (!props.autoScale || !keyboardContainer.value) return;
  
  // 获取容器宽度
  const containerWidth = keyboardContainer.value.clientWidth;
  // 标准键盘宽度约1280px
  const baseKeyboardWidth = 1280;
  // 计算缩放系数
  let newScale = containerWidth / baseKeyboardWidth;
  
  // 限制最小缩放系数
  newScale = Math.max(newScale, props.minScale);
  // 限制最大缩放系数为1
  newScale = Math.min(newScale, 1);
  
  currentScale.value = newScale;
};

// 计算键盘样式，应用缩放
const keyboardStyle = computed(() => {
  return {
    '--scale-factor': currentScale.value,
    transform: `scale(${currentScale.value})`,
    transformOrigin: 'top left',
    width: `${100 / currentScale.value}%`, // 确保缩放后内容不会被裁剪
  };
});

// 定义键盘容器样式，控制包裹缩放后的键盘
const containerStyle = computed(() => {
  if (!props.autoScale) return {};
  
  return {
    height: `${360 * currentScale.value}px`, // 根据键盘高度和缩放比例计算容器高度
    overflow: 'hidden'
  };
});

// 监听窗口大小变化，重新计算缩放系数
const handleResize = () => {
  calculateScale();
};

// 定义事件
const emit = defineEmits(['keydown', 'keyup', 'keypress', 'input-change']);

// 数据定义
const activeKeys = ref<string[]>([]);
const inputContent = ref(props.initialInput);

// 键盘布局定义
// 功能键区 F1-F12
const functionKeys = [
  { code: 'Escape', label: 'Esc' },
  { code: 'F1', label: 'F1' },
  { code: 'F2', label: 'F2' },
  { code: 'F3', label: 'F3' },
  { code: 'F4', label: 'F4' },
  { code: 'F5', label: 'F5' },
  { code: 'F6', label: 'F6' },
  { code: 'F7', label: 'F7' },
  { code: 'F8', label: 'F8' },
  { code: 'F9', label: 'F9' },
  { code: 'F10', label: 'F10' },
  { code: 'F11', label: 'F11' },
  { code: 'F12', label: 'F12' },
  { code: 'PrintScreen', label: 'PrtSc' },
  { code: 'ScrollLock', label: 'ScrLk' },
  { code: 'Pause', label: 'Pause' },
];

// 主键盘布局
const mainKeys = [
  // 第一行 - 数字键
  [
    { code: 'Backquote', primaryLabel: '`', secondaryLabel: '~' },
    { code: 'Digit1', primaryLabel: '1', secondaryLabel: '!' },
    { code: 'Digit2', primaryLabel: '2', secondaryLabel: '@' },
    { code: 'Digit3', primaryLabel: '3', secondaryLabel: '#' },
    { code: 'Digit4', primaryLabel: '4', secondaryLabel: '$' },
    { code: 'Digit5', primaryLabel: '5', secondaryLabel: '%' },
    { code: 'Digit6', primaryLabel: '6', secondaryLabel: '^' },
    { code: 'Digit7', primaryLabel: '7', secondaryLabel: '&' },
    { code: 'Digit8', primaryLabel: '8', secondaryLabel: '*' },
    { code: 'Digit9', primaryLabel: '9', secondaryLabel: '(' },
    { code: 'Digit0', primaryLabel: '0', secondaryLabel: ')' },
    { code: 'Minus', primaryLabel: '-', secondaryLabel: '_' },
    { code: 'Equal', primaryLabel: '=', secondaryLabel: '+' },
    { code: 'Backspace', label: '←', width: 2 },
  ],
  // 第二行
  [
    { code: 'Tab', label: 'Tab', width: 1.5 },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', primaryLabel: '[', secondaryLabel: '{' },
    { code: 'BracketRight', primaryLabel: ']', secondaryLabel: '}' },
    { code: 'Backslash', primaryLabel: '\\', secondaryLabel: '|', width: 1.5 },
  ],
  // 第三行
  [
    { code: 'CapsLock', label: 'Caps Lock', width: 1.75 },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', primaryLabel: ';', secondaryLabel: ':' },
    { code: 'Quote', primaryLabel: "'", secondaryLabel: '"' },
    { code: 'Enter', label: 'Enter', width: 2.25 },
  ],
  // 第四行
  [
    { code: 'ShiftLeft', label: 'Shift', width: 2.25 },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', primaryLabel: ',', secondaryLabel: '<' },
    { code: 'Period', primaryLabel: '.', secondaryLabel: '>' },
    { code: 'Slash', primaryLabel: '/', secondaryLabel: '?' },
    { code: 'ShiftRight', label: 'Shift', width: 2.75 },
  ],
  // 第五行
  [
    { code: 'ControlLeft', label: 'Ctrl', width: 1.25 },
    { code: 'MetaLeft', label: 'Win', width: 1.25 },
    { code: 'AltLeft', label: 'Alt', width: 1.25 },
    { code: 'Space', label: ' ', width: 6.25 },
    { code: 'AltRight', label: 'Alt', width: 1.25 },
    { code: 'MetaRight', label: 'Win', width: 1.25 },
    { code: 'ContextMenu', label: '☰', width: 1.25 },
    { code: 'ControlRight', label: 'Ctrl', width: 1.25 },
  ]
];

// 导航键顶部
const navigationTopKeys = [
  { code: 'Insert', label: 'Ins' },
  { code: 'Home', label: 'Home' },
  { code: 'PageUp', label: 'PgUp' },
];

// 导航键中部
const navigationMiddleKeys = [
  { code: 'Delete', label: 'Del' },
  { code: 'End', label: 'End' },
  { code: 'PageDown', label: 'PgDn' },
];

// 键盘事件处理
const handleKeyClick = (key: any) => {
  if (props.disabled) return;
  
  // 模拟键盘事件
  const keyEvent = {
    code: key.code,
    key: key.label || key.primaryLabel,
    target: { value: inputContent.value }
  };
  
  // 暂时添加到活动键中，模拟按下效果
  if (!activeKeys.value.includes(key.code)) {
    activeKeys.value.push(key.code);
    
    // 设置定时器以移除按键，模拟释放效果
    setTimeout(() => {
      activeKeys.value = activeKeys.value.filter(k => k !== key.code);
    }, 150);
  }
  
  emit('keypress', keyEvent);
  
  // 处理输入
  handleInput(key);
};

// 处理输入逻辑
const handleInput = (key: any) => {
  if (props.disabled) return;
  
  if (!props.showInputDisplay) return;
  
  let newInput = inputContent.value;
  
  // 基于按键代码处理输入
  switch (key.code) {
    case 'Backspace':
      newInput = newInput.slice(0, -1);
      break;
    case 'Enter':
    case 'NumpadEnter':
      newInput += '\n';
      break;
    case 'Space':
      newInput += ' ';
      break;
    case 'Tab':
      newInput += '\t';
      break;
    default:
      // 处理字符键
      if (key.primaryLabel && key.primaryLabel.length === 1) {
        // 检查是否按下了Shift键
        const isShiftPressed = activeKeys.value.includes('ShiftLeft') || activeKeys.value.includes('ShiftRight');
        newInput += isShiftPressed ? key.secondaryLabel || key.primaryLabel : key.primaryLabel;
      } else if (key.label && key.label.length === 1) {
        newInput += key.label;
      }
      break;
  }
  
  inputContent.value = newInput;
  emit('input-change', newInput);
};

// 处理物理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  // 阻止默认行为，防止浏览器响应键盘操作
  event.preventDefault(); 
  
  // 只有当键不在活动键列表中时才处理
  if (!activeKeys.value.includes(event.code)) {
    activeKeys.value.push(event.code);
    
    // 触发事件
    emit('keydown', {
      code: event.code,
      key: event.key,
      target: { value: inputContent.value }
    });
    
    // 找出按下的键
    const keyMap = getAllKeys();
    const pressedKey = keyMap.find(k => k.code === event.code);
    
    if (pressedKey) {
      // 使用防抖动处理输入，避免重复处理
      handleInput(pressedKey);
    }
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (props.disabled) return;
  
  event.preventDefault(); // 阻止默认行为
  
  activeKeys.value = activeKeys.value.filter(k => k !== event.code);
  
  // 触发事件
  emit('keyup', {
    code: event.code,
    key: event.key,
    target: { value: inputContent.value }
  });
};

// 辅助函数：获取所有键
const getAllKeys = () => {
  return [
    ...functionKeys,
    ...mainKeys.flat(),
    ...navigationTopKeys,
    ...navigationMiddleKeys,
    { code: 'ArrowUp', label: '↑' },
    { code: 'ArrowDown', label: '↓' },
    { code: 'ArrowLeft', label: '←' },
    { code: 'ArrowRight', label: '→' },
    { code: 'NumLock', label: 'Num' },
    { code: 'NumpadDivide', label: '/' },
    { code: 'NumpadMultiply', label: '*' },
    { code: 'NumpadSubtract', label: '-' },
    { code: 'NumpadAdd', label: '+' },
    { code: 'NumpadEnter', label: 'Enter' },
    { code: 'NumpadDecimal', label: '.' },
    { code: 'Numpad0', label: '0' },
    { code: 'Numpad1', label: '1' },
    { code: 'Numpad2', label: '2' },
    { code: 'Numpad3', label: '3' },
    { code: 'Numpad4', label: '4' },
    { code: 'Numpad5', label: '5' },
    { code: 'Numpad6', label: '6' },
    { code: 'Numpad7', label: '7' },
    { code: 'Numpad8', label: '8' },
    { code: 'Numpad9', label: '9' }
  ];
};

// 监听输入变化
watch(() => props.initialInput, (newVal) => {
  inputContent.value = newVal;
});

// 组件挂载和卸载时的事件监听
onMounted(() => {
  if (!props.disabled) {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  // 初始计算缩放系数
  calculateScale();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
});

// 暴露方法
defineExpose({
  focus: () => {
    // 模拟键盘聚焦
  },
  clearInput: () => {
    inputContent.value = '';
    emit('input-change', '');
  },
  setInput: (text: string) => {
    inputContent.value = text;
    emit('input-change', text);
  },
  getActiveKeys: () => activeKeys.value,
  simulateKeyPress: (keyCode: string) => {
    const keyMap = getAllKeys();
    const key = keyMap.find(k => k.code === keyCode);
    if (key) {
      // 使用防抖动执行，避免重复触发
      setTimeout(() => {
        handleKeyClick(key);
      }, 0);
    }
  }
});
</script>

<style scoped>
.keyboard-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
}

.keyboard {
  display: flex;
  flex-direction: column;
  gap: calc(6px * var(--scale-factor, 1));
  background-color: #1a1a1a;
  padding: calc(8px * var(--scale-factor, 1));
  border-radius: calc(8px * var(--scale-factor, 1));
  box-shadow: 0 0 calc(10px * var(--scale-factor, 1)) rgba(0, 0, 0, 0.3);
}

/* 功能键区 */
.function-keys-area {
  width: 100%;
  margin-bottom: calc(6px * var(--scale-factor, 1));
}

.function-keys {
  display: flex;
  gap: calc(3px * var(--scale-factor, 1));
  justify-content: space-between;
}

.main-layout {
  display: flex;
  gap: calc(8px * var(--scale-factor, 1));
}

/* 主键盘区 */
.main-keyboard {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: calc(3px * var(--scale-factor, 1));
}

/* 控制键和方向键区 */
.control-keys {
  width: calc(160px * var(--scale-factor, 1));
  display: flex;
  flex-direction: column;
  gap: calc(3px * var(--scale-factor, 1));
}

/* 方向键区域 */
.arrow-keys {
  margin-top: calc(6px * var(--scale-factor, 1));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(3px * var(--scale-factor, 1));
}

.top-arrow {
  display: flex;
  justify-content: center;
  width: 100%;
}

.bottom-arrows {
  display: flex;
  gap: calc(3px * var(--scale-factor, 1));
}

.arrow-key {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 数字键盘区 */
.numpad {
  width: calc(210px * var(--scale-factor, 1));
  display: flex;
  flex-direction: column;
  gap: calc(3px * var(--scale-factor, 1));
}

.numpad-top {
  margin-bottom: calc(3px * var(--scale-factor, 1));
}

.numpad-grid {
  display: flex;
}

.numpad-grid-left {
  display: flex;
  flex-direction: column;
  gap: calc(3px * var(--scale-factor, 1));
  flex: 3;
}

.numpad-grid-right {
  display: flex;
  flex-direction: column;
  gap: calc(3px * var(--scale-factor, 1));
  flex: 1;
  margin-left: calc(3px * var(--scale-factor, 1));
}

.numpad-zero {
  width: calc(105px * var(--scale-factor, 1)) !important;
}

.numpad-plus {
  height: calc(105px * var(--scale-factor, 1)) !important ; /* 2键高 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.numpad-enter {
  height: calc(105px * var(--scale-factor, 1)) !important; /* 2键高 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyboard-row {
  display: flex;
  gap: calc(3px * var(--scale-factor, 1));
}

.key {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(50px * var(--scale-factor, 1));
  height: calc(50px * var(--scale-factor, 1));
  background-color: #2d2d2d;
  border-radius: calc(4px * var(--scale-factor, 1));
  margin: calc(1px * var(--scale-factor, 1));
  cursor: pointer;
  user-select: none;
  box-shadow: 0 calc(2px * var(--scale-factor, 1)) 0 #111;
  transition: all 0.1s ease;
  color: #f0f0f0;
}

.key:hover {
  background-color: #3d3d3d;
}

.key.active {
  transform: translateY(calc(2px * var(--scale-factor, 1)));
  box-shadow: 0 0 0 #111;
  background-color: #4d4d4d;
}

/* 添加紫色和绿色高亮样式 */
.key-purple {
  background-color: #805ad5;
  box-shadow: 0 calc(2px * var(--scale-factor, 1)) 0 #553c9a;
}

.key-purple:hover {
  background-color: #9f7aea;
}

.key-purple.active {
  background-color: #6b46c1;
  box-shadow: 0 0 0 #553c9a;
}

.key-green {
  background-color: #38a169;
  box-shadow: 0 calc(2px * var(--scale-factor, 1)) 0 #2f855a;
}

.key-green:hover {
  background-color: #48bb78;
}

.key-green.active {
  background-color: #2f855a;
  box-shadow: 0 0 0 #22543d;
}

.key-space {
  width: calc(312.5px * var(--scale-factor, 1));
}

.key-wide {
  width: calc(50px * var(--width, 1) * var(--scale-factor, 1));
}

.function-key {
  height: calc(40px * var(--scale-factor, 1));
  font-size: calc(12px * var(--scale-factor, 1));
}

.control-key {
  font-size: calc(10px * var(--scale-factor, 1));
}

.numpad-key {
  font-size: calc(10px * var(--scale-factor, 1));
}

.key-text {
  font-size: calc(10px * var(--scale-factor, 1));
}

.key-primary {
  font-size: calc(12px * var(--scale-factor, 1));
}

.key-secondary {
  font-size: calc(8px * var(--scale-factor, 1));
  position: absolute;
  top: calc(5px * var(--scale-factor, 1));
  left: calc(5px * var(--scale-factor, 1));
}

.key-icon {
  font-size: calc(16px * var(--scale-factor, 1));
}

.current-keys {
  margin-top: calc(12px * var(--scale-factor, 1));
  padding: calc(8px * var(--scale-factor, 1));
  background-color: #2d2d2d;
  border-radius: calc(4px * var(--scale-factor, 1));
  font-size: calc(14px * var(--scale-factor, 1));
  color: #f0f0f0;
}

.input-display {
  margin-top: calc(12px * var(--scale-factor, 1));
  padding: calc(8px * var(--scale-factor, 1));
  background-color: #2d2d2d;
  border: calc(1px * var(--scale-factor, 1)) solid #444;
  border-radius: calc(4px * var(--scale-factor, 1));
  min-height: calc(80px * var(--scale-factor, 1));
  max-height: calc(150px * var(--scale-factor, 1));
  overflow-y: auto;
  color: #f0f0f0;
}

.input-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式布局 */
@media (max-width: 1100px) {
  /* 保留媒体查询以处理小屏幕上的布局变化，但内部尺寸应使用缩放因子 */
  .main-layout {
    flex-direction: column;
  }
  
  .control-keys {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .control-keys > div:not(.arrow-keys) {
    flex: 1;
  }
  
  .arrow-keys {
    margin-top: 0;
    width: auto;
  }
  
  .numpad {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .function-keys {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .function-key {
    flex: 0 0 calc(25% - 3px * var(--scale-factor, 1));
  }
  
  .control-keys {
    flex-direction: column;
  }
  
  .key-wide {
    width: auto;
    flex-grow: var(--width, 1);
  }
}
</style>
