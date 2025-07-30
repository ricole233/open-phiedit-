import type { Meta, StoryObj } from '@storybook/vue3';
import { action } from '@storybook/addon-actions';

import SaveProject from '../SaveProject.vue';

// 元数据，定义组件以及如何在Storybook中显示它
const meta = {
  title: 'Components/PopOutWidgets/Projects/SaveProject',
  component: SaveProject,
  tags: ['autodocs'],
  argTypes: {
    // 直接使用字符串定义事件处理函数，而不是对象
    close: { action: 'close' },
    'save-complete': { action: 'save-complete' },
    'save-error': { action: 'save-error' }
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
} satisfies Meta<typeof SaveProject>;

export default meta;

// 定义组件的各种状态（stories）
type Story = StoryObj<typeof meta>;

// 默认状态：新项目保存
export const NewSave: Story = {
  args: {
    isNewSave: true,
    projectId: 'project-123',
  },
  render: (args) => ({
    components: { SaveProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onSaveComplete = (data: { path: string, name: string }) => action('save-complete')(data);
      const onSaveError = (error: Error) => action('save-error')(error);
      
      return { args, onClose, onSaveComplete, onSaveError };
    },
    template: `
      <SaveProject 
        :project-id="args.projectId"
        :is-new-save="args.isNewSave"
        @close="onClose" 
        @save-complete="onSaveComplete"
        @save-error="onSaveError"
      />
    `,
  }),
};

// 已有路径状态：保存已有路径的项目
export const ExistingSave: Story = {
  args: {
    isNewSave: false,
    projectId: 'project-123',
  },
  render: (args) => ({
    components: { SaveProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onSaveComplete = (data: { path: string, name: string }) => action('save-complete')(data);
      const onSaveError = (error: Error) => action('save-error')(error);
      
      return { args, onClose, onSaveComplete, onSaveError };
    },
    template: `
      <SaveProject 
        :project-id="args.projectId"
        :is-new-save="args.isNewSave"
        @close="onClose" 
        @save-complete="onSaveComplete"
        @save-error="onSaveError"
        ref="saveProjectRef"
      />
    `,
    mounted() {
      // 模拟已有项目路径
      setTimeout(() => {
        if (this.$refs.saveProjectRef) {
          this.$refs.saveProjectRef.projectName = '测试项目';
          this.$refs.saveProjectRef.selectedPath = '/user/projects/test-project.phigine';
        }
      }, 200);
    }
  }),
};

// 保存中状态：展示保存进度条的状态
export const Saving: Story = {
  args: {
    isNewSave: false,
    projectId: 'project-123',
  },
  render: (args) => ({
    components: { SaveProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onSaveComplete = (data: { path: string, name: string }) => action('save-complete')(data);
      const onSaveError = (error: Error) => action('save-error')(error);
      
      return { args, onClose, onSaveComplete, onSaveError };
    },
    template: `
      <SaveProject 
        :project-id="args.projectId"
        :is-new-save="args.isNewSave"
        @close="onClose" 
        @save-complete="onSaveComplete"
        @save-error="onSaveError"
        ref="saveProjectRef"
      />
    `,
    mounted() {
      // 模拟保存状态
      setTimeout(() => {
        if (this.$refs.saveProjectRef) {
          this.$refs.saveProjectRef.projectName = '测试项目';
          this.$refs.saveProjectRef.selectedPath = '/user/projects/test-project.phigine';
          this.$refs.saveProjectRef.isSaving = true;
          this.$refs.saveProjectRef.saveProgress = 65;
        }
      }, 200);
    }
  }),
};

// 错误状态：展示保存错误的状态
export const Error: Story = {
  args: {
    isNewSave: true,
    projectId: 'project-123',
  },
  render: (args) => ({
    components: { SaveProject },
    setup() {
      // 模拟事件处理函数
      const onClose = () => action('close')();
      const onSaveComplete = (data: { path: string, name: string }) => action('save-complete')(data);
      const onSaveError = (error: Error) => action('save-error')(error);
      
      return { args, onClose, onSaveComplete, onSaveError };
    },
    template: `
      <SaveProject 
        :project-id="args.projectId"
        :is-new-save="args.isNewSave"
        @close="onClose" 
        @save-complete="onSaveComplete"
        @save-error="onSaveError"
        ref="saveProjectRef"
      />
    `,
    mounted() {
      // 模拟错误状态
      setTimeout(() => {
        if (this.$refs.saveProjectRef) {
          this.$refs.saveProjectRef.projectName = '测试项目';
          this.$refs.saveProjectRef.errorMessage = '保存项目失败：无法写入文件，请检查权限';
        }
      }, 200);
    }
  }),
}; 