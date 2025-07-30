// AngleInput.js
class AngleInput {
  constructor(options = {}) {
    // 配置选项
    this.value = options.value || 0;
    this.min = options.min !== undefined ? options.min : -Infinity;
    this.max = options.max !== undefined ? options.max : Infinity;
    this.step = options.step !== undefined ? options.step : 1;
    this.precision = options.precision !== undefined ? options.precision : 1;
    this.showDegreeSymbol = options.showDegreeSymbol !== undefined ? options.showDegreeSymbol : true;
    this.showTurns = options.showTurns !== undefined ? options.showTurns : true;
    
    // 内部状态
    const initialValue = parseFloat(this.value) || 0;
    const turns = Math.floor(Math.abs(initialValue) / 360) * (initialValue < 0 ? -1 : 1);
    const degrees = initialValue % 360;
    
    this.turnsValue = turns.toString();
    this.degreesValue = this.formatDegrees(degrees);
    this.isHovering = false;
    this.isDraggingTurns = false;
    this.isDraggingDegrees = false;
    this.isEditingTurns = false;
    this.isEditingDegrees = false;
    this.startX = 0;
    this.currentValue = initialValue;
    
    this.dragSensitivity = {
      normal: 0.5,
      shift: 2.0,
      ctrl: 0.1
    };
    
    // DOM元素
    this.container = null;
    this.turnsInput = null;
    this.degreesInput = null;
    this.dragIndicator = null;
    
    // 事件回调
    this.onChangeCallback = options.onChange || (() => {});
    this.onInputCallback = options.onInput || (() => {});
    
    // 创建DOM
    this.render();
    this.attachEvents();
  }
  
  updateDisplayValues(value) {
    const numValue = parseFloat(value) || 0;
    this.currentValue = numValue;
    
    // 计算圈数和角度
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
    
    // 更新DOM
    if (this.turnsInput) this.turnsInput.value = this.turnsValue;
    if (this.degreesInput) this.degreesInput.value = this.degreesValue;
  }
  
  formatDegrees(degrees) {
    return parseFloat(degrees).toFixed(this.precision);
  }
  
  // 计算总角度值
  calculateTotalValue() {
    const turns = parseInt(this.turnsValue) || 0;
    const degrees = parseFloat(this.degreesValue) || 0;
    return (turns * 360) + degrees;
  }
  
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
  }
  
  // 圈数输入框事件处理
  onTurnsBlur() {
    this.isEditingTurns = false;
    if (this.turnsInput) this.turnsInput.readOnly = true;
    
    try {
      // 尝试计算表达式
      const expressionValue = this.evaluateExpression(this.turnsValue);
      const turns = isNaN(expressionValue) ? (parseInt(this.turnsValue) || 0) : Math.floor(expressionValue);
      this.turnsValue = turns.toString();
      
      const totalValue = this.calculateTotalValue();
      const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
      
      this.currentValue = clampedValue;
      this.updateDisplayValues(clampedValue);
      this.emitInputEvent(clampedValue);
      this.emitChangeEvent(clampedValue);
    } catch (error) {
      // 表达式无效，使用原有行为
      const turns = parseInt(this.turnsValue) || 0;
      this.turnsValue = turns.toString();
      
      const totalValue = this.calculateTotalValue();
      const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
      
      this.currentValue = clampedValue;
      this.updateDisplayValues(clampedValue);
      this.emitInputEvent(clampedValue);
      this.emitChangeEvent(clampedValue);
    }
  }
  
  enableTurnsEdit() {
    this.isEditingTurns = true;
    if (this.turnsInput) {
      this.turnsInput.readOnly = false;
      this.turnsInput.focus();
      this.turnsInput.select();
    }
  }
  
  handleTurnsMouseDown(event) {
    if (event.detail === 2) return;
    
    if (!this.isEditingTurns) {
      event.preventDefault();
      this.startDragTurns(event);
    }
  }
  
  startDragTurns(event) {
    this.isDraggingTurns = true;
    this.startX = event.clientX;
    
    // 显示拖动指示器
    if (this.dragIndicator) {
      this.dragIndicator.style.display = 'flex';
      this.dragIndicator.classList.add('dragging');
    }
    
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
        if (this.turnsInput) this.turnsInput.value = this.turnsValue;
      }
      
      this.currentValue = clampedValue;
      this.emitInputEvent(clampedValue);
    };
    
    const handleMouseUp = () => {
      this.isDraggingTurns = false;
      
      // 隐藏拖动指示器
      if (this.dragIndicator && !this.isHovering) {
        this.dragIndicator.style.display = 'none';
      }
      if (this.dragIndicator) {
        this.dragIndicator.classList.remove('dragging');
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this.emitChangeEvent(this.currentValue);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // 角度输入框事件处理
  onDegreesBlur() {
    this.isEditingDegrees = false;
    if (this.degreesInput) this.degreesInput.readOnly = true;
    
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
      }
      // 负度数在范围内，不调整圈数
      
      this.turnsValue = turns.toString();
      this.degreesValue = this.formatDegrees(degrees);
      
      if (this.turnsInput) this.turnsInput.value = this.turnsValue;
      if (this.degreesInput) this.degreesInput.value = this.degreesValue;
      
      const totalValue = this.calculateTotalValue();
      const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
      
      this.currentValue = clampedValue;
      this.emitInputEvent(clampedValue);
      this.emitChangeEvent(clampedValue);
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
      }
      
      this.turnsValue = turns.toString();
      this.degreesValue = this.formatDegrees(degrees);
      
      if (this.turnsInput) this.turnsInput.value = this.turnsValue;
      if (this.degreesInput) this.degreesInput.value = this.degreesValue;
      
      const totalValue = this.calculateTotalValue();
      const clampedValue = Math.min(Math.max(totalValue, this.min), this.max);
      
      this.currentValue = clampedValue;
      this.emitInputEvent(clampedValue);
      this.emitChangeEvent(clampedValue);
    }
  }
  
  enableDegreesEdit() {
    this.isEditingDegrees = true;
    if (this.degreesInput) {
      this.degreesInput.readOnly = false;
      this.degreesInput.focus();
      this.degreesInput.select();
    }
  }
  
  handleDegreesMouseDown(event) {
    if (event.detail === 2) return;
    
    if (!this.isEditingDegrees) {
      event.preventDefault();
      this.startDragDegrees(event);
    }
  }
  
  // 角度拖动
  startDragDegrees(event) {
    this.isDraggingDegrees = true;
    this.startX = event.clientX;
    
    // 显示拖动指示器
    if (this.dragIndicator) {
      this.dragIndicator.style.display = 'flex';
      this.dragIndicator.classList.add('dragging');
    }
    
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
      
      this.emitInputEvent(clampedValue);
    };
    
    const handleMouseUp = () => {
      this.isDraggingDegrees = false;
      
      // 隐藏拖动指示器
      if (this.dragIndicator && !this.isHovering) {
        this.dragIndicator.style.display = 'none';
      }
      if (this.dragIndicator) {
        this.dragIndicator.classList.remove('dragging');
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      this.emitChangeEvent(this.currentValue);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // 发送input事件
  emitInputEvent(value) {
    if (this.onInputCallback) this.onInputCallback(value);
  }
  
  // 发送change事件
  emitChangeEvent(value) {
    if (this.onChangeCallback) this.onChangeCallback(value);
  }
  
  // 渲染组件
  render() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'angle-input-container';
    
    // 圈数输入框
    if (this.showTurns) {
      const turnsGroup = document.createElement('div');
      turnsGroup.className = 'turns-input-group';
      
      this.turnsInput = document.createElement('input');
      this.turnsInput.type = 'text';
      this.turnsInput.className = 'value-input turns-input';
      this.turnsInput.value = this.turnsValue;
      this.turnsInput.readOnly = true;
      
      const turnsSymbol = document.createElement('span');
      turnsSymbol.className = 'angle-symbol';
      
      turnsGroup.appendChild(this.turnsInput);
      turnsGroup.appendChild(turnsSymbol);
      this.container.appendChild(turnsGroup);
    }
    
    // 角度输入框
    const degreesGroup = document.createElement('div');
    degreesGroup.className = 'degrees-input-group';
    
    if (this.showTurns) {
      const angleSymbol = document.createElement('span');
      angleSymbol.className = 'angle-symbol';
      degreesGroup.appendChild(angleSymbol);
    }
    
    this.degreesInput = document.createElement('input');
    this.degreesInput.type = 'text';
    this.degreesInput.className = 'value-input angle-input';
    this.degreesInput.value = this.degreesValue;
    this.degreesInput.readOnly = true;
    
    degreesGroup.appendChild(this.degreesInput);
    
    if (this.showDegreeSymbol) {
      const degreeSymbol = document.createElement('span');
      degreeSymbol.className = 'angle-symbol degree-symbol';
      degreeSymbol.textContent = '°';
      degreesGroup.appendChild(degreeSymbol);
    }
    
    this.container.appendChild(degreesGroup);
    
    // 拖动指示器
    this.dragIndicator = document.createElement('div');
    this.dragIndicator.className = 'drag-indicator';
    this.dragIndicator.style.display = 'none';
    this.container.appendChild(this.dragIndicator);
    
    // 添加样式
    this.addStyles();
  }
  
  // 添加事件监听
  attachEvents() {
    // 鼠标进入/离开事件
    this.container.addEventListener('mouseenter', () => {
      this.isHovering = true;
      if (this.isHovering && !this.isEditingTurns && !this.isEditingDegrees) {
        this.dragIndicator.style.display = 'flex';
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.isHovering = false;
      if (!this.isDraggingTurns && !this.isDraggingDegrees) {
        this.dragIndicator.style.display = 'none';
      }
    });
    
    // 圈数输入框事件
    if (this.turnsInput) {
      this.turnsInput.addEventListener('blur', this.onTurnsBlur.bind(this));
      this.turnsInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') this.onTurnsBlur();
      });
      this.turnsInput.addEventListener('mousedown', this.handleTurnsMouseDown.bind(this));
      this.turnsInput.addEventListener('dblclick', this.enableTurnsEdit.bind(this));
    }
    
    // 角度输入框事件
    if (this.degreesInput) {
      this.degreesInput.addEventListener('blur', this.onDegreesBlur.bind(this));
      this.degreesInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') this.onDegreesBlur();
      });
      this.degreesInput.addEventListener('mousedown', this.handleDegreesMouseDown.bind(this));
      this.degreesInput.addEventListener('dblclick', this.enableDegreesEdit.bind(this));
    }
  }
  
  // 添加组件样式
  addStyles() {
    const styleId = 'angle-input-styles';
    
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
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
        
        .angle-input-container:active {
          user-select: none;
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
    if (this.isDraggingDegrees || this.isDraggingTurns || 
        this.isEditingDegrees || this.isEditingTurns) return;
    
    this.updateDisplayValues(value);
  }
  
  // 获取当前值
  getValue() {
    return this.currentValue;
  }
}
