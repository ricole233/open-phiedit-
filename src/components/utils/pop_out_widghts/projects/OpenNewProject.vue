<template>
  <div class="open-new-project">
    <button class="new-project-btn" @click="openNewProjectWindow">
      <span class="btn-icon">+</span>
      <span class="btn-text">{{ buttonText }}</span>
    </button>
    
    <!-- 窗口容器组件 -->
    <PopWindowContainer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, markRaw } from 'vue';
import { PopWindowContainer, createPopWindow } from '../index';
import NewProject from './NewProject.vue';
import { Project } from '../../../../core/models/ProjectModel';
import { getResourceManager } from '../../../../core/services/initServices';

export default defineComponent({
  name: 'OpenNewProject',
  components: {
    PopWindowContainer
  },
  props: {
    buttonText: {
      type: String,
      default: '新建项目'
    }
  },
  emits: ['project-created'],
  setup(props, { emit }) {
    // 获取资源管理器
    const resourceManager = getResourceManager();
    
    // 打开新建项目窗口
    const openNewProjectWindow = () => {
      // 创建弹出窗口
      const windowId = createPopWindow({
        title: '新建项目',
        component: markRaw(NewProject), // 使用markRaw防止组件被转换为响应式对象
        props: {},
        onClose: () => {
          console.log('新建项目窗口已关闭');
        }
      });
      
      // 监听事件
      document.addEventListener('project-created', handleProjectCreated);
      document.addEventListener('import-audio', handleAudioImport);
      
      // 组件卸载时移除事件监听
      onBeforeUnmount(() => {
        document.removeEventListener('project-created', handleProjectCreated);
        document.removeEventListener('import-audio', handleAudioImport);
      });
    };
    
    // 项目创建成功的处理函数
    const handleProjectCreated = (event: CustomEvent) => {
      const project = event.detail;
      // 发送项目创建事件
      emit('project-created', project);
    };
    
    // 处理音频导入
    const handleAudioImport = (event: CustomEvent) => {
      const audioFiles = event.detail;
      
      if (!audioFiles || audioFiles.length === 0) return;
      
      // 导入音频文件到资源管理器
      // 注意：实际应用中，这里应该调用资源管理器服务导入音频文件
      console.log('导入音频文件:', audioFiles);
      
      // 调用资源管理器导入音频（伪代码，需要根据实际API调整）
      // resourceManager.importAudioFiles(audioFiles);
    };
    
    return {
      openNewProjectWindow,
      handleProjectCreated,
      handleAudioImport
    };
  }
});
</script>

<style scoped>
.open-new-project {
  display: inline-block;
}

.new-project-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #7289da;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-project-btn:hover {
  background-color: #5e76d3;
}

.btn-icon {
  font-size: 18px;
  margin-right: 8px;
}

.btn-text {
  font-weight: 500;
}
</style> 