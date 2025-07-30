// LockValueInput.js
class LockValueInput {
    constructor(options = {}) {
      // 配置选项
      this.modelValue = options.modelValue || 0;
      this.min = options.min !== undefined ? options.min : -Infinity;
      this.max = options.max !== undefined ? options.max : Infinity;
      this.step = options.step !== undefined ? options.step : 1;
      this.precision = options.precision !== undefined ? options.precision : 0;
      this.defaultLocked = options.defaultLocked !== undefined ? options.defaultLocked : false;
      this.allowedValues = options.allowedValues;
      
      // 内部状态
      this.locked = this.defaultLocked;
      
      // 事件回调
      this.onUpdateCallback = options.onUpdate || (() => {});
      this.onLockedChangeCallback = options.onLockedChange || (() => {});
      
      // DOM元素
      this.container = null;
      this.valueInput = null;
      this.lockButton = null;
      
      // 创建DOM
      this.render();
    }
    
    // 切换锁定状态
    toggleLock() {
      this.locked = !this.locked;
      
      // 更新锁按钮的显示状态
      if (this.lockButton) {
        if (this.locked) {
          this.lockButton.classList.add('locked');
          this.lockButton.querySelector('.lock-icon').textContent = '🔒';
        } else {
          this.lockButton.classList.remove('locked');
          this.lockButton.querySelector('.lock-icon').textContent = '🔓';
        }
      }
      
      // 更新输入框的禁用状态
      if (this.valueInput) {
        this.valueInput.disabled = this.locked;
      }
      
      // 触发锁定状态变更回调
      if (this.onLockedChangeCallback) {
        this.onLockedChangeCallback(this.locked);
      }
    }
    
    // 处理值变更
    onValueUpdate(value) {
      if (!this.locked && this.onUpdateCallback) {
        this.onUpdateCallback(value);
      }
    }
    
    // 渲染组件
    render() {
      // 创建容器
      this.container = document.createElement('div');
      this.container.className = 'lock-value-input-container';
      
      // 创建值输入框
      this.valueInput = new ValueInput({
        modelValue: this.modelValue,
        min: this.min,
        max: this.max,
        step: this.step,
        precision: this.precision,
        disabled: this.locked,
        allowedValues: this.allowedValues,
        onUpdate: this.onValueUpdate.bind(this)
      });
      
      // 创建锁定按钮
      this.lockButton = document.createElement('div');
      this.lockButton.className = 'lock-button';
      if (this.locked) {
        this.lockButton.classList.add('locked');
      }
      
      const lockIcon = document.createElement('span');
      lockIcon.className = 'lock-icon';
      lockIcon.textContent = this.locked ? '🔒' : '🔓';
      
      this.lockButton.appendChild(lockIcon);
      this.lockButton.addEventListener('click', this.toggleLock.bind(this));
      
      // 添加元素到容器
      this.container.appendChild(this.valueInput.getElement());
      this.container.appendChild(this.lockButton);
      
      // 添加样式
      this.addStyles();
    }
    
    // 添加组件样式
    addStyles() {
      const styleId = 'lock-value-input-styles';
      
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .lock-value-input-container {
            position: relative;
            display: inline-flex;
            align-items: center;
          }
          
          .lock-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            margin-left: 4px;
            background-color: #2c2c2c;
            border-radius: 3px;
            cursor: pointer;
            user-select: none;
          }
          
          .lock-button:hover {
            background-color: #3a3a3a;
          }
          
          .lock-button.locked {
            background-color: #4a4a4a;
          }
          
          .lock-icon {
            font-size: 12px;
            line-height: 1;
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
      if (this.valueInput) {
        this.valueInput.setValue(value);
      }
    }
    
    // 获取当前值
    getValue() {
      return this.valueInput ? this.valueInput.getValue() : this.modelValue;
    }
    
    // 设置锁定状态
    setLocked(locked) {
      if (this.locked !== locked) {
        this.locked = locked;
        
        if (this.lockButton) {
          if (this.locked) {
            this.lockButton.classList.add('locked');
            this.lockButton.querySelector('.lock-icon').textContent = '🔒';
          } else {
            this.lockButton.classList.remove('locked');
            this.lockButton.querySelector('.lock-icon').textContent = '🔓';
          }
        }
        
        if (this.valueInput) {
          this.valueInput.disabled = this.locked;
        }
      }
    }
  }