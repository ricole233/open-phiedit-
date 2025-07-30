import { Meta, StoryObj } from '@storybook/vue3';
import ColorInput from '../ColorInput.vue';

const meta = {
  title: 'Inputs/ColorInput',
  component: ColorInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'color', description: '颜色值' },
    showOpacity: { control: 'boolean', description: '显示透明度控制' },
    historyColors: { control: 'array', description: '历史颜色记录' },
    isShowHistory: { control: 'boolean', description: '是否显示历史颜色' },
    isShowColorPicker: { control: 'boolean', description: '是否显示颜色选择器' },
  },
  parameters: {
    docs: {
      description: {
        component: '颜色选择器组件，支持HEX和RGB颜色格式，带有历史记录和透明度控制功能。'
      }
    }
  }
} satisfies Meta<typeof ColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
export const Default: Story = {
  args: {
    value: '#3a7def',
    isShowColorPicker: false,
    isShowHistory: true
  }
};

// 带透明度控制
export const WithOpacity: Story = {
  args: {
    value: '#3a7def80',
    showOpacity: true,
    isShowColorPicker: false,
    isShowHistory: true
  }
};

// 带历史记录
export const WithHistory: Story = {
  args: {
    value: '#3a7def',
    historyColors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
    isShowColorPicker: false,
    isShowHistory: true
  }
};

// 显示颜色选择器
export const WithColorPicker: Story = {
  args: {
    value: '#3a7def',
    isShowColorPicker: true,
    isShowHistory: true
  }
};

// 交互示例
export const Interactive: Story = {
  render: () => ({
    components: { ColorInput },
    data() {
      return {
        currentColor: '#3a7def',
        colorHistory: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']
      };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <h3 style="margin-bottom: 15px; color: #ddd;">颜色输入交互示例</h3>
        
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <ColorInput
            :value="currentColor"
            :historyColors="colorHistory"
            :isShowHistory="true"
            :isShowColorPicker="true"
            @input="onColorChange"
            @change="onColorConfirm"
          />
          <div style="margin-left: 15px; font-family: monospace;">
            当前值: {{ currentColor }}
          </div>
        </div>
        
        <div style="width: 100px; height: 100px; border: 1px solid #444;" 
             :style="{ backgroundColor: currentColor }"></div>
             
        <div style="margin-top: 15px; color: #aaa; font-size: 13px;">
          <p>点击色块打开颜色选择器，支持HSV和RGB格式。</p>
        </div>
      </div>
    `,
    methods: {
      onColorChange(color: string) {
        this.currentColor = color;
      },
      onColorConfirm(color: string) {
        console.log('颜色已确认:', color);
        
        // 添加到历史记录
        if (!this.colorHistory.includes(color)) {
          this.colorHistory.unshift(color);
          if (this.colorHistory.length > 10) {
            this.colorHistory.pop();
          }
        }
      }
    }
  })
};

// 移动设备响应式展示
export const MobileResponsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  render: () => ({
    components: { ColorInput },
    data() {
      return {
        currentColor: '#3a7def',
        colorHistory: ['#FF5733', '#33FF57', '#3357FF']
      };
    },
    template: `
      <div style="padding: 10px; background-color:rgb(30, 30, 30); color: #eee; max-width: 320px; margin: 0 auto;">
        <h3 style="margin-bottom: 15px; color: #ddd; font-size: 14px;">移动端颜色选择器</h3>
        
        <div style="margin-bottom: 15px;">
          <ColorInput
            :value="currentColor"
            :historyColors="colorHistory"
            :showOpacity="true"
            :isShowHistory="true"
            :isShowColorPicker="true"
            @input="onColorChange"
            @change="onColorConfirm"
          />
          <div style="margin-top: 10px; font-family: monospace; font-size: 12px;">
            当前值: {{ currentColor }}
          </div>
        </div>
        
        <div style="width: 80px; height: 80px; border: 1px solid #444;" 
             :style="{ backgroundColor: currentColor }"></div>
             
        <div style="margin-top: 15px; color: #aaa; font-size: 12px;">
          <p>移动设备上的颜色选择器展示</p>
        </div>
      </div>
    `,
    methods: {
      onColorChange(color: string) {
        this.currentColor = color;
      },
      onColorConfirm(color: string) {
        console.log('颜色已确认:', color);
        
        if (!this.colorHistory.includes(color)) {
          this.colorHistory.unshift(color);
          if (this.colorHistory.length > 3) {
            this.colorHistory.pop();
          }
        }
      }
    }
  })
};

// 带下拉按钮激活颜色选择器
export const WithButton: Story = {
  render: () => ({
    components: { ColorInput },
    data() {
      return {
        currentColor: '#3a7def',
        colorHistory: ['#FF5733', '#33FF57', '#3357FF']
      };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <h3 style="margin-bottom: 15px; color: #ddd;">通过按钮激活颜色选择器</h3>
        
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <ColorInput
            :value="currentColor"
            :historyColors="colorHistory"
            :isShowHistory="true"
            :isShowColorPicker="false"
            @input="onColorChange"
            @change="onColorConfirm"
          />
          <div style="margin-left: 15px; font-family: monospace;">
            点击下拉箭头按钮可打开颜色选择器
          </div>
        </div>
        
        <div style="width: 100px; height: 100px; border: 1px solid #444;" 
             :style="{ backgroundColor: currentColor }"></div>
      </div>
    `,
    methods: {
      onColorChange(color: string) {
        this.currentColor = color;
      },
      onColorConfirm(color: string) {
        if (!this.colorHistory.includes(color)) {
          this.colorHistory.unshift(color);
          if (this.colorHistory.length > 5) {
            this.colorHistory.pop();
          }
        }
      }
    }
  })
};
