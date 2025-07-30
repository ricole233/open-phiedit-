import { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import ValueInput from '../ValueInput.vue';

const meta: Meta<typeof ValueInput> = {
  title: 'Inputs/ValueInput',
  component: ValueInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'number', description: '输入值' },
    min: { control: 'number', description: '最小值' },
    max: { control: 'number', description: '最大值' },
    step: { control: 'number', description: '步长' },
    precision: { control: 'number', description: '小数位数' }
  },
  parameters: {
    componentSubtitle: '可拖拽调整的数值输入组件',
    docs: {
      description: {
        component: '模仿AE的数值输入组件，支持拖拽调整值、按住特殊按键修饰调整灵敏度。'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    modelValue: 50,
    min: 0,
    max: 100,
    step: 1,
    precision: 0
  },
  render: (args) => ({
    components: { ValueInput },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <ValueInput 
          v-model="value"
          :min="args.min"
          :max="args.max"
          :step="args.step"
          :precision="args.precision"
        />
        <div style="margin-top: 15px; font-family: monospace; color: #aaa;">
          当前值: {{ value }}
        </div>
        <input v-model="value" />
      </div>
    `
  })
};

export const Decimal: Story = {
  args: {
    modelValue: 3.14,
    min: -10,
    max: 10,
    step: 0.01,
    precision: 2
  }
};

export const Interactive: Story = {
  render: () => ({
    components: { ValueInput },
    data() {
      return {
        value: 50
      };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <h3 style="margin-bottom: 15px; color: #ddd;">数值输入交互示例</h3>
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <ValueInput 
            v-model="value"
            :min="0"
            :max="100"
            :step="0.5"
            :precision="1"
          />
          <div style="margin-left: 15px; font-family: monospace;">当前值: {{ value }}</div>
        </div>
        <div style="margin-top: 20px;">
          <h4 style="color: #ccc; margin-bottom: 10px;">交互方式:</h4>
          <ul style="color: #aaa; padding-left: 20px;">
            <li>直接输入数值</li>
            <li>拖动以调整值（鼠标悬停时显示拖动指示器）</li>
            <li>按住 <b style="color: #fff;">Shift</b> 键拖动可快速调整值</li>
            <li>按住 <b style="color: #fff;">Ctrl</b> 键拖动可精细调整值</li>
          </ul>
        </div>
      </div>
    `
  })
}; 