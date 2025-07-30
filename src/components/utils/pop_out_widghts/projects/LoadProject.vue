<template>
  <div class="load-project-dialog">
    <div class="dialog-header">
      <h2>打开项目</h2>
    </div>

    <div class="dialog-content">
      <!-- 文件选择区域 -->
      <div class="file-select-section">
        <div class="form-group">
          <label for="project-path">项目文件</label>
          <div class="path-input-group">
            <input 
              id="project-path" 
              v-model="selectedFilePath" 
              type="text" 
              placeholder="选择项目文件..." 
              readonly
            />
            <button class="browse-btn" @click="browseFile" :disabled="isLoading">浏览...</button>
          </div>
        </div>
      </div>

      <!-- 最近项目列表 -->
      <div class="recent-projects-section" v-if="recentProjects.length > 0">
        <h3>最近的项目</h3>
        <div class="recent-projects-list">
          <div 
            v-for="(project, index) in recentProjects" 
            :key="index" 
            class="recent-project-item" 
            :class="{ 'selected': selectedFilePath === project.path }"
            @click="selectRecentProject(project)"
          >
            <div class="project-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#AAAAAA"/>
                <path d="M14 17H10V7H14V17Z" fill="#AAAAAA"/>
                <path d="M7 14H17V10H7V14Z" fill="#AAAAAA"/>
              </svg>
            </div>
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-path">{{ project.path }}</div>
              <div class="project-date">{{ formatDate(project.lastOpened) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载选项 -->
      <div class="load-options-section">
        <h3>加载选项</h3>
        <div class="form-group checkbox">
          <input 
            id="load-assets" 
            type="checkbox" 
            v-model="loadOptions.loadAssets" 
          />
          <label for="load-assets">加载资源文件</label>
        </div>
        
        <div class="form-group checkbox">
          <input 
            id="create-backup" 
            type="checkbox" 
            v-model="loadOptions.createBackup" 
          />
          <label for="create-backup">创建备份</label>
        </div>
      </div>

      <!-- 加载进度 -->
      <div class="load-progress" v-if="isLoading">
        <div class="progress-bar">
          <div class="progress-value" :style="{width: `${loadProgress}%`}"></div>
        </div>
        <div class="progress-text">{{ loadProgressText }}</div>
      </div>

      <!-- 错误信息 -->
      <div class="error-message" v-if="errorMessage">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ errorMessage }}</div>
      </div>
    </div>

    <div class="dialog-footer">
      <button class="cancel-btn" @click="cancel" :disabled="isLoading">取消</button>
      <button 
        class="load-btn" 
        @click="loadProject" 
        :disabled="!selectedFilePath || isLoading"
      >
        {{ isLoading ? '加载中...' : '加载' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { emitEvent, onEvent } from '../../../../core/events/eventBus';
import { ProjectPersistenceService } from '../../../../core/persistence/ProjectPersistence';

export default defineComponent({
  name: 'LoadProject',
  emits: ['close', 'load-complete', 'load-error'],
  setup(props, { emit }) {
    // 选择的文件路径
    const selectedFilePath = ref('');
    
    // 最近项目列表
    const recentProjects = ref<Array<{
      name: string,
      path: string,
      lastOpened: Date,
      thumbnail?: string
    }>>([]);
    
    // 加载选项
    const loadOptions = reactive({
      loadAssets: true,
      createBackup: true
    });
    
    // 加载状态
    const isLoading = ref(false);
    const loadProgress = ref(0);
    const loadProgressText = ref('');
    const errorMessage = ref('');
    
    // 获取持久化服务
    const projectPersistence = ProjectPersistenceService.getInstance();
    
    // 浏览文件
    const browseFile = async () => {
      try {
        // 在实际应用中，需要使用Electron的dialog API来选择文件
        // 这里只是模拟这个过程
        // const result = await window.electron.dialog.showOpenDialog({
        //   title: '打开项目',
        //   filters: [
        //     { name: '项目文件', extensions: ['phigine'] },
        //     { name: '所有文件', extensions: ['*'] }
        //   ],
        //   properties: ['openFile']
        // });
        
        // 模拟选择文件
        selectedFilePath.value = `/user/projects/example-project.phigine`;
        errorMessage.value = ''; // 清除错误信息
      } catch (error) {
        console.error('选择文件失败:', error);
      }
    };
    
    // 选择最近项目
    const selectRecentProject = (project: { name: string, path: string, lastOpened: Date }) => {
      selectedFilePath.value = project.path;
      errorMessage.value = ''; // 清除错误信息
    };
    
    // 加载项目
    const loadProject = async () => {
      if (!selectedFilePath.value || isLoading.value) return;
      
      try {
        isLoading.value = true;
        loadProgress.value = 0;
        loadProgressText.value = '准备加载项目...';
        errorMessage.value = '';
        
        // 监听加载进度
        const unsubscribe = onEvent('import:progress', (data) => {
          loadProgress.value = data.progress || 0;
          loadProgressText.value = data.message || '加载中...';
        });
        
        // 执行加载操作
        setTimeout(async () => {
          try {
            // 模拟加载过程
            for (let i = 0; i <= 100; i += 10) {
              loadProgress.value = i;
              loadProgressText.value = `加载中... ${i}%`;
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // 实际加载项目
            // const project = await projectPersistence.loadProjectFromPath(
            //   selectedFilePath.value,
            //   {
            //     loadAssets: loadOptions.loadAssets,
            //     createBackup: loadOptions.createBackup
            //   }
            // );
            
            // 模拟加载成功
            const project = {
              id: 'proj-123',
              name: 'Example Project',
              path: selectedFilePath.value,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // 添加到最近项目列表
            projectPersistence.addToRecentProjects({
              name: project.name,
              path: project.path,
              lastOpened: new Date()
            });
            
            // 触发加载完成事件
            emit('load-complete', { project });
            
            // 发出全局事件通知
            emitEvent('project:loaded', { project });
            
            // 关闭对话框
            emit('close');
          } catch (error) {
            errorMessage.value = `加载项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
            emit('load-error', { error });
            console.error('加载项目失败:', error);
          } finally {
            isLoading.value = false;
            unsubscribe();
          }
        }, 300);
        
      } catch (error) {
        isLoading.value = false;
        errorMessage.value = `加载项目失败: ${error instanceof Error ? error.message : '未知错误'}`;
        emit('load-error', { error });
        console.error('加载项目失败:', error);
      }
    };
    
    // 取消加载
    const cancel = () => {
      if (isLoading.value) return;
      emit('close');
    };
    
    // 格式化日期
    const formatDate = (date: Date) => {
      if (!date) return '';
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 如果是今天
      if (diff < 24 * 60 * 60 * 1000 && 
          now.getDate() === date.getDate() && 
          now.getMonth() === date.getMonth() &&
          now.getFullYear() === date.getFullYear()) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 如果是昨天
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (yesterday.getDate() === date.getDate() && 
          yesterday.getMonth() === date.getMonth() && 
          yesterday.getFullYear() === date.getFullYear()) {
        return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 其他日期
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    // 获取最近项目列表
    onMounted(async () => {
      try {
        // 实际应用中应该从ProjectPersistenceService获取
        // const projects = await projectPersistence.getRecentProjects();
        
        // 模拟最近项目数据
        recentProjects.value = [
          {
            name: 'Example Project 1',
            path: '/user/projects/example-project1.phigine',
            lastOpened: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
          },
          {
            name: 'Example Project 2',
            path: '/user/projects/example-project2.phigine',
            lastOpened: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1天前
          },
          {
            name: 'Example Project 3',
            path: '/user/projects/example-project3.phigine',
            lastOpened: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3天前
          }
        ];
      } catch (error) {
        console.error('获取最近项目失败:', error);
      }
    });
    
    return {
      selectedFilePath,
      recentProjects,
      loadOptions,
      isLoading,
      loadProgress,
      loadProgressText,
      errorMessage,
      browseFile,
      selectRecentProject,
      loadProject,
      cancel,
      formatDate
    };
  }
});
</script>

<style scoped>
.load-project-dialog {
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  margin-bottom: 1.5rem;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #eee;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #cccccc;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #333;
  color: #eee;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox label {
  margin-bottom: 0;
}

.path-input-group {
  display: flex;
  gap: 0.5rem;
}

.path-input-group input {
  flex: 1;
}

.browse-btn {
  padding: 0.5rem 1rem;
  background-color: #444;
  color: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.browse-btn:hover {
  background-color: #555;
}

.browse-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recent-projects-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.recent-projects-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #ddd;
}

.recent-projects-list {
  border: 1px solid #444;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.recent-project-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #444;
  cursor: pointer;
}

.recent-project-item:last-child {
  border-bottom: none;
}

.recent-project-item:hover {
  background-color: #333;
}

.recent-project-item.selected {
  background-color: #2c5282;
}

.project-icon {
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: #eee;
  margin-bottom: 0.25rem;
}

.project-path {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.project-date {
  font-size: 0.8rem;
  color: #777;
}

.load-options-section {
  margin-bottom: 1.5rem;
}

.load-options-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #ddd;
}

.load-progress {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 6px;
  width: 100%;
  background-color: #333;
  border-radius: 3px;
  overflow: hidden;
}

.progress-value {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s;
}

.progress-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #aaa;
  text-align: center;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.error-icon {
  margin-right: 0.5rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.9rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
}

.cancel-btn,
.load-btn {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background-color: #555;
  color: #eee;
}

.load-btn {
  background-color: #4caf50;
  color: white;
}

.cancel-btn:hover {
  background-color: #666;
}

.load-btn:hover {
  background-color: #5db761;
}

.load-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 