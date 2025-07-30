import type { Meta, StoryObj } from '@storybook/vue3';
import { action } from '@storybook/addon-actions';

import LoadProject from '../LoadProject.vue';

// 元数据，定义组件以及如何在Storybook中显示它
const meta = {
  title: 'Components/PopOutWidgets/Projects/LoadProject',
  component: LoadProject,
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'close' },
    'onLoad-complete': { action: 'load-complete' },
    'onLoad-error': { action: 'load-error' }
  },
  // 为组件添加装饰器，使其在暗色背景下显示，模拟应用环境
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <div style="background-color: #1e1e1e; padding: 1rem; width: 600px; height: 500px; position: relative;">
          <story />
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof LoadProject>;

export default meta;

// 定义组件的各种状态（stories）
type Story = StoryObj<typeof meta>;

// 默认状态：展示基本的加载项目对话框
export const Default: Story = {
  args: {
    // 默认参数，可在Storybook中调整
  },
  render: (args) => ({
    components: { LoadProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onLoadComplete = (project) => action('load-complete')(project);
      const onLoadError = (error) => action('load-error')(error);
      
      return { args, onClose, onLoadComplete, onLoadError };
    },
    template: `
      <LoadProject 
        @close="onClose" 
        @load-complete="onLoadComplete"
        @load-error="onLoadError"
      />
    `,
  }),
};

// 加载中状态：展示加载进度条的状态
export const Loading: Story = {
  args: {
    // 默认参数，可在Storybook中调整
  },
  render: (args) => ({
    components: { LoadProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onLoadComplete = (project) => action('load-complete')(project);
      const onLoadError = (error) => action('load-error')(error);
      
      return { args, onClose, onLoadComplete, onLoadError };
    },
    template: `
      <LoadProject 
        @close="onClose" 
        @load-complete="onLoadComplete"
        @load-error="onLoadError"
        ref="loadProjectRef"
      />
    `,
    mounted() {
      // 模拟加载状态
      setTimeout(() => {
        if (this.$refs.loadProjectRef) {
          this.$refs.loadProjectRef.isLoading = true;
          this.$refs.loadProjectRef.loadProgress = 50;
          this.$refs.loadProjectRef.loadProgressText = '正在加载项目...50%';
        }
      }, 200);
    }
  }),
};

// 错误状态：展示加载错误的状态
export const Error: Story = {
  args: {
    // 默认参数，可在Storybook中调整
  },
  render: (args) => ({
    components: { LoadProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onLoadComplete = (project) => action('load-complete')(project);
      const onLoadError = (error) => action('load-error')(error);
      
      return { args, onClose, onLoadComplete, onLoadError };
    },
    template: `
      <LoadProject 
        @close="onClose" 
        @load-complete="onLoadComplete"
        @load-error="onLoadError"
        ref="loadProjectRef"
      />
    `,
    mounted() {
      // 模拟错误状态
      setTimeout(() => {
        if (this.$refs.loadProjectRef) {
          this.$refs.loadProjectRef.errorMessage = '加载项目失败：找不到指定的文件';
        }
      }, 200);
    }
  }),
}; 