// ValueInput.js
class ValueInput {
  constructor(options = {}) {
    // 配置选项
    this.modelValue = options.modelValue || 0;
    this.min = options.min !== undefined ? options.min : -Infinity;
    this.max = options.max !== undefined ? options.max : Infinity;
    this.step = options.step !== undefined ? options.step : 1;
    this.precision = options.precision !== undefined ? options.precision : 0;
    this.disabled = options.disabled !== undefined ? options.disabled : false;
    this.loop = options.loop !== undefined ? options.loop : false;
    this.allowOutOfRange = options.allowOutOfRange !== undefined ? options.allowOutOfRange : false;
    this.allowedValues = options.allowedValues || undefined;
    
    // 内部状态
    this.displayValue = this.formatValue(this.modelValue);
    this.isHovering = false;
    this.isDragging = false;
    this.isEditing = false;
    this.startX = 0;
    this.currentValue = Number(this.modelValue);
    this.tempValue = 0;
    this.currentPlus = 0;
    
    // 灵敏度配置
    this.dragSensitivity = {
      normal: 0.5,
      shift: 2.0,
      ctrl: 0.1
    };
    
    // DOM元素
    this.container = null;
    this.input = null;
    
    // 事件处理函数
    this.onChangeCallback = options.onChange || (() => {});
    this.onUpdateCallback = options.onUpdate || (() => {});
    this.onIntPlusCallback = options.onIntPlus || (() => {});
    
    // 创建DOM
    this.render();
    this.attachEvents();
  }
  
  // 格式化值为指定精度的字符串
  formatValue(val) {
    const num = parseFloat(String(val));
    return isNaN(num) ? '0' : num.toFixed(this.precision);
  }
  
  // 处理值的范围，支持循环模式和允许超出范围模式
  handleValueRange(value) {
    // 如果提供了允许值列表且不为空，则从列表中选择最接近的值
    if (this.allowedValues && this.allowedValues.length > 0) {
      // 如果值恰好在列表中，直接返回
      if (this.allowedValues.includes(value)) {
        return value;
      }
      
      // 否则找到最接近的值
      let closestValue = this.allowedValues[0];
      let minDiff = Math.abs(value - closestValue);
      
      for (const allowedValue of this.allowedValues) {
        const diff = Math.abs(value - allowedValue);
        if (diff < minDiff) {
          closestValue = allowedValue;
          minDiff = diff;
        }
      }
      
      return closestValue;
    }
    
    if (this.allowOutOfRange) {
      // 允许超出范围，直接返回值
      return value;
    }
    
    if (this.loop) {
      // 循环模式
      const range = this.max - this.min;
      const precision = Math.pow(10, -this.precision);
      const adjustedRange = range + precision;
      
      if (value > this.max) {
        // 向上溢出
        const overflow = value - this.max;
        const loops = Math.floor(overflow / adjustedRange);
        const remainder = overflow % adjustedRange;
        return this.min + remainder;
      } else if (value < this.min) {
        // 向下溢出
        const underflow = this.min - value;
        const loops = Math.floor(underflow / adjustedRange);
        const remainder = underflow % adjustedRange;
        return this.max - remainder;
      }
    }
    
    // 默认行为：限制在范围内
    return Math.min(Math.max(value, this.min), this.max);
  }
  
  // 失焦或回车时提交值
  onBlur() {
    this.isEditing = false;
    
    try {
      // 尝试计算表达式
      const expressionValue = this.evaluateExpression(this.displayValue);
      const numValue = parseFloat(String(expressionValue));
      
      if (isNaN(numValue)) {
        this.displayValue = this.formatValue(this.currentValue);
        return;
      }
      
      const processedValue = this.handleValueRange(numValue);
      this.currentValue = processedValue;
      this.displayValue = this.formatValue(processedValue);
      this.input.value = this.displayValue;
      this.onUpdateCallback(processedValue);
    } catch (error) {
      // 表达式无效，保持原有行为
      const numValue = parseFloat(this.displayValue);
      
      if (isNaN(numValue)) {
        this.displayValue = this.formatValue(this.currentValue);
        this.input.value = this.displayValue;
        return;
      }
      
      const processedValue = this.handleValueRange(numValue);
      this.currentValue = processedValue;
      this.displayValue = this.formatValue(processedValue);
      this.input.value = this.displayValue;
      this.onUpdateCallback(processedValue);
    }
  }
  
  // 安全地计算表达式
  evaluateExpression(expression) {
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
  enableEdit() {
    if (this.disabled) return;
    
    this.isEditing = true;
    if (this.input) {
      this.input.removeAttribute('readonly');
      this.input.focus();
      this.input.select();
    }
  }
  
  // 处理鼠标按下事件
  handleMouseDown(event) {
    if (this.disabled) return;
    
    if (event.detail === 2) {
      // 双击事件由dblclick处理
      return;
    }
    
    // 只有在非编辑模式下才启动拖动
    if (!this.isEditing) {
      event.preventDefault();
      this.startDrag(event);
    }
  }
  
  // 开始拖拽调整值
  startDrag(event) {
    if (this.disabled) return;
    
    this.isDragging = true;
    this.startX = event.clientX;
    
    // 记录开始拖动时的值
    const initialValue = this.currentValue;
    // 重置整数进位计数器
    this.tempValue = 0;
    this.currentPlus = 0;
    
    // 跟踪原始累积变化（不受循环限制影响）
    let rawAccumulatedChange = 0;
    let previousDeltaX = 0;
    
    const handleMouseMove = (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.startX;
      const deltaDiff = deltaX - previousDeltaX;
      previousDeltaX = deltaX;
      
      let sensitivity = this.dragSensitivity.normal;
      
      // 按住shift键大范围调整
      if (e.shiftKey) {
        sensitivity = this.dragSensitivity.shift;
      }
      // 按住ctrl键精细调整
      else if (e.ctrlKey) {
        sensitivity = this.dragSensitivity.ctrl;
      }
      
      const changeIncrement = deltaDiff * sensitivity * this.step;
      rawAccumulatedChange += changeIncrement;
      
      const newValue = initialValue + deltaX * sensitivity * this.step;
      const processedValue = this.handleValueRange(newValue);
      
      // 计算整数进位 (循环模式)
      if (this.loop) {
        const range = this.max - this.min + Math.pow(10, -this.precision);
        
        // 直接从累积变化量计算经过的循环数
        const absChange = Math.abs(rawAccumulatedChange);
        const cycles = Math.floor(absChange / range);
        
        // 计算有向循环次数
        const directedCycles = cycles * (rawAccumulatedChange >= 0 ? 1 : -1);
        
        // 只在循环次数变化时触发事件
        if (directedCycles !== this.currentPlus) {
          const increment = directedCycles - this.currentPlus;
          
          // 只发送实际变化的部分
          if (increment !== 0) {
            this.onIntPlusCallback({ plus: increment });
          }
          
          this.currentPlus = directedCycles;
        }
      }
      
      this.currentValue = processedValue;
      this.displayValue = this.formatValue(processedValue);
      this.input.value = this.displayValue;
      this.onUpdateCallback(processedValue);
    };
    
    const handleMouseUp = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // 拖拽结束后，将值对齐到最接近的步长
      const step = this.step;
      if (step > 0) {
        const precision = 10; // 用于处理浮点数精度问题
        const snappedValue = Math.round(Math.round(this.currentValue / step) * step * Math.pow(10, precision)) / Math.pow(10, precision);
        const processedValue = this.handleValueRange(snappedValue);
        this.currentValue = processedValue;
        this.displayValue = this.formatValue(processedValue);
        this.input.value = this.displayValue;
      }
      
      // 如果有允许值列表，确保值在列表中
      if (this.allowedValues && this.allowedValues.length > 0) {
        this.currentValue = this.handleValueRange(this.currentValue);
        this.displayValue = this.formatValue(this.currentValue);
        this.input.value = this.displayValue;
      }
      
      this.onUpdateCallback(this.currentValue);
      this.onChangeCallback(this.currentValue);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // 创建DOM元素
  render() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'value-input-container';
    if (this.disabled) this.container.classList.add('disabled');
    
    // 创建输入框
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'value-input';
    this.input.value = this.displayValue;
    this.input.readOnly = !this.isEditing;
    if (this.disabled) this.input.classList.add('disabled');
    if (this.disabled) this.input.disabled = true;
    
    // 创建拖动指示器
    this.dragIndicator = document.createElement('div');
    this.dragIndicator.className = 'drag-indicator';
    this.dragIndicator.style.display = 'none';
    
    // 添加到容器
    this.container.appendChild(this.input);
    this.container.appendChild(this.dragIndicator);
    
    // 添加样式
    this.addStyles();
  }
  
  // 添加事件监听
  attachEvents() {
    this.container.addEventListener('mouseenter', () => {
      this.isHovering = true;
      if (!this.disabled && (this.isHovering || this.isDragging)) {
        this.dragIndicator.style.display = 'block';
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.isHovering = false;
      if (!this.isDragging) {
        this.dragIndicator.style.display = 'none';
      }
    });
    
    this.input.addEventListener('blur', this.onBlur.bind(this));
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.onBlur();
      }
    });
    
    this.input.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.input.addEventListener('dblclick', this.enableEdit.bind(this));
  }
  
  // 添加组件样式
  addStyles() {
    const styleId = 'value-input-styles';
    
    // 如果已经存在样式，则不再添加
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
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
          cursor: ew-resize;
        }
        
        .value-input.disabled {
          cursor: not-allowed;
          background-color: #252525;
          color: #666;
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
      `;
      document.head.appendChild(style);
    }
  }
  
  // 获取DOM元素
  getElement() {
    return this.container;
  }
  
  // 设置值
  setValue(value) {
    if (this.isDragging || this.isEditing) return;
    
    this.currentValue = Number(value);
    this.displayValue = this.formatValue(value);
    if (this.input) {
      this.input.value = this.displayValue;
    }
  }
  
  // 获取当前值
  getValue() {
    return this.currentValue;
  }
}
