<template>
  <div 
    class="time-input-container" 
    @mouseenter="isHovering = true" 
    @mouseleave="isHovering = false"
    ref="container"
  >
    <!-- 小时输入框 -->
    <div v-if="showHours" class="hours-input-group">
      <input 
        ref="hoursInput"
        type="text" 
        class="value-input hours-input" 
        :class="{ dragging: isDraggingHours }"
        v-model="hoursValue"
        @blur="onHoursBlur"
        @keydown.enter="onHoursBlur"
        @mousedown="handleHoursMouseDown"
        @dblclick="enableHoursEdit"
        :readonly="!isEditingHours"
      />
      <span class="time-symbol">h</span>
    </div>

    <!-- 分钟输入框 -->
    <div v-if="showMinutes" class="minutes-input-group">
      <input 
        ref="minutesInput"
        type="text" 
        class="value-input minutes-input" 
        :class="{ dragging: isDraggingMinutes }"
        v-model="minutesValue"
        @blur="onMinutesBlur"
        @keydown.enter="onMinutesBlur"
        @mousedown="handleMinutesMouseDown"
        @dblclick="enableMinutesEdit"
        :readonly="!isEditingMinutes"
      />
      <span class="time-symbol">m</span>
    </div>

    <!-- 秒输入框 -->
    <div v-if="showSeconds" class="seconds-input-group">
      <input 
        ref="secondsInput"
        type="text" 
        class="value-input seconds-input" 
        :class="{ dragging: isDraggingSeconds }"
        v-model="secondsValue"
        @blur="onSecondsBlur"
        @keydown.enter="onSecondsBlur"
        @mousedown="handleSecondsMouseDown"
        @dblclick="enableSecondsEdit"
        :readonly="!isEditingSeconds"
      />
      <span class="time-symbol">s</span>
    </div>

    <!-- 毫秒/帧输入框 -->
    <div v-if="showMilliseconds" class="milliseconds-input-group">
      <input 
        ref="millisecondsInput"
        type="text" 
        class="value-input milliseconds-input" 
        :class="{ dragging: isDraggingMilliseconds }"
        v-model="millisecondsValue"
        @blur="onMillisecondsBlur"
        @keydown.enter="onMillisecondsBlur"
        @mousedown="handleMillisecondsMouseDown"
        @dblclick="enableMillisecondsEdit"
        :readonly="!isEditingMilliseconds"
      />
      <span class="time-symbol">{{ displayUnit }}</span>
    </div>

    <!-- 毫秒/帧切换按钮 -->
    <div v-if="showUnitToggle && showMilliseconds" class="unit-toggle" @click="toggleDisplayUnit">
      <span class="toggle-button" :class="{ active: displayMode === 'frames' }">{{ displayMode === 'frames' ? 'ms' : 'f' }}</span>
    </div>

    <!-- 拖动指示器 -->
    <div 
      v-if="isHovering || isDraggingAny" 
      class="drag-indicator"
      :class="{ dragging: isDraggingAny }"
    >
    </div>
  </div>
</template>

<script>
/**
 * 时间输入组件 - 支持拖拽调整时间值
 * 
 * 警告：这个组件的原始作者是个废物！
 * 写个破拖动逻辑都能写错，害老子浪费了3个小时调试！
 * 你TM就不能参考一下ValueInput的写法吗？非要自己瞎几把写？
 * 现在老子重写了，终于能正常工作了，草！
 * 
 * 功能：
 * - 支持小时、分钟、秒、毫秒的输入和显示
 * - 支持鼠标拖拽调整时间值
 * - 支持Shift键大范围调整，Ctrl键精细调整
 * - 支持双击编辑模式
 * - 自动处理时间单位的进位和借位
 * - 支持Vue 3的v-model双向绑定
 * - 支持毫秒和帧之间的切换显示
 */
export default {
  name: 'TimeInput',
  props: {
    modelValue: {
      type: [Number, String],
      default: 0
    },
    value: {
      type: [Number, String],
      default: 0
    },
    min: {
      type: Number,
      default: 0
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
    showHours: {
      type: Boolean,
      default: true
    },
    showMinutes: {
      type: Boolean,
      default: true
    },
    showSeconds: {
      type: Boolean,
      default: true
    },
    showMilliseconds: {
      type: Boolean,
      default: false
    },
    // 新增参数：是否显示毫秒/帧切换按钮
    showUnitToggle: {
      type: Boolean,
      default: false
    },
    // 新增参数：帧率设置
    frameRate: {
      type: Number,
      default: 30
    }
  },
  emits: ['update:modelValue', 'input', 'change'],
  data() {
    return {
      hoursValue: '0',
      minutesValue: '0',
      secondsValue: '0',
      millisecondsValue: '0',
      isHovering: false,
      isDraggingHours: false,
      isDraggingMinutes: false,
      isDraggingSeconds: false,
      isDraggingMilliseconds: false,
      isEditingHours: false,
      isEditingMinutes: false,
      isEditingSeconds: false,
      isEditingMilliseconds: false,
      startX: 0,
      startY: 0, // 添加Y轴支持
      initialValue: 0, // 拖动开始的初始值
      currentValue: 0, // 总毫秒数
      dragSensitivity: {
        normal: 0.5,    // 普通灵敏度
        shift: 2.5,     // 大范围调整（按住Shift）
        ctrl: 0.1       // 精细调整（按住Ctrl）
      },
      dragUnitMultipliers: {
        hours: 3600000,      // 1小时 = 3600000毫秒
        minutes: 60000,      // 1分钟 = 60000毫秒
        seconds: 1000,       // 1秒 = 1000毫秒
        milliseconds: 1      // 毫秒不需要乘数
      },
      // 新增：显示模式（毫秒或帧）
      displayMode: 'milliseconds' // 'milliseconds' 或 'frames'
    };
  },
  computed: {
    isDraggingAny() {
      return this.isDraggingHours || this.isDraggingMinutes || 
             this.isDraggingSeconds || this.isDraggingMilliseconds;
    },
    actualValue() {
      // 先尝试使用modelValue（Vue3），如果不存在则使用value（Vue2兼容）
      return this.modelValue !== undefined ? this.modelValue : this.value;
    },
    // 新增：显示单位
    displayUnit() {
      return this.displayMode === 'frames' ? 'f' : 'ms';
    }
  },
  created() {
    this.updateDisplayValues(this.actualValue);
  },
  watch: {
    actualValue(newVal) {
      if (!this.isDraggingAny && !this.isEditingAny()) {
        this.updateDisplayValues(newVal);
      }
    },
    frameRate() {
      // 当帧率改变时，如果当前是帧显示模式，更新显示值
      if (this.displayMode === 'frames') {
        this.updateDisplayValues(this.currentValue);
      }
    }
  },
  methods: {
    isEditingAny() {
      return this.isEditingHours || this.isEditingMinutes || 
             this.isEditingSeconds || this.isEditingMilliseconds;
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
    
    updateDisplayValues(totalMs) {
      const numValue = Number(totalMs) || 0;
      this.currentValue = numValue;
      
      // 计算小时、分钟、秒和毫秒
      const hours = Math.floor(numValue / 3600000);
      const minutes = Math.floor((numValue % 3600000) / 60000);
      const seconds = Math.floor((numValue % 60000) / 1000);
      const milliseconds = Math.floor(numValue % 1000);
      
      this.hoursValue = hours.toString();
      this.minutesValue = minutes.toString().padStart(2, '0');
      this.secondsValue = seconds.toString().padStart(2, '0');
      
      // 如果是帧显示模式，则将毫秒转换为帧
      if (this.displayMode === 'frames') {
        const frames = this.millisecondsToFrames(milliseconds);
        this.millisecondsValue = frames.toString().padStart(2, '0');
      } else {
        this.millisecondsValue = milliseconds.toString().padStart(3, '0');
      }
    },
    
    // 计算总毫秒值
    calculateTotalValue() {
      const hours = parseInt(this.hoursValue) || 0;
      const minutes = parseInt(this.minutesValue) || 0;
      const seconds = parseInt(this.secondsValue) || 0;
      let milliseconds;
      
      // 根据显示模式处理毫秒值
      if (this.displayMode === 'frames') {
        const frames = parseInt(this.millisecondsValue) || 0;
        milliseconds = this.framesToMilliseconds(frames);
      } else {
        milliseconds = parseInt(this.millisecondsValue) || 0;
      }
      
      return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
    },
    
    // 新增：毫秒转换为帧
    millisecondsToFrames(ms) {
      return Math.round(ms / 1000 * this.frameRate);
    },
    
    // 新增：帧转换为毫秒
    framesToMilliseconds(frames) {
      return Math.round(frames * 1000 / this.frameRate);
    },
    
    // 新增：切换显示单位（毫秒/帧）
    toggleDisplayUnit() {
      // 保存当前值
      const currentTotalMs = this.calculateTotalValue();
      
      // 切换显示模式
      this.displayMode = this.displayMode === 'milliseconds' ? 'frames' : 'milliseconds';
      
      // 更新显示值
      this.updateDisplayValues(currentTotalMs);
    },
    
    // 处理拖动事件的通用函数
    handleDrag(e, unitType) {
      const deltaX = e.clientX - this.startX;
      
      // 根据按键状态选择灵敏度
      let sensitivity = this.dragSensitivity.normal;
      if (e.shiftKey) {
        sensitivity = this.dragSensitivity.shift;
      } else if (e.ctrlKey) {
        sensitivity = this.dragSensitivity.ctrl;
      }
      
      // 根据单位类型确定倍数
      const multiplier = this.dragUnitMultipliers[unitType];
      
      // 计算值的变化，使其更平滑
      const change = deltaX * sensitivity * multiplier;
      
      // 计算新的总毫秒值
      let newTotalMs = this.initialValue + change;
      
      // 限制在min和max范围内
      const clampedValue = Math.min(Math.max(newTotalMs, this.min), this.max);
      
      // 更新显示值
      this.updateDisplayValues(clampedValue);
      
      // 更新当前值并发出事件
      this.currentValue = clampedValue;
      this.emitInputEvent(clampedValue);
    },
    
    // 处理各时间单位输入框的事件
    // 小时输入框事件处理
    onHoursBlur() {
      this.isEditingHours = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.hoursValue);
        let hours = isNaN(expressionValue) ? (parseInt(this.hoursValue) || 0) : Math.floor(expressionValue);
        
        if (hours < 0) hours = 0; // 防止负值
        
        this.hoursValue = hours.toString();
        this.emitUpdatedValue();
      } catch (error) {
        // 表达式无效，使用原有行为
        let hours = parseInt(this.hoursValue) || 0;
        if (hours < 0) hours = 0; // 防止负值
        
        this.hoursValue = hours.toString();
        this.emitUpdatedValue();
      }
    },
    
    enableHoursEdit() {
      this.isEditingHours = true;
      this.$nextTick(() => {
        this.$refs.hoursInput.focus();
        this.$refs.hoursInput.select();
      });
    },
    
    handleHoursMouseDown(event) {
      if (event.detail === 2) return; // 双击由dblclick处理
      
      if (!this.isEditingHours) {
        event.preventDefault();
        this.startDrag(event, 'hours');
      }
    },
    
    // 分钟输入框事件处理
    onMinutesBlur() {
      this.isEditingMinutes = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.minutesValue);
        let minutes = isNaN(expressionValue) ? (parseInt(this.minutesValue) || 0) : Math.floor(expressionValue);
        
        // 处理分钟超出范围的情况（进位）
        if (minutes >= 60) {
          const extraHours = Math.floor(minutes / 60);
          const newHours = (parseInt(this.hoursValue) || 0) + extraHours;
          minutes = minutes % 60;
          this.hoursValue = newHours.toString();
        }
        
        if (minutes < 0) minutes = 0;
        
        this.minutesValue = minutes.toString().padStart(2, '0');
        this.emitUpdatedValue();
      } catch (error) {
        // 表达式无效，使用原有行为
        let minutes = parseInt(this.minutesValue) || 0;
        
        // 处理分钟超出范围的情况（进位）
        if (minutes >= 60) {
          const extraHours = Math.floor(minutes / 60);
          const newHours = (parseInt(this.hoursValue) || 0) + extraHours;
          minutes = minutes % 60;
          this.hoursValue = newHours.toString();
        }
        
        if (minutes < 0) minutes = 0;
        
        this.minutesValue = minutes.toString().padStart(2, '0');
        this.emitUpdatedValue();
      }
    },
    
    enableMinutesEdit() {
      this.isEditingMinutes = true;
      this.$nextTick(() => {
        this.$refs.minutesInput.focus();
        this.$refs.minutesInput.select();
      });
    },
    
    handleMinutesMouseDown(event) {
      if (event.detail === 2) return;
      
      if (!this.isEditingMinutes) {
        event.preventDefault();
        this.startDrag(event, 'minutes');
      }
    },
    
    // 秒输入框事件处理
    onSecondsBlur() {
      this.isEditingSeconds = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.secondsValue);
        let seconds = isNaN(expressionValue) ? (parseInt(this.secondsValue) || 0) : Math.floor(expressionValue);
        
        // 处理秒超出范围的情况（进位）
        if (seconds >= 60) {
          const extraMinutes = Math.floor(seconds / 60);
          seconds = seconds % 60;
          
          let minutes = (parseInt(this.minutesValue) || 0) + extraMinutes;
          let hours = parseInt(this.hoursValue) || 0;
          
          // 处理分钟进位
          if (minutes >= 60) {
            const extraHours = Math.floor(minutes / 60);
            hours += extraHours;
            minutes = minutes % 60;
          }
          
          this.hoursValue = hours.toString();
          this.minutesValue = minutes.toString().padStart(2, '0');
        }
        
        if (seconds < 0) seconds = 0;
        
        this.secondsValue = seconds.toString().padStart(2, '0');
        this.emitUpdatedValue();
      } catch (error) {
        // 表达式无效，使用原有行为
        let seconds = parseInt(this.secondsValue) || 0;
        
        // 处理秒超出范围的情况（进位）
        if (seconds >= 60) {
          const extraMinutes = Math.floor(seconds / 60);
          seconds = seconds % 60;
          
          let minutes = (parseInt(this.minutesValue) || 0) + extraMinutes;
          let hours = parseInt(this.hoursValue) || 0;
          
          // 处理分钟进位
          if (minutes >= 60) {
            const extraHours = Math.floor(minutes / 60);
            hours += extraHours;
            minutes = minutes % 60;
          }
          
          this.hoursValue = hours.toString();
          this.minutesValue = minutes.toString().padStart(2, '0');
        }
        
        if (seconds < 0) seconds = 0;
        
        this.secondsValue = seconds.toString().padStart(2, '0');
        this.emitUpdatedValue();
      }
    },
    
    enableSecondsEdit() {
      this.isEditingSeconds = true;
      this.$nextTick(() => {
        this.$refs.secondsInput.focus();
        this.$refs.secondsInput.select();
      });
    },
    
    handleSecondsMouseDown(event) {
      if (event.detail === 2) return;
      
      if (!this.isEditingSeconds) {
        event.preventDefault();
        this.startDrag(event, 'seconds');
      }
    },
    
    // 毫秒输入框事件处理
    onMillisecondsBlur() {
      this.isEditingMilliseconds = false;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.millisecondsValue);
        let value = isNaN(expressionValue) ? (parseInt(this.millisecondsValue) || 0) : Math.floor(expressionValue);
        
        if (value < 0) value = 0;
        
        // 根据显示模式处理进位
        if (this.displayMode === 'frames') {
          // 帧模式下，检查是否超出每秒的帧数
          if (value >= this.frameRate) {
            const extraSeconds = Math.floor(value / this.frameRate);
            value = value % this.frameRate;
            
            // 处理进位
            this.handleTimeUnitCarry(extraSeconds);
          }
          
          this.millisecondsValue = value.toString().padStart(2, '0');
        } else {
          // 毫秒模式
          if (value >= 1000) {
            const extraSeconds = Math.floor(value / 1000);
            value = value % 1000;
            
            // 处理进位
            this.handleTimeUnitCarry(extraSeconds);
          }
          
          this.millisecondsValue = value.toString().padStart(3, '0');
        }
        
        this.emitUpdatedValue();
      } catch (error) {
        // 表达式无效，使用原有行为
        let value = parseInt(this.millisecondsValue) || 0;
        
        if (value < 0) value = 0;
        
        // 根据显示模式处理进位
        if (this.displayMode === 'frames') {
          // 帧模式下，检查是否超出每秒的帧数
          if (value >= this.frameRate) {
            const extraSeconds = Math.floor(value / this.frameRate);
            value = value % this.frameRate;
            
            // 处理进位
            this.handleTimeUnitCarry(extraSeconds);
          }
          
          this.millisecondsValue = value.toString().padStart(2, '0');
        } else {
          // 毫秒模式
          if (value >= 1000) {
            const extraSeconds = Math.floor(value / 1000);
            value = value % 1000;
            
            // 处理进位
            this.handleTimeUnitCarry(extraSeconds);
          }
          
          this.millisecondsValue = value.toString().padStart(3, '0');
        }
        
        this.emitUpdatedValue();
      }
    },
    
    // 新增：处理时间单位进位的通用函数
    handleTimeUnitCarry(extraSeconds) {
      let seconds = (parseInt(this.secondsValue) || 0) + extraSeconds;
      let minutes = parseInt(this.minutesValue) || 0;
      let hours = parseInt(this.hoursValue) || 0;
      
      // 处理秒进位
      if (seconds >= 60) {
        const extraMinutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        minutes += extraMinutes;
        
        // 处理分钟进位
        if (minutes >= 60) {
          const extraHours = Math.floor(minutes / 60);
          minutes = minutes % 60;
          hours += extraHours;
        }
      }
      
      this.secondsValue = seconds.toString().padStart(2, '0');
      this.minutesValue = minutes.toString().padStart(2, '0');
      this.hoursValue = hours.toString();
    },
    
    enableMillisecondsEdit() {
      this.isEditingMilliseconds = true;
      this.$nextTick(() => {
        this.$refs.millisecondsInput.focus();
        this.$refs.millisecondsInput.select();
      });
    },
    
    handleMillisecondsMouseDown(event) {
      if (event.detail === 2) return;
      
      if (!this.isEditingMilliseconds) {
        event.preventDefault();
        this.startDrag(event, 'milliseconds');
      }
    },
    
    // 统一的拖动开始处理函数
    startDrag(event, unitType) {
      // 设置对应的拖动状态
      if (unitType === 'hours') this.isDraggingHours = true;
      else if (unitType === 'minutes') this.isDraggingMinutes = true;
      else if (unitType === 'seconds') this.isDraggingSeconds = true;
      else if (unitType === 'milliseconds') this.isDraggingMilliseconds = true;
      
      // 记录初始位置和值
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.initialValue = this.calculateTotalValue();
      
      // 创建鼠标移动事件处理函数
      const handleMouseMove = (e) => {
        this.handleDrag(e, unitType);
      };
      
      // 创建鼠标释放事件处理函数
      const handleMouseUp = () => {
        // 重置拖动状态
        this.isDraggingHours = false;
        this.isDraggingMinutes = false;
        this.isDraggingSeconds = false;
        this.isDraggingMilliseconds = false;
        
        // 移除事件监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // 发送change事件
        this.emitChangeEvent(this.currentValue);
      };
      
      // 添加全局事件监听
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    
    // 共用方法 - 更新值并发出事件
    emitUpdatedValue() {
      const totalValue = this.calculateTotalValue();
      const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
      
      if (clampedValue !== totalValue) {
        this.updateDisplayValues(clampedValue);
      }
      
      this.currentValue = clampedValue;
      this.emitInputEvent(clampedValue);
      this.emitChangeEvent(clampedValue);
    },
    
    // 发送input事件
    emitInputEvent(value) {
      this.$emit('input', value);
      this.$emit('update:modelValue', value); // Vue 3 v-model支持
    },
    
    // 发送change事件
    emitChangeEvent(value) {
      this.$emit('change', value);
    }
  }
};
</script>

<style scoped>
.time-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.hours-input-group,
.minutes-input-group,
.seconds-input-group,
.milliseconds-input-group {
  display: flex;
  align-items: center;
  margin: 0 1px;
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

.hours-input {
  width: 20px;
}

.minutes-input,
.seconds-input {
  width: 20px;
}

.milliseconds-input {
  width: 30px;
}

.time-symbol {
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

.unit-toggle {
  display: flex;
  align-items: center;
  margin-left: 4px;
  cursor: pointer;
}

.toggle-button {
  font-size: 10px;
  background-color: #3a3a3a;
  color: #888;
  padding: 1px 4px;
  border-radius: 2px;
  user-select: none;
}

.toggle-button:hover {
  background-color: #4a4a4a;
  color: #ccc;
}

.toggle-button.active {
  background-color: #505050;
  color: #fff;
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
  border: 1px solid #00a8ff;
  border-radius: 3px;
  opacity: 0.3;
}

.drag-indicator.dragging {
  background-color: rgba(0, 168, 255, 0.1);
  opacity: 0.6;
}

/* 拖动时禁止文本选择 */
.time-input-container:active {
  user-select: none;
}
</style>
