<template>
  <div class="color-input-container">
    <!-- 颜色预览区域 -->
    <div 
      class="color-preview" 
      :style="{ backgroundColor: displayColor }"
      @click="openColorPicker"
      @keydown.enter="openColorPicker"
      @keydown.space.prevent="openColorPicker"
      tabindex="0"
      role="button"
      :aria-label="`选择颜色：当前颜色为${colorValue}`"
      ref="colorPreview"
    ></div>
    
    <!-- 颜色值显示 -->
    <input 
      ref="colorInput"
      type="text" 
      class="color-value-input" 
      v-model="colorValue"
      @blur="updateColor"
      @keydown.enter="updateColor"
      @focus="selectAll"
      aria-label="颜色值"
    />
    
    <!-- 激活颜色选择器按钮 -->
    <button 
      class="activate-picker-button"
      @click="openColorPicker"
      aria-label="打开颜色选择器"
    >
      <div class="color-preview-button" :style="{ backgroundColor: displayColor }"></div>
    </button>
    
    <!-- 颜色选择器弹出层 -->
    <div v-if="isPickerVisible" class="color-picker-container" role="dialog" aria-label="颜色选择器">
      <div class="color-picker-header">
        <span>{{ colorFormat === 'rgb' ? rgbColor : colorValue }}</span>
        <button class="close-button" @click="closeColorPicker">×</button>
      </div>
      
      <!-- 主色区域 -->
      <div class="color-picker-main">
        <!-- 色相/饱和度面板 -->
        <div 
          class="hue-saturation-panel" 
          ref="hueSatPanel"
          @mousedown="startHueSatDrag"
          @touchstart="startHueSatDrag"
        >
          <div class="hue-saturation-overlay"></div>
          <div 
            class="hue-saturation-thumb" 
            :style="{ 
              left: `${satPos}%`, 
              top: `${100 - brightPos}%` 
            }"
          ></div>
        </div>
        
        <!-- 右侧控制区域 -->
        <div class="controls-container">
          <!-- 明度滑块 -->
          <div 
            class="brightness-slider" 
            ref="brightnessSlider"
            @mousedown="startBrightnessDrag"
            @touchstart="startBrightnessDrag"
          >
            <div 
              class="brightness-track"
              :style="{ background: brightnessGradient }"
            ></div>
            <div 
              class="brightness-thumb" 
              :style="{ top: `${100 - brightPos}%` }"
            ></div>
          </div>
          
          <!-- 色相滑块 -->
          <div 
            class="hue-slider" 
            ref="hueSlider"
            @mousedown="startHueDrag"
            @touchstart="startHueDrag"
          >
            <div class="hue-track"></div>
            <div 
              class="hue-thumb" 
              :style="{ top: `${huePos}%` }"
            ></div>
          </div>
          
          <!-- 透明度滑块 -->
          <div 
            v-if="showOpacity"
            class="opacity-slider" 
            ref="opacitySlider"
            @mousedown="startOpacityDrag"
            @touchstart="startOpacityDrag"
            role="slider"
            aria-labelledby="opacity-label"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="Math.round(opacity * 100)"
            tabindex="0"
            @keydown.left.prevent="adjustOpacity(-1)"
            @keydown.right.prevent="adjustOpacity(1)"
          >
            <div class="opacity-track">
              <div class="opacity-checkerboard"></div>
              <div 
                class="opacity-overlay"
                :style="{ background: `linear-gradient(to bottom, transparent, ${rgbColor})` }"
              ></div>
            </div>
            <div 
              class="opacity-thumb" 
              :style="{ top: `${opacityPos}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 颜色格式控制 -->
      <div class="color-format-controls" role="radiogroup" aria-label="颜色格式">
        <div class="color-format-option">
          <label>
            <input type="radio" :checked="colorFormat === 'hex'" @change="changeColorFormat('hex')">
            Hex
          </label>
        </div>
        <div class="color-format-option">
          <label>
            <input type="radio" :checked="colorFormat === 'rgb'" @change="changeColorFormat('rgb')">
            RGB
          </label>
        </div>
        <div class="color-format-option">
          <label>
            <input type="radio" :checked="colorFormat === 'hsl'" @change="changeColorFormat('hsl')">
            HSL
          </label>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="color-picker-actions">
        <button class="cancel-button" @click="cancelColorSelection">取消</button>
        <button class="confirm-button" @click="confirmColorSelection">确定</button>
      </div>
      <!-- 历史颜色 保留最近10个颜色-->
      <div class="history-colors" v-if="isShowHistory && effectiveHistoryColors && effectiveHistoryColors.length > 0">
        <div class="history-color" v-for="color in effectiveHistoryColors" :key="color" @click="selectHistoryColor(color)">
          <div class="history-color-preview" :style="{ backgroundColor: color }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorInput',
  props: {
    value: {
      type: String,
      default: '#000000'
    },
    showOpacity: {
      type: Boolean,
      default: true
    },
    historyColors: {
      type: Array,
      default: () => []
    },
    isShowHistory: {
      type: Boolean,
      default: true
    },
    isShowColorPicker: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      colorValue: this.value,
      displayColor: this.value,
      isPickerVisible: this.isShowColorPicker,
      colorFormat: 'hex',
      
      // HSV 颜色值
      hue: 0,         // 0-360
      saturation: 0,  // 0-100
      brightness: 0,  // 0-100
      opacity: 1,     // 0-1
      
      // UI位置
      huePos: 0,      // 0-100
      satPos: 0,      // 0-100
      brightPos: 0,   // 0-100
      opacityPos: 100, // 0-100
      
      // 记住初始颜色以支持取消
      initialColor: this.value,
      
      // 当前的RGB颜色值
      rgbColor: 'rgb(0,0,0)',
      
      // 内部历史颜色存储（当没有传入prop时）
      internalHistoryColors: []
    };
  },
  computed: {
    brightnessGradient() {
      // 创建明度滑块的渐变效果 - 从当前色相/饱和度的颜色到黑色
      const hsColor = this.hsvToHex(this.hue, this.saturation, 100);
      return `linear-gradient(to bottom, ${hsColor}, #000000)`;
    },
    
    // 有效的历史颜色列表（优先使用prop传入的，否则使用内部存储的）
    effectiveHistoryColors() {
      return this.historyColors && this.historyColors.length > 0 ? 
        this.historyColors : this.internalHistoryColors;
    }
  },
  mounted() {
    this.parseColor(this.value);
    
    // 添加点击外部关闭选择器的事件
    document.addEventListener('mousedown', this.handleOutsideClick);
    
    // 初始化色相/饱和度面板
    this.$nextTick(() => {
      this.updateHueSatPanel();
    });
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  },
  watch: {
    value(newVal) {
      if (newVal !== this.colorValue) {
        this.colorValue = newVal;
        this.displayColor = newVal;
        this.parseColor(newVal);
      }
    },
    hue() {
      // 监听色相变化，更新面板颜色
      this.updateHueSatPanel();
    }
  },
  methods: {
    // 打开颜色选择器
    openColorPicker() {
      this.isPickerVisible = true;
      this.initialColor = this.colorValue; // 记住初始颜色
      
      // 等待DOM更新后设置位置
      this.$nextTick(() => {
        this.updatePositionsFromHSV();
      });
    },
    
    // 关闭颜色选择器
    closeColorPicker() {
      this.isPickerVisible = false;
    },
    
    // 选中输入框全部内容
    selectAll(event) {
      event.target.select();
    },
    
    // 处理外部点击关闭选择器
    handleOutsideClick(event) {
      if (!this.isPickerVisible) return;
      
      // 检查点击是否在颜色预览区域外且不在选择器内
      const clickedInPreview = this.$refs.colorPreview && this.$refs.colorPreview.contains(event.target);
      
      // 检查是否点击在选择器内部
      let clickedInPicker = false;
      let el = event.target;
      
      // 向上遍历DOM树查找选择器容器
      while (el && !clickedInPicker) {
        if (el.className && typeof el.className === 'string' && el.className.includes('color-picker-container')) {
          clickedInPicker = true;
        }
        el = el.parentNode;
      }
      
      if (!clickedInPreview && !clickedInPicker) {
        this.closeColorPicker();
      }
    },
    
    // 取消选择，恢复到初始颜色
    cancelColorSelection() {
      this.parseColor(this.initialColor);
      this.colorValue = this.initialColor;
      this.displayColor = this.initialColor;
      this.closeColorPicker();
    },
    
    // 确认选择
    confirmColorSelection() {
      this.updateColorValue();
      this.closeColorPicker();
      
      // 只在使用内部历史记录并且颜色有效时添加到历史
      if (!this.historyColors || this.historyColors.length === 0) {
        this.addToHistory(this.colorValue);
      }
      
      this.$emit('input', this.colorValue);
      this.$emit('change', this.colorValue);
    },
    
    // 添加颜色到历史记录
    addToHistory(color) {
      // 验证颜色格式
      const isHex = /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
      const isRgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(color);
      
      if ((isHex || isRgb) && typeof color === 'string') {
        // 如果已存在相同颜色，先移除它
        const index = this.internalHistoryColors.indexOf(color);
        if (index !== -1) {
          this.internalHistoryColors.splice(index, 1);
        }
        
        // 将新颜色添加到数组开头
        this.internalHistoryColors.unshift(color);
        
        // 保持历史记录不超过10个
        if (this.internalHistoryColors.length > 10) {
          this.internalHistoryColors.pop();
        }
      }
    },
    
    // 解析输入颜色
    parseColor(color) {
      // 确保color是一个字符串
      if (!color || typeof color !== 'string') {
        console.warn('ColorInput: parseColor received non-string value:', color);
        color = '#000000'; // 使用默认黑色
      }
      
      // 处理hex格式
      if (color.startsWith('#')) {
        const hex = color.substring(1);
        
        // 处理不同长度的hex值
        let r, g, b, a = 1;
        
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        } else if (hex.length === 8) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
          a = parseInt(hex.substring(6, 8), 16) / 255;
        }
        
        this.rgbToHsv(r, g, b);
        this.opacity = a;
        this.rgbColor = `rgb(${r},${g},${b})`;
      }
      // 处理rgb/rgba格式
      else if (color.startsWith('rgb')) {
        const values = color.replace(/rgba?\(|\)/g, '').split(',').map(v => parseFloat(v.trim()));
        const r = values[0];
        const g = values[1];
        const b = values[2];
        const a = values.length > 3 ? values[3] : 1;
        
        this.rgbToHsv(r, g, b);
        this.opacity = a;
        this.rgbColor = `rgb(${r},${g},${b})`;
      }
      // 处理hsl/hsla格式
      else if (color.startsWith('hsl')) {
        const values = color.replace(/hsla?\(|\)/g, '').split(',').map(v => parseFloat(v.trim()));
        const h = values[0];
        // HSL中的s和l是百分比，需要转换
        let s = values[1];
        let l = values[2];
        const a = values.length > 3 ? values[3] : 1;
        
        // 如果s和l带有%符号，去掉百分号并转换为0-100
        if (typeof values[1] === 'string' && values[1].includes('%')) {
          s = parseFloat(values[1]);
        }
        if (typeof values[2] === 'string' && values[2].includes('%')) {
          l = parseFloat(values[2]);
        }
        
        // HSL转换为RGB
        const [r, g, b] = this.hslToRgb(h, s, l);
        
        this.rgbToHsv(r, g, b);
        this.opacity = a;
        this.rgbColor = `rgb(${r},${g},${b})`;
      }
      // 处理CSS颜色名称
      else {
        // 创建一个临时元素来获取计算样式
        const tempEl = document.createElement('div');
        tempEl.style.color = color;
        document.body.appendChild(tempEl);
        
        // 获取计算样式
        const computedColor = getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        
        // 解析计算样式（应为rgb格式）
        if (computedColor && computedColor.startsWith('rgb')) {
          const values = computedColor.replace(/rgba?\(|\)/g, '').split(',').map(v => parseFloat(v.trim()));
          const r = values[0];
          const g = values[1];
          const b = values[2];
          const a = values.length > 3 ? values[3] : 1;
          
          this.rgbToHsv(r, g, b);
          this.opacity = a;
          this.rgbColor = `rgb(${r},${g},${b})`;
        } else {
          // 如果无法解析，回退到默认黑色
          this.rgbToHsv(0, 0, 0);
          this.opacity = 1;
          this.rgbColor = 'rgb(0,0,0)';
        }
      }
      
      this.updateColorValue();
    },
    
    // HSL转换为RGB
    hslToRgb(h, s, l) {
      h = h % 360;
      s = s / 100;
      l = l / 100;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, (h / 360) + 1/3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, (h / 360) - 1/3);
      }
      
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    
    // RGB转换为HSL
    rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      
      if (max === min) {
        h = s = 0; // 无彩色
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        
        h = Math.round(h * 60);
      }
      
      return [h, Math.round(s * 100), Math.round(l * 100)];
    },
    
    // RGB转换为HSV
    rgbToHsv(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      
      // 计算亮度
      this.brightness = max * 100;
      
      // 计算饱和度
      this.saturation = max === 0 ? 0 : (delta / max) * 100;
      
      // 计算色相
      if (delta === 0) {
        this.hue = 0;
      } else if (max === r) {
        this.hue = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        this.hue = 60 * ((b - r) / delta + 2);
      } else {
        this.hue = 60 * ((r - g) / delta + 4);
      }
      
      if (this.hue < 0) {
        this.hue += 360;
      }
    },
    
    // HSV转换为RGB
    hsvToRgb(h, s, v) {
      s /= 100;
      v /= 100;
      
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;
      
      let r, g, b;
      
      if (h < 60) {
        [r, g, b] = [c, x, 0];
      } else if (h < 120) {
        [r, g, b] = [x, c, 0];
      } else if (h < 180) {
        [r, g, b] = [0, c, x];
      } else if (h < 240) {
        [r, g, b] = [0, x, c];
      } else if (h < 300) {
        [r, g, b] = [x, 0, c];
      } else {
        [r, g, b] = [c, 0, x];
      }
      
      return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
      ];
    },
    
    // HSV转换为HEX
    hsvToHex(h, s, v) {
      const [r, g, b] = this.hsvToRgb(h, s, v);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    },
    
    // 更新颜色值显示
    updateColorValue() {
      const [r, g, b] = this.hsvToRgb(this.hue, this.saturation, this.brightness);
      this.rgbColor = `rgb(${r},${g},${b})`;
      
      // 保存当前颜色的RGB值，方便格式转换
      const currentRGB = {r, g, b};
      const a = this.opacity;
      
      if (this.colorFormat === 'hex') {
        if (this.showOpacity && this.opacity < 1) {
          const aHex = Math.round(this.opacity * 255).toString(16).padStart(2, '0');
          this.colorValue = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${aHex}`;
        } else {
          this.colorValue = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
      } else if (this.colorFormat === 'rgb') {
        if (this.showOpacity && this.opacity < 1) {
          this.colorValue = `rgba(${r}, ${g}, ${b}, ${this.opacity.toFixed(2)})`;
        } else {
          this.colorValue = `rgb(${r}, ${g}, ${b})`;
        }
      } else if (this.colorFormat === 'hsl') {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        if (this.showOpacity && this.opacity < 1) {
          this.colorValue = `hsla(${h}, ${s}%, ${l}%, ${this.opacity.toFixed(2)})`;
        } else {
          this.colorValue = `hsl(${h}, ${s}%, ${l}%)`;
        }
      }
      
      this.displayColor = this.colorValue;
    },
    
    // 改变颜色格式
    changeColorFormat(format) {
      // 先保存当前颜色信息
      const currentColor = this.colorValue;
      
      // 设置新格式
      this.colorFormat = format;
      
      // 更新显示但保持相同颜色值
      this.updateColorValue();
      
      // 通知变化
      this.$emit('input', this.colorValue);
    },
    
    // 开始拖动色相/饱和度面板
    startHueSatDrag(event) {
      event.preventDefault();
      
      const updateHueSat = (e) => {
        const panel = this.$refs.hueSatPanel;
        const rect = panel.getBoundingClientRect();
        
        // 获取客户端坐标，支持触摸和鼠标事件
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 计算相对位置
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;
        
        // 限制范围
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        
        // UI位置更新
        this.satPos = x;
        this.brightPos = 100 - y; // 反转Y轴使顶部为最大
        
        // 饱和度是左右移动(X轴)
        this.saturation = x;
        // 亮度是上下移动(Y轴)
        this.brightness = 100 - y;
        
        this.updateColorValue();
      };
      
      updateHueSat(event);
      
      const handleMouseMove = (e) => {
        updateHueSat(e);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    },
    
    // 更新色相/饱和度面板的颜色，根据当前色相
    updateHueSatPanel() {
      if (this.$refs.hueSatPanel) {
        // 仅使用当前色相，100%饱和度和100%亮度的颜色作为基色
        const hueColor = this.hsvToHex(this.hue, 100, 100);
        this.$refs.hueSatPanel.style.background = hueColor;
        
        // 叠加的线性渐变已经在CSS中定义
        // - 从左到右：白色到透明（饱和度）
        // - 从上到下：透明到黑色（亮度）
      }
    },
    
    // 根据HSV值更新UI位置
    updatePositionsFromHSV() {
      this.huePos = 100 - (this.hue / 3.6); // 反转，使顶部为最大值
      this.satPos = this.saturation;
      this.brightPos = this.brightness;
      this.opacityPos = 100 - (this.opacity * 100); // 反转，使顶部为最大值
      
      // 更新色相/饱和度面板的背景色
      this.updateHueSatPanel();
    },
    
    // 更新HSV值
    updateHSVFromPositions() {
      this.hue = (100 - this.huePos) * 3.6;
      this.saturation = this.satPos;
      this.brightness = this.brightPos;
      this.opacity = 1 - (this.opacityPos / 100); // 反转使顶部为最大值
      
      this.updateColorValue();
      // 当色相改变时，更新面板颜色
      this.updateHueSatPanel();
    },
    
    // 开始拖动明度滑块
    startBrightnessDrag(event) {
      event.preventDefault();
      
      const updateBrightness = (e) => {
        const slider = this.$refs.brightnessSlider;
        const rect = slider.getBoundingClientRect();
        
        // 支持触摸和鼠标事件
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 计算相对位置
        let y = ((clientY - rect.top) / rect.height) * 100;
        
        // 限制范围
        y = Math.max(0, Math.min(100, y));
        
        this.brightPos = 100 - y; // 反转Y轴使顶部为最大
        
        this.updateHSVFromPositions();
      };
      
      updateBrightness(event);
      
      const handleMouseMove = (e) => {
        updateBrightness(e);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    },
    
    // 开始拖动色相滑块
    startHueDrag(event) {
      event.preventDefault();
      
      const updateHue = (e) => {
        const slider = this.$refs.hueSlider;
        const rect = slider.getBoundingClientRect();
        
        // 支持触摸和鼠标事件
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 计算相对位置（竖向）
        let y = ((clientY - rect.top) / rect.height) * 100;
        
        // 限制范围
        y = Math.max(0, Math.min(100, y));
        
        this.huePos = y;
        this.hue = (100 - y) * 3.6; // 转换为0-360度，反转使顶部为最大值
        
        // 直接更新色相并触发面板更新
        this.updateColorValue();
        this.updateHueSatPanel(); // 确保立即更新色盘
      };
      
      updateHue(event);
      
      const handleMouseMove = (e) => {
        updateHue(e);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    },
    
    // 开始拖动透明度滑块
    startOpacityDrag(event) {
      event.preventDefault();
      
      const updateOpacity = (e) => {
        const slider = this.$refs.opacitySlider;
        const rect = slider.getBoundingClientRect();
        
        // 支持触摸和鼠标事件
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 计算相对位置（竖向）
        let y = ((clientY - rect.top) / rect.height) * 100;
        
        // 限制范围
        y = Math.max(0, Math.min(100, y));
        
        this.opacityPos = y;
        this.opacity = 1 - (y / 100); // 反转使顶部为最大值
        
        this.updateHSVFromPositions();
      };
      
      updateOpacity(event);
      
      const handleMouseMove = (e) => {
        updateOpacity(e);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    },
    
    // 手动输入后更新颜色
    updateColor() {
      // 检查是否包含算术表达式
      if (/[+\-*/]/.test(this.colorValue)) {
        try {
          // 如果包含计算表达式，尝试计算RGB通道的值
          // 这个功能主要用于RGB和HSL格式的颜色输入
          if (this.colorValue.startsWith('rgb') || this.colorValue.startsWith('rgba')) {
            // 提取RGB通道值
            const rgbMatch = this.colorValue.match(/rgba?\(\s*(.*?)\s*\)/i);
            if (rgbMatch && rgbMatch[1]) {
              const channels = rgbMatch[1].split(',');
              
              // 计算每个通道的表达式
              const calculatedChannels = channels.map(channel => {
                const trimmed = channel.trim();
                if (/[+\-*/]/.test(trimmed)) {
                  try {
                    // 清理表达式，只保留数字和基本运算符
                    const cleanExpr = trimmed.replace(/[^0-9+\-*/().]/g, '');
                    const result = new Function('return ' + cleanExpr)();
                    
                    // 对于RGB通道，限制在0-255范围
                    if (channels.indexOf(channel) < 3) {
                      return Math.min(255, Math.max(0, Math.round(result)));
                    }
                    // 对于alpha通道，限制在0-1范围
                    else {
                      return Math.min(1, Math.max(0, parseFloat(result.toFixed(2))));
                    }
                  } catch (e) {
                    return trimmed; // 计算失败，保持原值
                  }
                }
                return trimmed;
              });
              
              // 重建RGB颜色字符串
              const isRgba = this.colorValue.startsWith('rgba');
              const newColor = isRgba ? 
                `rgba(${calculatedChannels.join(', ')})` : 
                `rgb(${calculatedChannels.join(', ')})`;
              
              this.colorValue = newColor;
            }
          }
          // 处理HSL格式
          else if (this.colorValue.startsWith('hsl') || this.colorValue.startsWith('hsla')) {
            // 提取HSL通道值
            const hslMatch = this.colorValue.match(/hsla?\(\s*(.*?)\s*\)/i);
            if (hslMatch && hslMatch[1]) {
              const channels = hslMatch[1].split(',');
              
              // 计算每个通道的表达式
              const calculatedChannels = channels.map((channel, index) => {
                const trimmed = channel.trim();
                if (/[+\-*/]/.test(trimmed)) {
                  try {
                    // 清理表达式，只保留数字和基本运算符
                    const cleanExpr = trimmed.replace(/[^0-9+\-*/().%]/g, '').replace(/%/g, '');
                    const result = new Function('return ' + cleanExpr)();
                    
                    if (index === 0) { // H值，0-360
                      return Math.round(result) % 360;
                    } else if (index < 3) { // S和L值，0-100%
                      return Math.min(100, Math.max(0, Math.round(result))) + '%';
                    } else { // alpha通道，0-1
                      return Math.min(1, Math.max(0, parseFloat(result.toFixed(2))));
                    }
                  } catch (e) {
                    return trimmed; // 计算失败，保持原值
                  }
                }
                return trimmed;
              });
              
              // 重建HSL颜色字符串
              const isHsla = this.colorValue.startsWith('hsla');
              const newColor = isHsla ? 
                `hsla(${calculatedChannels.join(', ')})` : 
                `hsl(${calculatedChannels.join(', ')})`;
              
              this.colorValue = newColor;
            }
          }
        } catch (e) {
          // 表达式计算失败，继续使用原有逻辑
          console.error("Color expression calculation failed:", e);
        }
      }
      
      // 原有的颜色验证逻辑
      const isHex = /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(this.colorValue);
      const isRgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(this.colorValue);
      const isHsl = /^hsla?\(|\)$/i.test(this.colorValue); // 检查是否是HSL格式
      
      if (isHex || isRgb || isHsl) {
        this.parseColor(this.colorValue);
        this.displayColor = this.colorValue;
        
        // 添加到历史记录
        if (!this.historyColors || this.historyColors.length === 0) {
          this.addToHistory(this.colorValue);
        }
        
        this.$emit('input', this.colorValue);
        this.$emit('change', this.colorValue);
      } else {
        // 恢复为有效颜色
        this.colorValue = this.displayColor;
      }
    },
    
    // 选择历史颜色
    selectHistoryColor(color) {
      if (color && typeof color === 'string') {
        this.parseColor(color);
        this.colorValue = color;
        this.displayColor = color;
        this.$emit('input', color);
        this.$emit('change', color);
      }
    },

    // 调整透明度
    adjustOpacity(delta) {
      const newOpacity = this.opacity + delta * 0.01; // 每次调整1%
      this.opacity = Math.max(0, Math.min(1, newOpacity));
      this.opacityPos = (1 - this.opacity) * 100; // 反转使顶部为最大值
      this.updateColorValue();
    }
  }
};
</script>

<style scoped>
.color-input-container {
  display: flex;
  position: relative;
  height: 20px;
  width: 100px; /* 增加宽度以容纳新按钮 */
}

.color-preview {
  width: 30px;
  height: 20px;
  cursor: pointer;
  border: 1px solid #1a1a1a;
  background-image: linear-gradient(45deg, #aaa 25%, transparent 25%),
                    linear-gradient(-45deg, #aaa 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #aaa 75%),
                    linear-gradient(-45deg, transparent 75%, #aaa 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
}

.color-value-input {
  flex-grow: 1;
  height: 20px;
  background-color: #2c2c2c;
  border: none;
  font-size: 12px;
  text-align: center;
  padding: 0;
  margin: 0;
  color: #ccc;
  outline: none;
}

/* 激活颜色选择器按钮样式 */
.activate-picker-button {
  width: 20px;
  height: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-preview-button {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid white;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}

.activate-picker-button:hover .color-preview-button {
  transform: scale(1.1);
}

.color-value-input:focus {
  background-color: #3a3a3a;
  color: #fff;
}

/* 颜色选择器样式 */
.color-picker-container {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 340px;
  background-color: #2c2c2c;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 10px;
}

/* 响应式布局 - 小屏幕设备 */
@media (max-width: 480px) {
  .color-picker-container {
    width: 280px;
    padding: 8px;
  }
  
  .hue-saturation-panel {
    width: 220px;
    height: 140px;
  }
  
  .color-picker-main {
    flex-direction: column;
  }
  
  .brightness-slider-container {
    margin-left: 0;
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
  
  .brightness-slider {
    width: 220px;
    height: 20px;
  }
  
  .brightness-thumb {
    width: 5px;
    height: 100%;
    left: auto;
    transform: translateX(-50%);
  }
  
  .opacity-slider {
    width: 160px;
  }
}

.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #ccc;
  font-size: 14px;
  padding: 0 5px;
}

.close-button {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.close-button:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 修改主色区域布局 */
.color-picker-main {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  gap: 5px; /* 减小间距 */
}

/* 右侧控制区 */
.controls-container {
  display: flex;
  flex-direction: row; /* 改为水平排列 */
  gap: 4px; /* 减小间距 */
}

/* 色相/饱和度面板 */
.hue-saturation-panel {
  position: relative;
  width: 260px;
  height: 180px;
  background: #ff0000; /* 固定为红色，通过色相滑块改变 */
  cursor: crosshair;
  border-radius: 4px;
  overflow: hidden;
}

.hue-saturation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #fff, transparent),
              linear-gradient(to bottom, transparent, #000);
}

.hue-saturation-thumb {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px #000;
  pointer-events: none;
}

/* 明度滑块 */
.brightness-slider,
.hue-slider,
.opacity-slider {
  position: relative;
  height: 180px;
  width: 20px;
  cursor: ns-resize;
  border-radius: 10px;
  overflow: hidden;
}

/* 统一轨道样式 */
.brightness-track,
.hue-track,
.opacity-track {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

/* 统一滑块按钮样式 */
.brightness-thumb,
.hue-thumb,
.opacity-thumb {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px; /* 更小的滑块高度 */
  background-color: #fff;
  border: 1px solid #000;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 彩虹色带 - 修改为竖向 */
.hue-slider {
  position: relative;
  height: 180px;
  width: 20px;
  cursor: ns-resize;
  border-radius: 10px;
  overflow: hidden;
}

.hue-track {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    #FF0000, #FFFF00, #00FF00, 
    #00FFFF, #0000FF, #FF00FF, #FF0000);
  border-radius: 10px;
}

.hue-thumb {
  position: absolute;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: #fff;
  border: 1px solid #000;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 透明度滑块 - 修改为竖向 */
.opacity-slider {
  position: relative;
  height: 180px;
  width: 20px;
  cursor: ns-resize;
  border-radius: 10px;
  overflow: hidden;
}

.opacity-track {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  overflow: hidden;
}

.opacity-thumb {
  position: absolute;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: #fff;
  border: 1px solid #000;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 颜色格式控制 */
.color-format-controls {
  display: flex;
  margin-bottom: 10px;
}

.color-format-option {
  margin-right: 15px;
  color: #ccc;
  font-size: 12px;
}

.color-format-option label {
  cursor: pointer;
}

/* 透明度控制 */
.opacity-control {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #ccc;
  font-size: 12px;
}

.opacity-label {
  width: 60px;
}

.opacity-value {
  width: 40px;
  text-align: right;
  margin-left: 5px;
}

/* 底部按钮 */
.color-picker-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

/* 历史颜色 */
.history-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
  justify-content: center;
}

.history-color {
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
}

.history-color-preview {
  width: 100%;
  height: 100%;
  border: 1px solid #1a1a1a;
  background-image: linear-gradient(45deg, #aaa 25%, transparent 25%),
                   linear-gradient(-45deg, #aaa 25%, transparent 25%),
                   linear-gradient(45deg, transparent 75%, #aaa 75%),
                   linear-gradient(-45deg, transparent 75%, #aaa 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
}

.history-color-value {
  font-size: 9px;
  color: #ccc;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cancel-button, .confirm-button {
  padding: 5px 10px;
  margin-left: 5px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.cancel-button {
  background-color: #444;
  color: #ccc;
}

.confirm-button {
  background-color: #3a7def;
  color: #fff;
}

.cancel-button:hover {
  background-color: #555;
}

.confirm-button:hover {
  background-color: #4a8dff;
}
</style>