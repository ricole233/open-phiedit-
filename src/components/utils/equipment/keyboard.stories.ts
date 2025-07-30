import type { Meta, StoryObj } from '@storybook/vue3';
import Keyboard from './Keyboard.vue';
import { ref } from 'vue';

const meta: Meta<typeof Keyboard> = {
  title: '设备/键盘测试',
  component: Keyboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="margin: 3em; max-width: 800px;"><story /></div>',
      setup() {
        return {};
      }
    })
  ]
};

export default meta;
type Story = StoryObj<typeof Keyboard>;

// 默认状态
export const 默认: Story = {};

// 自定义热更新测试版本
export const 交互测试: Story = {
  render: () => ({
    components: { Keyboard },
    template: `
      <div>
        <Keyboard />
        <div style="margin-top: 20px; color: white; background-color: #333; padding: 10px; border-radius: 4px;">
          <p>热更新测试区域 - {{timestamp}}</p>
          <p>您可以在此处更改代码并查看热更新效果</p>
        </div>
      </div>
    `,
    setup() {
      const timestamp = ref(new Date().toLocaleTimeString());
      return { timestamp };
    }
  })
}; 