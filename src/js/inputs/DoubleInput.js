// DoubleInput.js
class DoubleInput {
    constructor(options = {}) {
      // 配置选项
      this.value = Array.isArray(options.value) ? options.value : [0, 0];
      this.minX = options.minX !== undefined ? options.minX : -Infinity;
      this.maxX = options.maxX !== undefined ? options.maxX : Infinity;
      this.minY = options.minY !== undefined ? options.minY : -Infinity;
      this.maxY = options.maxY !== undefined ? options.maxY : Infinity;
      this.step = options.step !== undefined ? options.step : 1;
      this.precision = options.precision !== undefined ? options.precision : 1;
      this.chainRatio = options.chainRatio !== undefined ? options.chainRatio : false;
      
      // 内部状态
      this.displayValueX = this.formatValue(this.value[0]);
      this.displayValueY = this.formatValue(this.value[1]);
      this.currentValueX = parseFloat(this.value[0]) || 0;
      this.currentValueY = parseFloat(this.value[1]) || 0;
      this.isHovering = false;
      this.isDraggingX = false;
      this.isDraggingY = false;
      this.isEditingX = false;
      this.isEditingY = false;
      this.startX = 0;
      this.startY = 0;
      
      this.dragSensitivity = {
        normal: 0.5,
        shift: 2.5,
        ctrl: 0.1
      };
      
      this.ratioXY = 1;
      this.localChainRatio = this.chainRatio;
      
      // DOM元素
      this.container = null;
      this.inputX = null;
      this.inputY = null;
      this.dragIndicator = null;
      
      // ChainRatio组件
      this.chainRatioComponent = null;
      
      // 事件回调
      this.onInputCallback = options.onInput || (() => {});
      this.onChangeCallback = options.onChange || (() => {});
      
      // 创建DOM
      this.render();
      this.attachEvents();
    }
    
    // 格式化值为指定精度的字符串
    formatValue(val) {
      const num = parseFloat(val);
      return isNaN(num) ? '0' : num.toFixed(this.precision);
    }
    
    // 表达式计算
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
    
    // 锁定比例变更事件
    onChainRatioChange(isLocked) {
      this.localChainRatio = isLocked;
      
      // 锁定时更新比例
      if (isLocked && this.currentValueY !== 0) {
        this.ratioXY = this.currentValueX / this.currentValueY;
      }
    }
    
    // X 输入框相关方法
    onBlurX() {
      this.isEditingX = false;
      if (this.inputX) this.inputX.readOnly = true;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.displayValueX);
        const numValue = isNaN(expressionValue) ? parseFloat(this.displayValueX) : expressionValue;
        
        if (isNaN(numValue)) {
          this.displayValueX = this.formatValue(this.currentValueX);
          if (this.inputX) this.inputX.value = this.displayValueX;
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minX), this.maxX);
        this.currentValueX = clampedValue;
        this.displayValueX = this.formatValue(clampedValue);
        if (this.inputX) this.inputX.value = this.displayValueX;
        
        // 如果锁定比例，同时调整Y值
        if (this.localChainRatio && this.ratioXY !== 0) {
          const newValueY = clampedValue / this.ratioXY;
          const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
          this.currentValueY = clampedValueY;
          this.displayValueY = this.formatValue(clampedValueY);
          if (this.inputY) this.inputY.value = this.displayValueY;
        }
        
        this.emitValues();
      } catch (error) {
        // 表达式无效，使用原有行为
        const numValue = parseFloat(this.displayValueX);
        
        if (isNaN(numValue)) {
          this.displayValueX = this.formatValue(this.currentValueX);
          if (this.inputX) this.inputX.value = this.displayValueX;
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minX), this.maxX);
        this.currentValueX = clampedValue;
        this.displayValueX = this.formatValue(clampedValue);
        if (this.inputX) this.inputX.value = this.displayValueX;
        
        // 如果锁定比例，同时调整Y值
        if (this.localChainRatio && this.ratioXY !== 0) {
          const newValueY = clampedValue / this.ratioXY;
          const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
          this.currentValueY = clampedValueY;
          this.displayValueY = this.formatValue(clampedValueY);
          if (this.inputY) this.inputY.value = this.displayValueY;
        }
        
        this.emitValues();
      }
    }
    
    enableEditX() {
      this.isEditingX = true;
      if (this.inputX) {
        this.inputX.readOnly = false;
        this.inputX.focus();
        this.inputX.select();
      }
    }
    
    handleMouseDownX(event) {
      if (event.detail === 2) return;
      
      if (!this.isEditingX) {
        event.preventDefault();
        this.startDragX(event);
      }
    }
    
    startDragX(event) {
      this.isDraggingX = true;
      this.startX = event.clientX;
      
      // 显示拖动指示器
      if (this.dragIndicator) {
        this.dragIndicator.style.display = 'block';
        this.dragIndicator.classList.add('dragging');
        this.dragIndicator.classList.add('x-dragging');
      }
      
      // 如果启用了锁定比例，计算初始比例
      if (this.localChainRatio && this.currentValueY !== 0) {
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
        if (this.inputX) this.inputX.value = this.displayValueX;
        
        // 如果锁定比例，调整Y值
        if (this.localChainRatio && this.ratioXY !== 0) {
          const newValueY = clampedValueX / this.ratioXY;
          const clampedValueY = Math.min(Math.max(newValueY, this.minY), this.maxY);
          this.currentValueY = clampedValueY;
          this.displayValueY = this.formatValue(clampedValueY);
          if (this.inputY) this.inputY.value = this.displayValueY;
        }
        
        this.emitInputEvent();
      };
      
      const handleMouseUp = () => {
        this.isDraggingX = false;
        
        // 隐藏拖动指示器
        if (this.dragIndicator && !this.isHovering) {
          this.dragIndicator.style.display = 'none';
        }
        if (this.dragIndicator) {
          this.dragIndicator.classList.remove('dragging');
          this.dragIndicator.classList.remove('x-dragging');
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        this.emitChangeEvent();
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // Y 输入框相关方法
    onBlurY() {
      this.isEditingY = false;
      if (this.inputY) this.inputY.readOnly = true;
      
      try {
        // 尝试计算表达式
        const expressionValue = this.evaluateExpression(this.displayValueY);
        const numValue = isNaN(expressionValue) ? parseFloat(this.displayValueY) : expressionValue;
        
        if (isNaN(numValue)) {
          this.displayValueY = this.formatValue(this.currentValueY);
          if (this.inputY) this.inputY.value = this.displayValueY;
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minY), this.maxY);
        this.currentValueY = clampedValue;
        this.displayValueY = this.formatValue(clampedValue);
        if (this.inputY) this.inputY.value = this.displayValueY;
        
        // 如果锁定比例，同时调整X值
        if (this.localChainRatio && clampedValue !== 0) {
          const newValueX = this.ratioXY * clampedValue;
          const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
          this.currentValueX = clampedValueX;
          this.displayValueX = this.formatValue(clampedValueX);
          if (this.inputX) this.inputX.value = this.displayValueX;
        }
        
        this.emitValues();
      } catch (error) {
        // 表达式无效，使用原有行为
        const numValue = parseFloat(this.displayValueY);
        
        if (isNaN(numValue)) {
          this.displayValueY = this.formatValue(this.currentValueY);
          if (this.inputY) this.inputY.value = this.displayValueY;
          return;
        }
        
        const clampedValue = Math.min(Math.max(numValue, this.minY), this.maxY);
        this.currentValueY = clampedValue;
        this.displayValueY = this.formatValue(clampedValue);
        if (this.inputY) this.inputY.value = this.displayValueY;
        
        // 如果锁定比例，同时调整X值
        if (this.localChainRatio && clampedValue !== 0) {
          const newValueX = this.ratioXY * clampedValue;
          const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
          this.currentValueX = clampedValueX;
          this.displayValueX = this.formatValue(clampedValueX);
          if (this.inputX) this.inputX.value = this.displayValueX;
        }
        
        this.emitValues();
      }
    }
    
    enableEditY() {
      this.isEditingY = true;
      if (this.inputY) {
        this.inputY.readOnly = false;
        this.inputY.focus();
        this.inputY.select();
      }
    }
    
    handleMouseDownY(event) {
      if (event.detail === 2) return;
      
      if (!this.isEditingY) {
        event.preventDefault();
        this.startDragY(event);
      }
    }
    
    startDragY(event) {
      this.isDraggingY = true;
      this.startX = event.clientX;
      
      // 显示拖动指示器
      if (this.dragIndicator) {
        this.dragIndicator.style.display = 'block';
        this.dragIndicator.classList.add('dragging');
        this.dragIndicator.classList.add('y-dragging');
      }
      
      // 如果启用了锁定比例，计算初始比例
      if (this.localChainRatio && this.currentValueY !== 0) {
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
        if (this.inputY) this.inputY.value = this.displayValueY;
        
        // 如果锁定比例，调整X值
        if (this.localChainRatio && this.ratioXY !== 0 && clampedValueY !== 0) {
          const newValueX = this.ratioXY * clampedValueY;
          const clampedValueX = Math.min(Math.max(newValueX, this.minX), this.maxX);
          this.currentValueX = clampedValueX;
          this.displayValueX = this.formatValue(clampedValueX);
          if (this.inputX) this.inputX.value = this.displayValueX;
        }
        
        this.emitInputEvent();
      };
      
      const handleMouseUp = () => {
        this.isDraggingY = false;
        
        // 隐藏拖动指示器
        if (this.dragIndicator && !this.isHovering) {
          this.dragIndicator.style.display = 'none';
        }
        if (this.dragIndicator) {
          this.dragIndicator.classList.remove('dragging');
          this.dragIndicator.classList.remove('y-dragging');
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        this.emitChangeEvent();
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // 发送更新后的值
    emitValues() {
      this.emitInputEvent();
      this.emitChangeEvent();
    }
    
    // 发送input事件
    emitInputEvent() {
      if (this.onInputCallback) {
        this.onInputCallback([this.currentValueX, this.currentValueY]);
      }
    }
    
    // 发送change事件
    emitChangeEvent() {
      if (this.onChangeCallback) {
        this.onChangeCallback([this.currentValueX, this.currentValueY]);
      }
    }
    
    // 渲染组件
    render() {
      // 创建容器
      this.container = document.createElement('div');
      this.container.className = 'double-input-container';
      
      // X输入框
      this.inputX = document.createElement('input');
      this.inputX.type = 'text';
      this.inputX.className = 'value-input x-input';
      this.inputX.value = this.displayValueX;
      this.inputX.readOnly = true;
      
      // 分隔符
      const separator = document.createElement('span');
      separator.className = 'separator';
      separator.textContent = ',';
      
      // Y输入框
      this.inputY = document.createElement('input');
      this.inputY.type = 'text';
      this.inputY.className = 'value-input y-input';
      this.inputY.value = this.displayValueY;
      this.inputY.readOnly = true;
      
      // 添加到容器
      this.container.appendChild(this.inputX);
      this.container.appendChild(separator);
      this.container.appendChild(this.inputY);
      
      // 创建锁定比例组件
      this.chainRatioComponent = new ChainRatio({
        value: this.localChainRatio,
        onInput: (value) => {
          this.localChainRatio = value;
        },
        onChange: this.onChainRatioChange.bind(this)
      });
      
      // 添加锁定比例组件
      this.container.appendChild(this.chainRatioComponent.getElement());
      
      // 创建拖动指示器
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
        if (this.isHovering && !(this.isEditingX || this.isEditingY)) {
          this.dragIndicator.style.display = 'block';
        }
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.isHovering = false;
        if (!(this.isDraggingX || this.isDraggingY)) {
          this.dragIndicator.style.display = 'none';
        }
      });
      
      // X输入框事件
      this.inputX.addEventListener('blur', this.onBlurX.bind(this));
      this.inputX.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') this.onBlurX();
      });
      this.inputX.addEventListener('mousedown', this.handleMouseDownX.bind(this));
      this.inputX.addEventListener('dblclick', this.enableEditX.bind(this));
      
      // Y输入框事件
      this.inputY.addEventListener('blur', this.onBlurY.bind(this));
      this.inputY.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') this.onBlurY();
      });
      this.inputY.addEventListener('mousedown', this.handleMouseDownY.bind(this));
      this.inputY.addEventListener('dblclick', this.enableEditY.bind(this));
    }
    
    // 添加组件样式
    addStyles() {
      const styleId = 'double-input-styles';
      
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
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
            cursor: ew-resize;
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
            cursor: text;
          }
          
          .value-input.dragging {
            cursor: ew-resize;
            user-select: none;
          }
          
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
      if (!Array.isArray(value) || value.length < 2) return;
      
      if (this.isDraggingX || this.isDraggingY || 
          this.isEditingX || this.isEditingY) return;
      
      this.currentValueX = parseFloat(value[0]) || 0;
      this.currentValueY = parseFloat(value[1]) || 0;
      this.displayValueX = this.formatValue(this.currentValueX);
      this.displayValueY = this.formatValue(this.currentValueY);
      
      if (this.inputX) this.inputX.value = this.displayValueX;
      if (this.inputY) this.inputY.value = this.displayValueY;
    }
    
    // 获取当前值
    getValue() {
      return [this.currentValueX, this.currentValueY];
    }
    
    // 设置锁定比例
    setChainRatio(value) {
      this.localChainRatio = Boolean(value);
      
      if (this.chainRatioComponent) {
        this.chainRatioComponent.setValue(this.localChainRatio);
      }
      
      // 更新比例
      if (this.localChainRatio && this.currentValueY !== 0) {
        this.ratioXY = this.currentValueX / this.currentValueY;
      }
    }
  }