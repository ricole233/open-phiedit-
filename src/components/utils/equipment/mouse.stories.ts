import type { Meta, StoryObj } from '@storybook/vue3';
import Mouse from './Mouse.vue';

const meta: Meta<typeof Mouse> = {
  title: '设备/鼠标测试',
  component: Mouse,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="margin: 3em;"><story /></div>',
      setup() {
        return {};
      }
    })
  ]
};

export default meta;
type Story = StoryObj<typeof Mouse>;

// 默认状态
export const 默认: Story = {}; 