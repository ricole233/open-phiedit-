<template>
  <div 
    class="angle-input-container" 
    @mouseenter="isHovering = true" 
    @mouseleave="isHovering = false"
    ref="container"
  >
    <!-- 圈数输入框 -->
    <div v-if="showTurns" class="turns-input-group">
      <input 
        ref="turnsInput"
        type="text" 
        class="value-input turns-input" 
        :class="{ dragging: isDraggingTurns }"
        v-model="turnsValue"
        @blur="onTurnsBlur"
        @keydown.enter="onTurnsBlur"
        @mousedown="handleTurnsMouseDown"
        @dblclick="enableTurnsEdit"
        :readonly="!isEditingTurns"
      />
      <span class="angle-symbol"></span>
    </div>

    <!-- 角度输入框 -->
    <div class="degrees-input-group">
      <span v-if="showTurns" class="angle-symbol"></span>
      <input 
        ref="degreesInput"
        type="text" 
        class="value-input angle-input" 
        :class="{ dragging: isDraggingDegrees }"
        v-model="degreesValue"
        @blur="onDegreesBlur"
        @keydown.enter="onDegreesBlur"
        @mousedown="handleDegreesMouseDown"
        @dblclick="enableDegreesEdit"
        :readonly="!isEditingDegrees"
      />
      <span v-if="showDegreeSymbol" class="angle-symbol degree-symbol">°</span>
    </div>

    <!-- 拖动指示器 -->
    <div 
      v-if="(isHovering || isDraggingTurns || isDraggingDegrees) && !isEditingTurns && !isEditingDegrees" 
      class="drag-indicator"
      :class="{ dragging: isDraggingTurns || isDraggingDegrees }"
    >
    </div>
  </div>
</template>

<script>
export default {
  name: 'AngleInput',
  props: {
    value: {
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
      default: 1
    },
    showDegreeSymbol: {
      type: Boolean,
      default: true
    },
    showTurns: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const initialValue = parseFloat(this.value) || 0;
    const turns = Math.floor(Math.abs(initialValue) / 360) * (initialValue < 0 ? -1 : 1);
    const degrees = initialValue % 360;
    
    return {
      turnsValue: turns.toString(),
      degreesValue: this.formatDegrees(degrees),
      isHovering: false,
      isDraggingTurns: false,
      isDraggingDegrees: false,
      isEditingTurns: false,
      isEditingDegrees: false,
      startX: 0,
      currentValue: initialValue,
      dragSensitivity: {
        normal: 0.5,
        shift: 2.0,   // 大范围调整
        ctrl: 0.1     // 精细调整
      }
    };
  },
  watch: {
    value(newVal) {
      if (!this.isDraggingTurns && !this.isDraggingDegrees && 
          !this.isEditingTurns && !this.isEditingDegrees) {
        this.updateDisplayValues(newVal);
      }
    }
  },
  methods: {
    updateDisplayValues(value) {
      const numValue = parseFloat(value) || 0;
      this.currentValue = numValue;
      
      // 计算圈数和角度
      // 计算完整的圈数（包括正负号）
      let turns, degrees;
      
      if (numValue >= 0) {
        turns = Math.floor(numValue / 360);
        degrees = numValue % 360; // 0~359的余数
      } else {
        // 负数处理，保持度数在-359~0范围
        turns = Math.ceil((numValue / 360)); // 向下取整再减1获得圈数
        degrees = numValue % 360; // 这会得到-359~0的余数
      }
      this.turnsValue = turns.toString();
      this.degreesValue = this.formatDegrees(degrees);
    },
    
    formatDegrees(degrees) {
      return parseFloat(degrees).toFixed(this.precision);
    },
    
    // 计算总角度值
    calculateTotalValue() {
      const turns = parseInt(this.turnsValue) || 0;
      const degrees = parseFloat(this.degreesValue) || 0;
      return (turns * 360) + degrees;
    },
    
    // 安全地计算表达式
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
    
    // 圈数输入框事件处理
    onTurnsBlur() {
      this.isEditingTurns = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.turnsValue);
        const turns = isNaN(expressionValue) ? (parseInt(this.turnsValue) || 0) : Math.floor(expressionValue);
        this.turnsValue = turns.toString();
        
        const totalValue = this.calculateTotalValue();
        const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
        
        this.currentValue = clampedValue;
        this.updateDisplayValues(clampedValue);
        this.$emit('input', clampedValue);
        this.$emit('change', clampedValue);
      } catch (error) {
        // 表达式无效，使用原有行为
        const turns = parseInt(this.turnsValue) || 0;
        this.turnsValue = turns.toString();
        
        const totalValue = this.calculateTotalValue();
        const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
        
        this.currentValue = clampedValue;
        this.updateDisplayValues(clampedValue);
        this.$emit('input', clampedValue);
        this.$emit('change', clampedValue);
      }
    },
    
    enableTurnsEdit() {
      this.isEditingTurns = true;
      this.$nextTick(() => {
        this.$refs.turnsInput.focus();
        this.$refs.turnsInput.select();
      });
    },
    
    handleTurnsMouseDown(event) {
      if (event.detail === 2) {
        // 双击事件由dblclick处理
        return;
      }
      
      // 只有在非编辑模式下才启动拖动
      if (!this.isEditingTurns) {
        event.preventDefault();
        this.startDragTurns(event);
      }
    },
    
    startDragTurns(event) {
      this.isDraggingTurns = true;
      this.startX = event.clientX;
      
      // 记录开始拖动时的值
      const initialTurns = parseInt(this.turnsValue) || 0;
      
      const handleMouseMove = (e) => {
        if (!this.isDraggingTurns) return;
        
        const deltaX = e.clientX - this.startX;
        let sensitivity = this.dragSensitivity.normal;
        
        if (e.shiftKey) {
          sensitivity = this.dragSensitivity.shift;
        } else if (e.ctrlKey) {
          sensitivity = this.dragSensitivity.ctrl;
        }
        
        // 拖动圈数时，变化单位就是整数
        const change = Math.round(deltaX * sensitivity);
        const newTurns = initialTurns + change;
        
        // 计算总角度值，包含度数部分
        const degrees = parseFloat(this.degreesValue) || 0;
        const newTotal = (newTurns * 360) + degrees;
        
        // 边界限制检查
        const clampedValue = Math.min(Math.max(newTotal, this.min), this.max);
        if (clampedValue !== newTotal) {
          // 如果值被限制，重新计算圈数和角度
          this.updateDisplayValues(clampedValue);
        } else {
          // 否则使用计算的圈数
          this.turnsValue = newTurns.toString();
        }
        
        this.currentValue = clampedValue;
        this.$emit('input', clampedValue);
      };
      
      const handleMouseUp = () => {
        this.isDraggingTurns = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        this.$emit('change', this.currentValue);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    
    // 角度输入框事件处理
    onDegreesBlur() {
      this.isEditingDegrees = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.degreesValue);
        let degrees = isNaN(expressionValue) ? (parseFloat(this.degreesValue) || 0) : expressionValue;
        let turns = parseInt(this.turnsValue) || 0;
        
        // 处理角度超出范围时的圈数调整
        if (degrees >= 360) {
          const extraTurns = Math.floor(degrees / 360);
          turns += extraTurns;
          degrees = degrees % 360;
        } else if (degrees < -360) {
          // 处理负数超过一圈的情况
          const extraTurns = Math.floor(Math.abs(degrees) / 360);
          turns -= extraTurns;
          degrees = degrees % 360;
        } else if (degrees < 0 && degrees >= -360) {
          // 保持在-360~0范围，不做转换
          // 负度数在范围内，不调整圈数
        }
        
        this.turnsValue = turns.toString();
        this.degreesValue = this.formatDegrees(degrees);
        
        const totalValue = this.calculateTotalValue();
        const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
        
        this.currentValue = clampedValue;
        this.$emit('input', clampedValue);
        this.$emit('change', clampedValue);
      } catch (error) {
        // 表达式无效，使用原有行为
        let degrees = parseFloat(this.degreesValue) || 0;
        let turns = parseInt(this.turnsValue) || 0;
        
        // 处理角度超出范围时的圈数调整
        if (degrees >= 360) {
          const extraTurns = Math.floor(degrees / 360);
          turns += extraTurns;
          degrees = degrees % 360;
        } else if (degrees < -360) {
          // 处理负数超过一圈的情况
          const extraTurns = Math.floor(Math.abs(degrees) / 360);
          turns -= extraTurns;
          degrees = degrees % 360;
        } else if (degrees < 0 && degrees >= -360) {
          // 保持在-360~0范围，不做转换
        }
        
        this.turnsValue = turns.toString();
        this.degreesValue = this.formatDegrees(degrees);
        
        const totalValue = this.calculateTotalValue();
        const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
        
        this.currentValue = clampedValue;
        this.$emit('input', clampedValue);
        this.$emit('change', clampedValue);
      }
    },
    
    enableDegreesEdit() {
      this.isEditingDegrees = true;
      this.$nextTick(() => {
        this.$refs.degreesInput.focus();
        this.$refs.degreesInput.select();
      });
    },
    
    handleDegreesMouseDown(event) {
      if (event.detail === 2) {
        // 双击事件由dblclick处理
        return;
      }
      
      // 只有在非编辑模式下才启动拖动
      if (!this.isEditingDegrees) {
        event.preventDefault();
        this.startDragDegrees(event);
      }
    },
    
    // 角度拖动
    startDragDegrees(event) {
      this.isDraggingDegrees = true;
      this.startX = event.clientX;
      
      // 记录开始拖动时的值
      const initialDegrees = parseFloat(this.degreesValue) || 0;
      const initialTurns = parseInt(this.turnsValue) || 0;
      const initialTotalDegrees = initialTurns * 360 + initialDegrees;
      
      const handleMouseMove = (e) => {
        if (!this.isDraggingDegrees) return;
        
        const deltaX = e.clientX - this.startX;
        let sensitivity = this.dragSensitivity.normal;
        
        if (e.shiftKey) {
          sensitivity = this.dragSensitivity.shift;
        } else if (e.ctrlKey) {
          sensitivity = this.dragSensitivity.ctrl;
        }
        
        const change = deltaX * sensitivity * this.step;
        // 计算新的总角度值，而不仅仅是度数部分
        const newTotalDegrees = initialTotalDegrees + change;
        
        // 边界限制检查
        const clampedValue = Math.min(Math.max(newTotalDegrees, this.min), this.max);
        
        // 无论是否被限制，都使用边界值更新显示
        this.updateDisplayValues(clampedValue);
        this.currentValue = clampedValue;
        
        this.$emit('input', clampedValue);
      };
      
      const handleMouseUp = () => {
        this.isDraggingDegrees = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        this.$emit('change', this.currentValue);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }
};
</script>

<style scoped>
.angle-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.turns-input-group,
.degrees-input-group {
  display: flex;
  align-items: center;
}

.value-input {
  height: 20px;
  background-color: #2c2c2c;
  border: none;
  font-size: 12px;
  text-align: center;
  padding: 0;
  margin: 0;
  color: #ccc;
  outline: none;
  cursor: ew-resize;
}

.turns-input {
  width: 20px;
}

.angle-input {
  width: 30px;
}

.angle-symbol {
  font-size: 12px;
  color: #888;
  margin: 0 2px;
  user-select: none;
}

.value-input:focus {
  background-color: #3a3a3a;
  color: #fff;
  cursor: text;
}

.value-input.dragging {
  cursor: ew-resize;
  user-select: none;
}

.drag-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0.5;
}

.drag-indicator.dragging {
  opacity: 0.8;
}

.drag-indicator svg {
  width: 12px;
  height: 12px;
}

/* 拖动时禁止文本选择 */
.angle-input-container:active {
  user-select: none;
}
</style>
