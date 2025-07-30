// MixNumber.js
class MixNumber {
  constructor(options = {}) {
    // 配置选项
    this.modelValue = options.modelValue || 0;
    this.precision = options.precision !== undefined ? options.precision : 2;
    this.step = options.step !== undefined ? options.step : 1;
    this.denominatorList = Array.isArray(options.denominatorList) ? options.denominatorList : [];
    this.denominator = options.denominator || 4;
    this.denominatorLocked = options.denominatorLocked !== undefined ? options.denominatorLocked : false;
    
    // 内部状态
    this.integerPart = 0;
    this.numerator = 0;
    this.denominatorValue = this.denominator;
    this.isDenominatorLocked = this.denominatorLocked;
    
    // 事件回调
    this.onUpdateCallback = options.onUpdate || (() => {});
    this.onDenominatorLockChangeCallback = options.onDenominatorLockChange || (() => {});
    
    // DOM 元素
    this.container = null;
    
    // 初始化计算
    this.updatePartsFromValue(this.modelValue);
    
    // 创建DOM
    this.render();
  }
  
  // 计算分数值
  calculateValue() {
    const sign = Math.sign(this.integerPart) || 1;
    return this.integerPart + sign * (this.numerator / this.denominatorValue);
  }
  
  // 从小数值更新分数部分
  updatePartsFromValue(value) {
    const sign = Math.sign(value) || 1;
    const absValue = Math.abs(value);
    this.integerPart = Math.trunc(value);
    
    const remainder = absValue - Math.floor(absValue);
    if (remainder > 1e-9) {
      const newNumerator = remainder * this.denominatorValue;
      this.numerator = Math.round(newNumerator);
      
      // 处理舍入后的进位情况
      if (this.numerator >= this.denominatorValue) {
        this.integerPart += sign;
        this.numerator = 0;
      }
    } else {
      this.numerator = 0;
    }
    
    // 更新输入组件值
    if (this.integerInput) {
      this.integerInput.setValue(this.integerPart);
    }
    
    if (this.numeratorInput) {
      this.numeratorInput.setValue(this.numerator);
    }
    
    if (this.denominatorInput) {
      this.denominatorInput.setValue(this.denominatorValue);
    }
  }
  
  // 整数部分变更
  onIntegerChange(value) {
    this.integerPart = parseInt(value) || 0;
    this.emitUpdate();
  }
  
  // 分子变更
  onNumeratorChange(value) {
    this.numerator = parseInt(value) || 0;
    this.emitUpdate();
  }
  
  // 处理分子进位
  handleNumeratorIntPlus(event) {
    if (event && event.plus) {
      const intChange = Math.floor(event.plus);
      if (intChange !== 0) {
        this.integerPart += intChange;
        if (this.integerInput) {
          this.integerInput.setValue(this.integerPart);
        }
        this.emitUpdate();
      }
    }
  }
  
  // 分母变更
  onDenominatorChange(value) {
    if (value <= 0) return;
    
    // 记住旧值，以便保持总值不变
    const oldValue = this.calculateValue();
    
    // 检查分母是否在允许的列表中
    if (this.denominatorList.length > 0 && !this.denominatorList.includes(value)) {
      // 找到最接近的有效分母值
      let closest = this.denominatorList[0];
      let minDiff = Math.abs(value - closest);
      
      for (const denom of this.denominatorList) {
        const diff = Math.abs(value - denom);
        if (diff < minDiff) {
          closest = denom;
          minDiff = diff;
        }
      }
      this.denominatorValue = closest;
    } else {
      this.denominatorValue = value;
    }
    
    // 更新分母值后，根据原值重新计算分子
    const remainder = Math.abs(oldValue) - Math.floor(Math.abs(oldValue));
    if (remainder > 1e-9) {
      this.numerator = Math.round(remainder * this.denominatorValue);
      
      // 处理舍入后的进位
      if (this.numerator >= this.denominatorValue) {
        this.integerPart += Math.sign(oldValue);
        this.numerator = 0;
      }
    }
    
    // 更新组件显示
    if (this.numeratorInput) {
      this.numeratorInput.max = this.denominatorValue - 1;
      this.numeratorInput.setValue(this.numerator);
    }
    
    this.emitUpdate();
  }
  
  // 分母锁定状态变更
  onDenominatorLockChange(locked) {
    this.isDenominatorLocked = locked;
    if (this.onDenominatorLockChangeCallback) {
      this.onDenominatorLockChangeCallback(locked);
    }
  }
  
  // 发送更新事件
  emitUpdate() {
    const value = this.calculateValue();
    if (this.onUpdateCallback) {
      this.onUpdateCallback(value);
    }
  }
  
  // 渲染组件
  render() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'mix-number-container';
    
    // 创建整数部分输入框
    this.integerInput = new ValueInput({
      modelValue: this.integerPart,
      step: 1,
      precision: 0,
      onUpdate: this.onIntegerChange.bind(this)
    });
    
    // 创建加号分隔符
    const separatorPlus = document.createElement('span');
    separatorPlus.className = 'separator';
    separatorPlus.textContent = '+';
    
    // 创建分子输入框
    this.numeratorInput = new ValueInput({
      modelValue: this.numerator,
      min: 0,
      max: this.denominatorValue - 1,
      step: 1,
      precision: 0,
      loop: true,
      onUpdate: this.onNumeratorChange.bind(this),
      onIntPlus: this.handleNumeratorIntPlus.bind(this)
    });
    
    // 创建除号分隔符
    const separatorDiv = document.createElement('span');
    separatorDiv.className = 'separator';
    separatorDiv.textContent = '/';
    
    // 创建分母输入框（带锁定功能）
    this.denominatorInput = new LockValueInput({
      modelValue: this.denominatorValue,
      min: 1,
      step: 1,
      precision: 0,
      allowedValues: this.denominatorList.length > 0 ? this.denominatorList : undefined,
      defaultLocked: this.isDenominatorLocked,
      onUpdate: this.onDenominatorChange.bind(this),
      onLockedChange: this.onDenominatorLockChange.bind(this)
    });
    
    // 添加所有元素到容器
    this.container.appendChild(this.integerInput.getElement());
    this.container.appendChild(separatorPlus);
    this.container.appendChild(this.numeratorInput.getElement());
    this.container.appendChild(separatorDiv);
    this.container.appendChild(this.denominatorInput.getElement());
    
    // 添加样式
    this.addStyles();
  }
  
  // 添加组件样式
  addStyles() {
    const styleId = 'mix-number-styles';
    
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .mix-number-container {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .separator {
          color: #ccc;
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
    this.updatePartsFromValue(value);
  }
  
  // 获取当前值
  getValue() {
    return this.calculateValue();
  }
  
  // 设置分母
  setDenominator(value) {
    if (value > 0) {
      const oldValue = this.calculateValue();
      this.denominatorValue = value;
      
      // 更新分母后，保持总值不变，重新计算分子
      this.updatePartsFromValue(oldValue);
      
      if (this.denominatorInput) {
        this.denominatorInput.setValue(value);
      }
    }
  }
  
  // 设置分母锁定状态
  setDenominatorLocked(locked) {
    this.isDenominatorLocked = Boolean(locked);
    
    if (this.denominatorInput) {
      this.denominatorInput.setLocked(this.isDenominatorLocked);
    }
  }
}