import type { Meta, StoryObj } from '@storybook/vue3';
import MixNumber from '../MixNumber.vue';
import { ref } from 'vue';

// 元数据配置
const meta = {
  title: 'Inputs/MixNumber',
  component: MixNumber,
  tags: ['autodocs'],
} satisfies Meta<typeof MixNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
export const Default: Story = {
  render: (args) => ({
    components: { MixNumber },
    setup() {
      const value = ref(2.5);
      return { ...args, value };
    },
    template: `
      <div>
        <MixNumber v-model="value" />
        <div style="margin-top: 10px;">
          <input type="number" v-model="value" step="0.01" style="width: 100px;" />
          <span style="margin-left: 10px;">当前值: {{ value }}</span>
        </div>
      </div>
    `
  })
};

// 零值
export const Zero: Story = {
  render: (args) => ({
    components: { MixNumber },
    setup() {
      const value = ref(0);
      return { ...args, value };
    },
    template: `
      <div>
        <MixNumber v-model="value" />
        <div style="margin-top: 10px;">
          <input type="number" v-model="value" step="0.01" style="width: 100px;" />
          <span style="margin-left: 10px;">当前值: {{ value }}</span>
        </div>
      </div>
    `
  })
};

// 负值
export const Negative: Story = {
  render: (args) => ({
    components: { MixNumber },
    setup() {
      const value = ref(-3.25);
      return { ...args, value };
    },
    template: `
      <div>
        <MixNumber v-model="value" />
        <div style="margin-top: 10px;">
          <input type="number" v-model="value" step="0.01" style="width: 100px;" />
          <span style="margin-left: 10px;">当前值: {{ value }}</span>
        </div>
      </div>
    `
  })
};

// 大分数
export const LargeFraction: Story = {
  render: (args) => ({
    components: { MixNumber },
    setup() {
      const value = ref(1.75);
      return { ...args, value };
    },
    template: `
      <div>
        <MixNumber v-model="value" />
        <div style="margin-top: 10px;">
          <input type="number" v-model="value" step="0.01" style="width: 100px;" />
          <span style="margin-left: 10px;">当前值: {{ value }}</span>
        </div>
      </div>
    `
  })
};
