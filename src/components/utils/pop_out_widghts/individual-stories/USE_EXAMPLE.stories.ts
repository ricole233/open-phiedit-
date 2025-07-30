import { Meta, StoryObj } from '@storybook/vue3';
import UseExample from './USE_EXAMPLE.vue';

const meta: Meta<typeof UseExample> = {
  title: '弹出窗口/弹出窗口示例',
  component: UseExample,
  tags: ['autodocs'],
  argTypes: {
    buttonText: { 
      control: 'text',
      description: '按钮文本'
    },
    windowTitle: { 
      control: 'text',
      description: '窗口标题'
    },
    windowWidth: { 
      control: { type: 'number', min: 200, max: 800, step: 10 },
      description: '窗口宽度'
    },
    windowHeight: { 
      control: { type: 'number', min: 150, max: 600, step: 10 },
      description: '窗口高度'
    },
    windowInitialX: { 
      control: { type: 'number', min: 0, max: 500, step: 10 },
      description: '窗口初始X坐标'
    },
    windowInitialY: { 
      control: { type: 'number', min: 0, max: 500, step: 10 },
      description: '窗口初始Y坐标'
    }
  },
};

export default meta;
type Story = StoryObj<typeof UseExample>;

// 默认使用案例
export const Default: Story = {
  args: {
    buttonText: '打开窗口',
    windowTitle: '示例窗口',
    windowWidth: 500,
    windowHeight: 400,
    windowInitialX: 100,
    windowInitialY: 100,
  },
};

// 自定义按钮文本
export const CustomButton: Story = {
  args: {
    buttonText: '点击弹出AE风格窗口',
    windowTitle: '自定义窗口',
    windowWidth: 550,
    windowHeight: 450,
    windowInitialX: 150,
    windowInitialY: 150,
  },
};

// 不同尺寸窗口
export const SmallWindow: Story = {
  args: {
    buttonText: '打开小窗口',
    windowTitle: '小窗口',
    windowWidth: 300,
    windowHeight: 250,
    windowInitialX: 200,
    windowInitialY: 200,
  },
};

export const LargeWindow: Story = {
  args: {
    buttonText: '打开大窗口',
    windowTitle: '大窗口',
    windowWidth: 700,
    windowHeight: 550,
    windowInitialX: 50,
    windowInitialY: 50,
  },
};
