<template>
  <div 
    class="double-input-container" 
    @mouseenter="isHovering = true" 
    @mouseleave="isHovering = false"
    ref="container"
  >
    <!-- X 值输入 -->
    <input 
      ref="inputX"
      type="text" 
      class="value-input x-input" 
      :class="{ 'dragging': isDraggingX }"
      v-model="displayValueX"
      @blur="onBlurX"
      @keydown.enter="onBlurX"
      @mousedown="handleMouseDownX"
      @dblclick="enableEditX"
      :readonly="!isEditingX"
    />
    
    <!-- 分隔符 -->
    <span class="separator">,</span>
    
    <!-- Y 值输入 -->
    <input 
      ref="inputY"
      type="text" 
      class="value-input y-input" 
      :class="{ 'dragging': isDraggingY }"
      v-model="displayValueY"
      @blur="onBlurY"
      @keydown.enter="onBlurY"
      @mousedown="handleMouseDownY"
      @dblclick="enableEditY"
      :readonly="!isEditingY"
    />

    <!-- 锁定比例组件 -->
    <ChainRatio
      :value="localchainRatio"
      @input="localchainRatio = $event"
      @change="onchainRatioChange"
    />

    <!-- 拖动指示器 -->
    <div 
      v-if="(isHovering || isDraggingX || isDraggingY) && !(isEditingX || isEditingY)" 
      class="drag-indicator"
      :class="{ 'dragging': isDraggingX || isDraggingY, 'x-dragging': isDraggingX, 'y-dragging': isDraggingY }"
    >
    </div>
  </div>
</template>

<script>
import ChainRatio from '../ratio/chainRatio.vue';

export default {
  name: 'DoubleInput',
  components: {
    ChainRatio
  },
  props: {
    // 以 [x, y] 数组形式传入的值
    value: {
      type: Array,
      default: () => [0, 0]
    },
    // x 值的最小值
    minX: {
      type: Number,
      default: -Infinity
    },
    // x 值的最大值
    maxX: {
      type: Number,
      default: Infinity
    },
    // y 值的最小值
    minY: {
      type: Number,
      default: -Infinity
    },
    // y 值的最大值
    maxY: {
      type: Number,
      default: Infinity
    },
    // 步长
    step: {
      type: Number,
      default: 1
    },
    // 显示精度
    precision: {
      type: Number,
      default: 1
    },
    // 是否锁定比例（拖动一个值时另一个值同比例变化）
    chainRatio: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      displayValueX: this.formatValue(this.value[0]),
      displayValueY: this.formatValue(this.value[1]),
      currentValueX: parseFloat(this.value[0]) || 0,
      currentValueY: parseFloat(this.value[1]) || 0,
      isHovering: false,
      isDraggingX: false,
      isDraggingY: false,
      isEditingX: false,
      isEditingY: false,
      startX: 0,
      startY: 0,
      // 拖动灵敏度配置
      dragSensitivity: {
        normal: 0.5,
        shift: 2.5,   // 大范围调整
        ctrl: 0.1     // 精细调整
      },
      // 存储锁定比例时的初始比例
      ratioXY: 1,
      // 本地锁定比例状态
      localchainRatio: this.chainRatio
    };
  },
  watch: {
    value: {
      handler(newVal) {
        if (!this.isDraggingX && !this.isDraggingY && !this.isEditingX && !this.isEditingY) {
          this.currentValueX = parseFloat(newVal[0]) || 0;
          this.currentValueY = parseFloat(newVal[1]) || 0;
          this.displayValueX = this.formatValue(newVal[0]);
          this.displayValueY = this.formatValue(newVal[1]);
        }
      },
      deep: true
    },
    chainRatio(newVal) {
      this.localchainRatio = newVal;
    }
  },
  methods: {
    // 格式化值为指定精度的字符串
    formatValue(val) {
      const num = parseFloat(val);
      return isNaN(num) ? '0' : num.toFixed(this.precision);
    },

    // 添加表达式计算功能
    evaluateExpression(expression) {
      try {
        // 清理表达式，只保留数字和基本运算符
        const cleanExpr = expression.toString().replace(/[^0-9+\-*/().]/g, '');
        
        // 检查表达式是否包含运算符
        if (!/[+\-*/]/.test(cleanExpr)) {
          return parseFloat(cleanExpr);
        }
        
        // 使用Function构造函数计算表达式，比eval更安全
        const result = new Function('return ' + cleanExpr)();
        return result;
      } catch (error) {
        // 如果计算失败，返回NaN
        return NaN;
      }
    },

    // 锁定比例变更事件
    onchainRatioChange(isLocked) {
      this.$emit('update:chainRatio', isLocked);
      // 锁定时更新比例
      if (isLocked && this.currentValueY !== 0) {
        this.ratioXY = this.currentValueX / this.currentValueY;
      }
    },

    // X 输入框相关方法
    onBlurX() {
      this.isEditingX = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.displayValueX);
        const numValue = isNaN(expressionValue) ? parseFloat(this.displayValueX) : expressionValue;
        
        if (isNaN(numValue)) {
          this.displayValueX = this.formatValue(this.currentValueX);
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minX), this.maxX);
        this.currentValueX = clampedValue;
        this.displayValueX = this.formatValue(clampedValue);
        
        // 如果锁定比例，同时调整Y值
        if (this.localchainRatio && this.ratioXY !== 0) {
          const newValueY = clampedValue / this.ratioXY;
          const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
          this.currentValueY = clampedValueY;
          this.displayValueY = this.formatValue(clampedValueY);
        }
        
        this.emitValues();
      } catch (error) {
        // 表达式无效，使用原有行为
        const numValue = parseFloat(this.displayValueX);
        
        if (isNaN(numValue)) {
          this.displayValueX = this.formatValue(this.currentValueX);
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minX), this.maxX);
        this.currentValueX = clampedValue;
        this.displayValueX = this.formatValue(clampedValue);
        
        // 如果锁定比例，同时调整Y值
        if (this.localchainRatio && this.ratioXY !== 0) {
          const newValueY = clampedValue / this.ratioXY;
          const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
          this.currentValueY = clampedValueY;
          this.displayValueY = this.formatValue(clampedValueY);
        }
        
        this.emitValues();
      }
    },
    
    enableEditX() {
      this.isEditingX = true;
      this.$nextTick(() => {
        if (this.$refs.inputX) {
          this.$refs.inputX.focus();
          this.$refs.inputX.select();
        }
      });
    },
    
    handleMouseDownX(event) {
      if (event.detail === 2) {
        // 双击事件由dblclick处理
        return;
      }
      
      // 只有在非编辑模式下才启动拖动
      if (!this.isEditingX) {
        event.preventDefault();
        this.startDragX(event);
      }
    },
    
    startDragX(event) {
      this.isDraggingX = true;
      this.startX = event.clientX;
      
      // 如果启用了锁定比例，计算初始比例
      if (this.localchainRatio && this.currentValueY !== 0) {
        this.ratioXY = this.currentValueX / this.currentValueY;
      }
      
      // 记录开始拖动时的值
      const initialValueX = this.currentValueX;
      const initialValueY = this.currentValueY;
      
      const handleMouseMove = (e) => {
        if (!this.isDraggingX) return;
        
        const deltaX = e.clientX - this.startX;
        let sensitivity = this.dragSensitivity.normal;
        
        // 按住shift键大范围调整
        if (e.shiftKey) {
          sensitivity = this.dragSensitivity.shift;
        } 
        // 按住ctrl键精细调整
        else if (e.ctrlKey) {
          sensitivity = this.dragSensitivity.ctrl;
        }
        
        const change = deltaX * sensitivity * this.step;
        const newValueX = initialValueX + change;
        const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
        
        this.currentValueX = clampedValueX;
        this.displayValueX = this.formatValue(clampedValueX);
        
        // 如果锁定比例，调整Y值
        if (this.localchainRatio && this.ratioXY !== 0) {
          const newValueY = clampedValueX / this.ratioXY;
          const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
          this.currentValueY = clampedValueY;
          this.displayValueY = this.formatValue(clampedValueY);
        }
        
        this.$emit('input', [this.currentValueX, this.currentValueY]);
      };
      
      const handleMouseUp = () => {
        this.isDraggingX = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        this.$emit('change', [this.currentValueX, this.currentValueY]);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    
    // Y 输入框相关方法
    onBlurY() {
      this.isEditingY = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.displayValueY);
        const numValue = isNaN(expressionValue) ? parseFloat(this.displayValueY) : expressionValue;
        
        if (isNaN(numValue)) {
          this.displayValueY = this.formatValue(this.currentValueY);
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minY), this.maxY);
        this.currentValueY = clampedValue;
        this.displayValueY = this.formatValue(clampedValue);
        
        // 如果锁定比例，同时调整X值
        if (this.localchainRatio && clampedValue !== 0) {
          const newValueX = this.ratioXY * clampedValue;
          const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
          this.currentValueX = clampedValueX;
          this.displayValueX = this.formatValue(clampedValueX);
        }
        
        this.emitValues();
      } catch (error) {
        // 表达式无效，使用原有行为
        const numValue = parseFloat(this.displayValueY);
        
        if (isNaN(numValue)) {
          this.displayValueY = this.formatValue(this.currentValueY);
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minY), this.maxY);
        this.currentValueY = clampedValue;
        this.displayValueY = this.formatValue(clampedValue);
        
        // 如果锁定比例，同时调整X值
        if (this.localchainRatio && clampedValue !== 0) {
          const newValueX = this.ratioXY * clampedValue;
          const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
          this.currentValueX = clampedValueX;
          this.displayValueX = this.formatValue(clampedValueX);
        }
        
        this.emitValues();
      }
    },
    
    enableEditY() {
      this.isEditingY = true;
      this.$nextTick(() => {
        if (this.$refs.inputY) {
          this.$refs.inputY.focus();
          this.$refs.inputY.select();
        }
      });
    },
    
    handleMouseDownY(event) {
      if (event.detail === 2) {
        // 双击事件由dblclick处理
        return;
      }
      
      // 只有在非编辑模式下才启动拖动
      if (!this.isEditingY) {
        event.preventDefault();
        this.startDragY(event);
      }
    },
    
    startDragY(event) {
      this.isDraggingY = true;
      this.startX = event.clientX;
      
      // 如果启用了锁定比例，计算初始比例
      if (this.localchainRatio && this.currentValueY !== 0) {
        this.ratioXY = this.currentValueX / this.currentValueY;
      }
      
      // 记录开始拖动时的值
      const initialValueY = this.currentValueY;
      const initialValueX = this.currentValueX;
      
      const handleMouseMove = (e) => {
        if (!this.isDraggingY) return;
        
        const deltaX = e.clientX - this.startX;
        let sensitivity = this.dragSensitivity.normal;
        
        // 按住shift键大范围调整
        if (e.shiftKey) {
          sensitivity = this.dragSensitivity.shift;
        } 
        // 按住ctrl键精细调整
        else if (e.ctrlKey) {
          sensitivity = this.dragSensitivity.ctrl;
        }
        
        const change = deltaX * sensitivity * this.step;
        const newValueY = initialValueY + change;
        const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
        
        this.currentValueY = clampedValueY;
        this.displayValueY = this.formatValue(clampedValueY);
        
        // 如果锁定比例，调整X值
        if (this.localchainRatio && this.ratioXY !== 0 && clampedValueY !== 0) {
          const newValueX = this.ratioXY * clampedValueY;
          const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
          this.currentValueX = clampedValueX;
          this.displayValueX = this.formatValue(clampedValueX);
        }
        
        this.$emit('input', [this.currentValueX, this.currentValueY]);
      };
      
      const handleMouseUp = () => {
        this.isDraggingY = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        this.$emit('change', [this.currentValueX, this.currentValueY]);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    
    // 发送更新后的值
    emitValues() {
      this.$emit('input', [this.currentValueX, this.currentValueY]);
      this.$emit('change', [this.currentValueX, this.currentValueY]);
    }
  }
};
</script>

<style scoped>
.double-input-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.value-input {
  width: 30px;
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

.separator {
  font-size: 12px;
  color: #888;
  margin: 0 2px;
  user-select: none;
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
.double-input-container:active {
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

.drag-indicator.x-dragging {
  border-color: #00a8ff;
}

.drag-indicator.y-dragging {
  border-color: #a8ff00;
}
</style>
