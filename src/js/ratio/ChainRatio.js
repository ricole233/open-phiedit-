// ChainRatio.js
class ChainRatio {
  constructor(options = {}) {
    // 配置选项
    this.value = options.value || false;
    
    // 事件回调
    this.onInputCallback = options.onInput || (() => {});
    this.onChangeCallback = options.onChange || (() => {});
    
    // 创建DOM
    this.render();
    this.attachEvents();
  }
  
  // 切换比例锁定状态
  toggleRatio() {
    const newValue = !this.value;
    this.value = newValue;
    
    // 更新图标样式
    if (this.chainIcon) {
      if (newValue) {
        this.chainIcon.classList.add('active');
      } else {
        this.chainIcon.classList.remove('active');
      }
    }
    
    // 触发回调
    this.onInputCallback(newValue);
    this.onChangeCallback(newValue);
  }
  
  // 渲染组件
  render() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'chain-ratio-container';
    
    // 创建链接图标
    this.chainIcon = document.createElement('div');
    this.chainIcon.className = 'chain-icon';
    if (this.value) {
      this.chainIcon.classList.add('active');
    }
    
    // 创建SVG图标
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71');
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71');
    
    svg.appendChild(path1);
    svg.appendChild(path2);
    this.chainIcon.appendChild(svg);
    
    // 添加到容器
    this.container.appendChild(this.chainIcon);
    
    // 添加样式
    this.addStyles();
  }
  
  // 添加事件监听
  attachEvents() {
    this.container.addEventListener('click', this.toggleRatio.bind(this));
  }
  
  // 添加组件样式
  addStyles() {
    const styleId = 'chain-ratio-styles';
    
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .chain-ratio-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          cursor: pointer;
          margin-left: 4px;
          border-radius: 3px;
        }
        
        .chain-ratio-container:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .chain-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5a5a5a;
          opacity: 0;
        }
        
        .chain-icon.active {
          color: #00a8ff;
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
    this.value = Boolean(value);
    
    if (this.chainIcon) {
      if (this.value) {
        this.chainIcon.classList.add('active');
      } else {
        this.chainIcon.classList.remove('active');
      }
    }
  }
  
  // 获取当前值
  getValue() {
    return this.value;
  }
}