import { Meta, StoryObj } from '@storybook/vue3';
import AngleInput from '../AngleInput.vue';

const meta: Meta<typeof AngleInput> = {
  title: 'Inputs/AngleInput',
  component: AngleInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number', description: '角度值' },
    min: { control: 'number', description: '最小角度' },
    max: { control: 'number', description: '最大角度' },
    step: { control: 'number', description: '步长' },
    precision: { control: 'number', description: '小数位数' },
    showDegreeSymbol: { control: 'boolean', description: '显示度数符号' }
  },
  parameters: {
    componentSubtitle: '可拖拽调整的角度输入组件',
    docs: {
      description: {
        component: '模仿AE的角度输入组件，支持圈数+角度显示，以及拖拽调整功能。'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 45,
    min: -360,
    max: 360,
    step: 1,
    precision: 1,
    showDegreeSymbol: true
  },
  render: (args) => ({
    components: { AngleInput },
    setup() {
      return { args };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <AngleInput 
          :value="args.value"
          :min="args.min"
          :max="args.max"
          :step="args.step"
          :precision="args.precision"
          :showDegreeSymbol="args.showDegreeSymbol"
          @input="onInput"
          @change="onValueChange"
        />
        <div style="margin-top: 15px; font-family: monospace; color: #aaa;">
          当前值: {{ args.value }}° (内部值)
        </div>
      </div>
    `,
    methods: {
      onInput(val) {
        this.args.value = val;
      },
      onValueChange(val) {
        console.log('角度已更改:', val);
      }
    }
  })
};

export const MultiTurn: Story = {
  args: {
    value: 720, // 2圈
    min: -1080,
    max: 1080,
    step: 1,
    precision: 1,
    showDegreeSymbol: true
  }
};

export const Interactive: Story = {
  render: () => ({
    components: { AngleInput },
    data() {
      return {
        angle: 45
      };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <h3 style="margin-bottom: 15px; color: #ddd;">角度输入交互示例</h3>
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <AngleInput 
            v-model="angle"
            :min="-1080"
            :max="1080"
            :step="1"
            :precision="1"
          />
          <div style="margin-left: 15px; font-family: monospace;">当前值: {{ angle }}° (内部值)</div>
        </div>
        
        <div style="margin-top: 10px; margin-bottom: 20px;">
          <button @click="angle = 45" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer; margin-right: 8px;">45°</button>
          <button @click="angle = 90" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer; margin-right: 8px;">90°</button>
          <button @click="angle = 180" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer; margin-right: 8px;">180°</button>
          <button @click="angle = 360" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer; margin-right: 8px;">360°</button>
          <button @click="angle = 720" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer; margin-right: 8px;">720°</button>
          <button @click="angle = -360" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer;">-360°</button>
        </div>
        
        <div style="margin-top: 20px;">
          <h4 style="color: #ccc; margin-bottom: 10px;">特点:</h4>
          <ul style="color: #aaa; padding-left: 20px;">
            <li>角度超过 ±360° 时显示圈数+角度，例如 "2x+45°"</li>
            <li>支持直接输入角度或圈数+角度格式（例如 "2x+45"）</li>
            <li>按住 <b style="color: #fff;">Shift</b> 键拖动可快速调整角度</li>
            <li>按住 <b style="color: #fff;">Ctrl</b> 键拖动可精细调整角度</li>
          </ul>
        </div>
      </div>
    `
  })
}; 