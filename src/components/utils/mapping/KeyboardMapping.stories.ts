import type { Meta, StoryObj } from '@storybook/vue3';
import KeyboardMapping from './KeyboardMapping.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const meta: Meta<typeof KeyboardMapping> = {
  title: '组件/键盘映射',
  component: KeyboardMapping,
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="margin: 3em;"><story /></div>',
      setup() {
        return {};
      }
    })
  ],
  parameters: {
    layout: 'centered',
  },
  // 为故事注册 Element Plus 插件
  render: (args) => ({
    components: { KeyboardMapping },
    setup() {
      return { args };
    },
    template: '<keyboard-mapping />',
  }),
};

export default meta;
type Story = StoryObj<typeof KeyboardMapping>;

// 默认状态
export const 默认: Story = {}; 