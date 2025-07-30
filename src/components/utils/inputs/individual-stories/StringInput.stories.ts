import type { Meta, StoryObj } from '@storybook/vue3';
import StringInput from '../StringInput.vue';

// 定义组件的元数据
const meta: Meta<typeof StringInput> = {
  title: 'Inputs/StringInput',
  component: StringInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text', description: '输入框的值' },
    'update:modelValue': { action: '值已更新' }
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div style="padding: 20px; background-color: #232323;"><story /></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof StringInput>;

// 基本用法
export const 默认: Story = {
  args: {
    modelValue: '默认文本',
  },
};

// 空值示例
export const 空值: Story = {
  args: {
    modelValue: '',
  },
};

// 长文本示例
export const 长文本: Story = {
  args: {
    modelValue: '这是一段非常长的文本，用来测试输入框的显示效果和溢出处理',
  },
};

// 禁用状态
export const 禁用状态: Story = {
  args: {
    modelValue: '禁用状态',
  },
  render: (args) => ({
    components: { StringInput },
    setup() {
      return { args };
    },
    template: `
      <div>
        <StringInput v-bind="args" disabled />
      </div>
    `,
  }),
};

