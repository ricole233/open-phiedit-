<template>
  <div 
    class="value-input-container" 
    @mouseenter="isHovering = true" 
    @mouseleave="isHovering = false"
    ref="container"
    :class="{ 'disabled': disabled }"
  >
    <input 
      ref="input"
      type="text" 
      class="value-input" 
      :class="{ 'dragging': isDragging, 'disabled': disabled }"
      v-model="displayValue"
      @blur="onBlur"
      @keydown.enter="onBlur"
      @mousedown="handleMouseDown"
      @dblclick="enableEdit"
      :readonly="!isEditing || disabled"
      :disabled="disabled"
    />
    <div 
      v-if="(isHovering || isDragging) && !disabled" 
      class="drag-indicator"
      :class="{ 'dragging': isDragging }"
    >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from 'vue';

export default defineComponent({
  name: 'ValueInput',
  props: {
    modelValue: {
      type: [Number, String],
      default: 0
    },
    min: {
      type: Number,
      default: -Infinity
    },
    max: {
      type: Number,
      default: Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    precision: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    allowOutOfRange: {
      type: Boolean,
      default: false
    },
    allowedValues: {
      type: Array as () => number[],
      default: undefined
    }
  },
  emits: ['update:modelValue', 'intplus'],
  setup(props, { emit }) {
    // 组件状态
    const displayValue = ref(formatValue(props.modelValue));
    const isHovering = ref(false);
    const isDragging = ref(false);
    const isEditing = ref(false);
    const startX = ref(0);
    const currentValue = ref(Number(props.modelValue));
    const tempValue = ref(0);
    const currentPlus = ref(0);
    const container = ref<HTMLDivElement | null>(null);
    const input = ref<HTMLInputElement | null>(null);

    const dragSensitivity = {
      normal: 0.5,
      shift: 2.0,   // 大范围调整
      ctrl: 0.1     // 精细调整
    };

    // 监听value属性变化
    watch(() => props.modelValue, (newVal) => {
      if (!isDragging.value && !isEditing.value) {
        currentValue.value = Number(newVal);
        displayValue.value = formatValue(newVal);
      }
    });

    // 格式化值为指定精度的字符串
    function formatValue(val: number | string): string {
      const num = parseFloat(String(val));
      return isNaN(num) ? '0' : num.toFixed(props.precision);
    }

    // 处理值的范围，支持循环模式和允许超出范围模式
    function handleValueRange(value: number): number {
      // 如果提供了允许值列表且不为空，则从列表中选择最接近的值
      if (props.allowedValues && props.allowedValues.length > 0) {
        // 如果值恰好在列表中，直接返回
        if (props.allowedValues.includes(value)) {
          return value;
        }
        
        // 否则找到最接近的值
        let closestValue = props.allowedValues[0];
        let minDiff = Math.abs(value - closestValue);
        
        for (const allowedValue of props.allowedValues) {
          const diff = Math.abs(value - allowedValue);
          if (diff < minDiff) {
            closestValue = allowedValue;
            minDiff = diff;
          }
        }
        
        return closestValue;
      }
      
      if (props.allowOutOfRange) {
        // 允许超出范围，直接返回值
        return value;
      }
      
      if (props.loop) {
        // 循环模式
        const range = props.max - props.min;
        const precision = Math.pow(10, -props.precision);
        const adjustedRange = range + precision;
        
        if (value > props.max) {
          // 向上溢出
          const overflow = value - props.max;
          const loops = Math.floor(overflow / adjustedRange);
          const remainder = overflow % adjustedRange;
          return props.min + remainder;
        } else if (value < props.min) {
          // 向下溢出
          const underflow = props.min - value;
          const loops = Math.floor(underflow / adjustedRange);
          const remainder = underflow % adjustedRange;
          return props.max - remainder;
        }
      }
      
      // 默认行为：限制在范围内
      return Math.min(Math.max(value, props.min), props.max);
    }

    // 失焦或回车时提交值
    function onBlur(): void {
      isEditing.value = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = evaluateExpression(displayValue.value);
        const numValue = parseFloat(String(expressionValue));
        
        if (isNaN(numValue)) {
          displayValue.value = formatValue(currentValue.value);
          return;
        }
        
        const processedValue = handleValueRange(numValue);
        currentValue.value = processedValue;
        displayValue.value = formatValue(processedValue);
        emit('update:modelValue', processedValue);
      } catch (error) {
        // 表达式无效，保持原有行为
        const numValue = parseFloat(displayValue.value);
        
        if (isNaN(numValue)) {
          displayValue.value = formatValue(currentValue.value);
          return;
        }
        
        const processedValue = handleValueRange(numValue);
        currentValue.value = processedValue;
        displayValue.value = formatValue(processedValue);
        emit('update:modelValue', processedValue);
      }
    }

    // 安全地计算表达式
    function evaluateExpression(expression: string): number {
      // 清理表达式，只保留数字和基本运算符
      const cleanExpr = expression.replace(/[^0-9+\-*/().]/g, '');
      
      // 检查表达式是否包含运算符
      if (!/[+\-*/]/.test(cleanExpr)) {
        return parseFloat(cleanExpr);
      }
      
      // 使用Function构造函数计算表达式，比eval更安全
      const result = new Function('return ' + cleanExpr)();
      return result;
    }

    // 启用编辑模式
    function enableEdit(): void {
      if (props.disabled) return;
      
      isEditing.value = true;
      nextTick(() => {
        if (input.value) {
          input.value.focus();
          input.value.select();
        }
      });
    }

    // 处理鼠标按下事件
    function handleMouseDown(event: MouseEvent): void {
      if (props.disabled) return;
      
      if (event.detail === 2) {
        // 双击事件由dblclick处理
        return;
      }
      
      // 只有在非编辑模式下才启动拖动
      if (!isEditing.value) {
        event.preventDefault();
        startDrag(event);
      }
    }

    // 开始拖拽调整值
    function startDrag(event: MouseEvent): void {
      if (props.disabled) return;
      
      isDragging.value = true;
      startX.value = event.clientX;
      
      // 记录开始拖动时的值
      const initialValue = currentValue.value;
      // 重置整数进位计数器
      tempValue.value = 0;
      currentPlus.value = 0;
      
      // 跟踪原始累积变化（不受循环限制影响）
      let rawAccumulatedChange = 0;
      let previousDeltaX = 0;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.value) return;
        
        const deltaX = e.clientX - startX.value;
        const deltaDiff = deltaX - previousDeltaX;
        previousDeltaX = deltaX;
        
        let sensitivity = dragSensitivity.normal;
        
        // 按住shift键大范围调整
        if (e.shiftKey) {
          sensitivity = dragSensitivity.shift;
        } 
        // 按住ctrl键精细调整
        else if (e.ctrlKey) {
          sensitivity = dragSensitivity.ctrl;
        }
        
        const changeIncrement = deltaDiff * sensitivity * props.step;
        rawAccumulatedChange += changeIncrement;
        
        const newValue = initialValue + deltaX * sensitivity * props.step;
        const processedValue = handleValueRange(newValue);
        
        // 计算整数进位 (循环模式)
        if (props.loop) {
          const range = props.max - props.min + Math.pow(10, -props.precision);
          
          // 直接从累积变化量计算经过的循环数
          const absChange = Math.abs(rawAccumulatedChange);
          const cycles = Math.floor(absChange / range);
          
          // 计算有向循环次数
          const directedCycles = cycles * (rawAccumulatedChange >= 0 ? 1 : -1);
          
          // 只在循环次数变化时触发事件
          if (directedCycles !== currentPlus.value) {
            const increment = directedCycles - currentPlus.value;
            
            // 只发送实际变化的部分
            if (increment !== 0) {
              emit('intplus', { plus: increment });
              // console.log('intplus', { 
              //   plus: increment, 
              //   accumulated: rawAccumulatedChange, 
              //   range,
              //   cycles: directedCycles
              // });
            }
            
            currentPlus.value = directedCycles;
          }
        }
        
        currentValue.value = processedValue;
        displayValue.value = formatValue(processedValue);
        emit('update:modelValue', processedValue);
      };
      
      const handleMouseUp = () => {
        isDragging.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // 拖拽结束后，将值对齐到最接近的步长
        const step = props.step;
        if (step > 0) {
          const precision = 10; // 用于处理浮点数精度问题
          const snappedValue = Math.round(Math.round(currentValue.value / step) * step * Math.pow(10, precision)) / Math.pow(10, precision);  
          const processedValue = handleValueRange(snappedValue); 
          currentValue.value = processedValue;
          displayValue.value = formatValue(processedValue);
        }
        
        // 如果有允许值列表，确保值在列表中
        if (props.allowedValues && props.allowedValues.length > 0) {
          currentValue.value = handleValueRange(currentValue.value);
          displayValue.value = formatValue(currentValue.value);
        }
        
        emit('update:modelValue', currentValue.value);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return {
      displayValue,
      isHovering,
      isDragging,
      isEditing,
      container,
      input,
      onBlur,
      enableEdit,
      handleMouseDown
    };
  }
});
</script>

<style scoped>
.value-input-container {
  position: relative;
  display: inline-block;
}

.value-input-container.disabled {
  opacity: 0.7;
}

.value-input {
  width: 40px;
  height: 20px;
  background-color: #2c2c2c;
  border: none;
  font-size: 12px;
  text-align: center;
  padding: 0;
  margin: 0;
  color: #ccc;
  outline: none;
  cursor: ew-resize; /* 默认显示双向箭头 */
}

.value-input.disabled {
  cursor: not-allowed;
  background-color: #252525;
  color: #666;
}

.value-input:focus {
  background-color: #3a3a3a;
  color: #fff;
  cursor: text; /* 编辑时显示文本光标 */
}

.value-input.dragging {
  cursor: ew-resize;
  user-select: none;
}

/* 拖动时禁止文本选择 */
.value-input-container:active {
  user-select: none;
}

.drag-indicator {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 1px solid #00a8ff;
  border-radius: 3px;
  pointer-events: none;
  opacity: 0.5;
}

.drag-indicator.dragging {
  background-color: rgba(0, 168, 255, 0.1);
  opacity: 1;
}
</style>
