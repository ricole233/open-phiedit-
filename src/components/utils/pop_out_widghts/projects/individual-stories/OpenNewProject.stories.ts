import { Meta, StoryObj } from '@storybook/vue3';
import OpenNewProject from '../OpenNewProject.vue';
import { serviceManager } from '../../../../../core/services/ServiceManager';
import { ProjectPersistenceService } from '../../../../../core/persistence/ProjectPersistence';
import { createProject } from '../../../../../core/models/ProjectModel';

// 创建模拟的ProjectPersistenceService
class MockProjectPersistenceService {
  createNewProject(name: string) {
    console.log(`创建了新项目: ${name}`);
    return createProject(name);
  }
}

// 注册模拟服务
if (!serviceManager.has('projectPersistence')) {
  serviceManager.register('projectPersistence', new MockProjectPersistenceService() as unknown as ProjectPersistenceService);
}

const meta: Meta<typeof OpenNewProject> = {
  title: '弹出窗口/新建项目',
  component: OpenNewProject,
  tags: ['autodocs'],
  argTypes: {
    buttonText: {
      control: 'text',
      description: '按钮文本'
    }
  },
  parameters: {
    docs: {
      description: {
        component: '点击后打开新建项目窗口的按钮组件，集成了弹出窗口系统。'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof OpenNewProject>;

// 默认故事
export const Default: Story = {
  args: {
    buttonText: '新建项目'
  }
};

// 自定义文本
export const CustomText: Story = {
  args: {
    buttonText: '创建新项目'
  }
};

// 短文本
export const ShortText: Story = {
  args: {
    buttonText: '新建'
  }
};

// 长文本
export const LongText: Story = {
  args: {
    buttonText: '点击这里创建一个全新的AE项目'
  }
}; 