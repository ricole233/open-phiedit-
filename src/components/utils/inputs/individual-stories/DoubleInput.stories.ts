import { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import DoubleInput from '../DoubleInput.vue';
import DoubleInputMultiTest from './DoubleInputMultiTest.vue';

const meta = {
  title: 'Inputs/DoubleInput',
  component: DoubleInput,
  tags: ['autodocs'],
  argTypes: {
    value: { 
      control: { type: 'array' }, 
      description: '二维向量值 [x, y]' 
    },
    minX: { 
      control: { type: 'number' }, 
      description: 'X值的最小值' 
    },
    maxX: { 
      control: { type: 'number' }, 
      description: 'X值的最大值' 
    },
    minY: { 
      control: { type: 'number' }, 
      description: 'Y值的最小值' 
    },
    maxY: { 
      control: { type: 'number' }, 
      description: 'Y值的最大值' 
    },
    step: { 
      control: { type: 'number' }, 
      description: '拖动调整时的步长' 
    },
    precision: { 
      control: { type: 'number' }, 
      description: '显示的小数位数' 
    },
    chainRatio: { 
      control: { type: 'boolean' }, 
      description: '是否锁定XY比例' 
    },
  }
} satisfies Meta<typeof DoubleInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: [0, 0],
    minX: -100,
    maxX: 100,
    minY: -100,
    maxY: 100,
    step: 1,
    precision: 1,
    chainRatio: false
  }
};

export const WithchainRatio: Story = {
  args: {
    value: [100, 50],
    minX: 0,
    maxX: 500,
    minY: 0,
    maxY: 500,
    step: 1,
    precision: 0,
    chainRatio: true
  }
};

export const Interactive = {
  render: (args: Record<string, any>) => ({
    components: { DoubleInput },
    setup() {
      const value = ref<[number, number]>([50, 50]);
      const minX = ref(0);
      const maxX = ref(200);
      const minY = ref(0);
      const maxY = ref(200);
      const step = ref(1);
      const precision = ref(1);
      const chainRatio = ref(false);

      const onInput = (newValue: [number, number]) => {
        console.log('Input:', newValue);
        value.value = newValue;
      };

      const onchainRatioChange = () => {
        chainRatio.value = !chainRatio.value;
      };

      return { 
        value, 
        minX, 
        maxX, 
        minY, 
        maxY, 
        step, 
        precision, 
        chainRatio,
        onInput,
        onchainRatioChange
      };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <h3 style="margin-bottom: 15px; color: #ddd;">二维输入组件交互示例</h3>
        
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 100px;">值 [x, y]:</label>
            <DoubleInput 
              :value="value" 
              :minX="minX" 
              :maxX="maxX" 
              :minY="minY" 
              :maxY="maxY" 
              :step="step" 
              :precision="precision" 
              :chainRatio="chainRatio"
              @input="onInput" 
            />
          </div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 100px;">当前值:</label>
            <span>{{ value }}</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="width: 100px;">锁定比例:</label>
            <input type="checkbox" :checked="chainRatio" @change="onchainRatioChange" />
          </div>
          
          <div style="margin-top: 20px;">
            <p>使用方法:</p>
            <ul style="margin-left: 20px;">
              <li>鼠标左右拖动可调整数值</li>
              <li>按住 Shift 键拖动可进行大范围调整</li>
              <li>按住 Ctrl 键拖动可进行精细调整</li>
              <li>双击可直接编辑数值</li>
              <li>勾选"锁定比例"后，调整一个值会按比例调整另一个值</li>
            </ul>
          </div>
        </div>
      </div>
    `
  })
};

// 添加多控件测试故事
export const MultipleControls = {
  render: () => ({
    components: { DoubleInputMultiTest },
    template: '<DoubleInputMultiTest />'
  })
};