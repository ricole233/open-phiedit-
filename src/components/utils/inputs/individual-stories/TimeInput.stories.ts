import { Meta, StoryObj } from '@storybook/vue3';
import TimeInput from '../TimeInput.vue';

const meta: Meta<typeof TimeInput> = {
  title: 'Inputs/TimeInput',
  component: TimeInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number', description: '时间值' },
    min: { control: 'number', description: '最小时间' },
    max: { control: 'number', description: '最大时间' },
    step: { control: 'number', description: '步长' },
    precision: { control: 'number', description: '小数位数' },
    showHours: { control: 'boolean', description: '显示小时' },
    showMinutes: { control: 'boolean', description: '显示分钟' },
    showSeconds: { control: 'boolean', description: '显示秒' },
    showMilliseconds: { control: 'boolean', description: '显示毫秒' },
    showUnitToggle: { control: 'boolean', description: '显示毫秒/帧切换按钮' },
    frameRate: { control: 'number', description: '帧率' }
  },
  parameters: {
    componentSubtitle: '可拖拽调整的时间输入组件',
    docs: {
      description: {
        component: '模仿AE的时间输入组件，支持小时、分钟、秒显示，以及拖拽调整功能。'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 12,
    min: 0,
    max: 360000,
    step: 1,
    precision: 1,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    showMilliseconds: true,
    showUnitToggle: true,
    frameRate: 30
  },
  render: (args) => ({
    components: { TimeInput },
    setup() {
      return { args };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <TimeInput 
          :value="args.value"
          :min="args.min"
          :max="args.max"
          :step="args.step"
          :precision="args.precision"
          :showHours="args.showHours"
          :showMinutes="args.showMinutes"
          :showSeconds="args.showSeconds"
          :showMilliseconds="args.showMilliseconds"
          :showUnitToggle="args.showUnitToggle"
          :frameRate="args.frameRate"
          @input="onInput"
          @change="onValueChange"
        />
        <div style="margin-top: 15px; font-family: monospace; color: #aaa;">
          当前值: {{ args.value }} (内部值)
        </div>
        <input v-model="args.value" />
      </div>
    `,
    methods: {
      onInput(val: number) {
        this.args.value = val;
      },
      onValueChange(val: number) {
        console.log('时间已更改:', val);
      }
    }
  })
};


export const Interactive: Story = {
  render: () => ({
    components: { TimeInput },
    data() {
      return {
        angle: 45
      };
    },
    template: `
      <div style="padding: 20px; background-color: #1e1e1e; color: #eee;">
        <h3 style="margin-bottom: 15px; color: #ddd;">时间输入交互示例</h3>
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <TimeInput 
            :value="angle"
            :min="-1080"
            :max="1080"
            :step="1"
            :precision="1"
            :showHours="true"
            :showMinutes="true"
            :showSeconds="true"
            :showMilliseconds="true"
            :showUnitToggle="true"
            :frameRate="30"
          />
          <div style="margin-left: 15px; font-family: monospace;">当前值: {{ angle }} (内部值)</div>
        </div>
        
        <div style="margin-top: 10px; margin-bottom: 20px;">
          <button @click="angle = 45" style="padding: 5px 10px; background: #444; border: none; color: #fff; cursor: pointer; margin-right: 8px;">45</button>
        </div>
        
        <div style="margin-top: 20px;">
          <h4 style="color: #ccc; margin-bottom: 10px;">特点:</h4>
          <ul style="color: #aaa; padding-left: 20px;">
            <li>按住 <b style="color: #fff;">Shift</b> 键拖动可快速调整时间</li>
            <li>按住 <b style="color: #fff;">Ctrl</b> 键拖动可精细调整时间</li>
            <li>毫秒和帧数显示可以通过点击切换按钮进行切换</li>
          </ul>
        </div>
      </div>
    `
  })
}; 