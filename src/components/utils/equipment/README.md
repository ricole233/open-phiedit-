# 设备组件库

这个库包含了两个可交互式设备组件：键盘（Keyboard）和鼠标（Mouse）。这些组件可用于界面演示、教程或输入法开发等场景。

## 键盘组件 (Keyboard.vue)

### 功能特点

- 完整的108键位标准键盘布局
- 视觉按键反馈效果
- 响应真实键盘输入
- 支持显示当前按下的键
- 内置文本输入显示和处理
- 支持模拟按键操作
- 完全响应式布局
- 所有键位均正确映射到标准键盘代码

### 属性 (Props)

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| showCurrentKeys | Boolean | true | 是否显示当前按下的键 |
| showInputDisplay | Boolean | true | 是否显示输入内容区域 |
| initialInput | String | '' | 初始输入内容 |
| disabled | Boolean | false | 是否禁用键盘功能 |
| keyboardLayout | String | 'standard' | 键盘布局类型（目前支持'standard'） |

### 事件 (Events)

| 事件名 | 参数 | 描述 |
|--------|------|------|
| keydown | event: {code, key, target} | 键盘按键按下时触发 |
| keyup | event: {code, key, target} | 键盘按键释放时触发 |
| keypress | event: {code, key, target} | 键盘按键点击时触发 |
| input-change | text: String | 输入内容变化时触发 |

### 方法 (Methods)

| 方法名 | 参数 | 描述 |
|--------|------|------|
| focus | - | 模拟键盘聚焦 |
| clearInput | - | 清除当前输入内容 |
| setInput | text: String | 设置当前输入内容 |
| getActiveKeys | - | 获取当前按下的键列表 |
| simulateKeyPress | keyCode: String | 模拟按下指定键位 |

### 使用示例

```vue
<template>
  <div>
    <Keyboard
      ref="keyboardRef"
      :show-current-keys="true"
      :show-input-display="true"
      :initial-input="keyboardInput"
      @input-change="handleInputChange"
    />
    <button @click="simulateKeyPress">模拟按键A</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Keyboard from './components/utils/equipment/Keyboard.vue';

const keyboardRef = ref(null);
const keyboardInput = ref('初始文本');

const handleInputChange = (text) => {
  console.log('输入内容变化:', text);
  keyboardInput.value = text;
};

const simulateKeyPress = () => {
  keyboardRef.value.simulateKeyPress('KeyA');
};
</script>
```

## 鼠标组件 (Mouse.vue)

### 功能特点

- 交互式鼠标视觉效果
- 左键、右键、中键、滚轮和侧键功能
- 响应真实鼠标事件
- 可自定义外观和功能
- 事件日志记录
- 动态显示鼠标状态信息
- 支持模拟鼠标操作
- 支持通过插槽添加自定义内容

### 属性 (Props)

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| disabled | Boolean | false | 是否禁用鼠标功能 |
| showInfo | Boolean | true | 是否显示鼠标信息区域 |
| showActionLog | Boolean | true | 是否显示操作日志 |
| maxLogItems | Number | 10 | 日志最大保存条数 |
| showCable | Boolean | true | 是否显示鼠标线缆 |
| showSideButtons | Boolean | true | 是否显示侧面按钮 |
| mouseType | String | 'gaming' | 鼠标类型（支持'gaming', 'office', 'basic'） |
| sensitivity | Number | 1 | 鼠标灵敏度倍数 |

### 事件 (Events)

| 事件名 | 参数 | 描述 |
|--------|------|------|
| left-click | {position, target} | 左键点击时触发 |
| right-click | {position, target} | 右键点击时触发 |
| middle-click | {position} | 中键点击时触发 |
| side-button-back | - | 侧键后退按钮点击时触发 |
| side-button-forward | - | 侧键前进按钮点击时触发 |
| mouse-move | {position, movement} | 鼠标移动时触发 |
| mouse-wheel | {delta, direction} | 鼠标滚轮滚动时触发 |
| action | type, data | 任何鼠标操作时触发，带有类型和数据 |

### 方法 (Methods)

| 方法名 | 参数 | 描述 |
|--------|------|------|
| simulateLeftClick | - | 模拟左键点击 |
| simulateRightClick | - | 模拟右键点击 |
| simulateWheelScroll | delta: Number | 模拟滚轮滚动 |
| clearLog | - | 清除操作日志 |
| getPosition | - | 获取当前鼠标位置 |
| getMovement | - | 获取最近一次鼠标移动差值 |

### 插槽 (Slots)

| 插槽名 | 描述 |
|--------|------|
| default | 在鼠标组件下方添加自定义内容 |

### 使用示例

```vue
<template>
  <div>
    <Mouse
      ref="mouseRef"
      :show-info="true"
      :show-action-log="true"
      :max-log-items="8"
      @left-click="handleMouseLeftClick"
    >
      <template #default>
        <div>自定义鼠标内容</div>
      </template>
    </Mouse>
    <button @click="simulateLeftClick">模拟左键点击</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Mouse from './components/utils/equipment/Mouse.vue';

const mouseRef = ref(null);

const handleMouseLeftClick = (event) => {
  console.log('鼠标左键点击:', event.position);
};

const simulateLeftClick = () => {
  mouseRef.value.simulateLeftClick();
};
</script>
```

## 演示文件

可以参考 `src/demos/EquipmentDemo.vue` 中的完整演示，该文件展示了这两个组件的各种功能和属性使用方法。

## 兼容性与注意事项

- 组件设计采用CSS Grid和Flexbox布局，支持现代浏览器
- 组件对移动设备提供了有限的响应式支持
- 键盘和鼠标事件处理基于Web标准事件API
- 如需禁用页面默认的键盘和鼠标行为，可能需要在外层容器添加事件处理函数

## 未来扩展计划

- 添加更多键盘布局选项（紧凑型、笔记本型等）
- 支持自定义键位映射和功能
- 添加更多鼠标类型和外观选项
- 支持触摸设备交互
- 支持国际化键盘布局 