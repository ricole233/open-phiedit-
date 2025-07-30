<template>
  <div class="save-project-dialog">
    <div class="dialog-header">
      <h2>{{ isNewSave ? '保存项目' : '另存为' }}</h2>
    </div>

    <div class="dialog-content">
      <div class="form-group">
        <label for="project-name">项目名称</label>
        <input 
          id="project-name" 
          v-model="formData.name" 
          type="text" 
          placeholder="请输入项目名称" 
          required
          @input="validateForm"
        />
        <span class="form-error" v-if="errors.name">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="project-path">保存位置</label>
        <div class="path-input-group">
          <input 
            id="project-path" 
            v-model="formData.path" 
            type="text" 
            placeholder="选择保存路径" 
            readonly
          />
          <button class="browse-btn" @click="browsePath">浏览...</button>
        </div>
        <span class="form-error" v-if="errors.path">{{ errors.path }}</span>
      </div>

      <div class="form-section">
        <h3>保存选项</h3>
        
        <div class="form-group checkbox">
          <input 
            id="save-assets" 
            type="checkbox" 
            v-model="formData.saveAssets" 
          />
          <label for="save-assets">保存资源文件</label>
        </div>
        
        <div class="form-group checkbox">
          <input 
            id="create-backup" 
            type="checkbox" 
            v-model="formData.createBackup" 
          />
          <label for="create-backup">创建备份</label>
        </div>

        <div class="form-group checkbox">
          <input 
            id="compress-project" 
            type="checkbox" 
            v-model="formData.compress" 
          />
          <label for="compress-project">压缩项目文件</label>
        </div>
      </div>

      <div class="save-progress" v-if="isSaving">
        <div class="progress-bar">
          <div class="progress-value" :style="{width: `${saveProgress}%`}"></div>
        </div>
        <div class="progress-text">{{ saveProgressText }}</div>
      </div>
    </div>

    <div class="dialog-footer">
      <button class="cancel-btn" @click="cancel" :disabled="isSaving">取消</button>
      <button class="save-btn" @click="save" :disabled="!isFormValid || isSaving">
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch, onMounted } from 'vue';
import { emitEvent, onEvent } from '../../../../core/events/eventBus';
import { ProjectPersistenceService } from '../../../../core/persistence/ProjectPersistence';

export default defineComponent({
  name: 'SaveProject',
  props: {
    projectId: {
      type: String,
      default: ''
    },
    isNewSave: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'save-complete', 'save-error'],
  setup(props, { emit }) {
    // 表单数据
    const formData = reactive({
      name: '',
      path: '',
      saveAssets: true,
      createBackup: true,
      compress: false
    });
    
    // 表单错误
    const errors = reactive({
      name: '',
      path: ''
    });
    
    // 保存状态
    const isSaving = ref(false);
    const saveProgress = ref(0);
    const saveProgressText = ref('');
    
    // 获取持久化服务
    const projectPersistence = ProjectPersistenceService.getInstance();
    
    // 计算表单是否有效
    const isFormValid = computed(() => {
      return formData.name.trim() !== '' && 
             formData.path.trim() !== '' && 
             !errors.name && 
             !errors.path;
    });
    
    // 验证表单
    const validateForm = () => {
      // 验证项目名
      if (!formData.name.trim()) {
        errors.name = '项目名称不能为空';
      } else if (!/^[a-zA-Z0-9\u4e00-\u9fa5_\- ]+$/.test(formData.name)) {
        errors.name = '项目名称包含无效字符';
      } else {
        errors.name = '';
      }
      
      // 验证路径
      if (!formData.path.trim()) {
        errors.path = '请选择保存路径';
      } else {
        errors.path = '';
      }
    };
    
    // 浏览保存路径
    const browsePath = async () => {
      try {
        // 在实际应用中，可能需要使用Electron的dialog API来选择路径
        // 这里只是模拟这个过程
        // const result = await window.electron.dialog.showSaveDialog({
        //   title: '保存项目',
        //   defaultPath: formData.name || '未命名项目',
        //   filters: [{ name: '项目文件', extensions: ['phigine'] }]
        // });
        
        // 模拟选择路径
        formData.path = `/user/projects/${formData.name || '未命名项目'}.phigine`;
        validateForm();
      } catch (error) {
        console.error('选择保存路径失败:', error);
      }
    };
    
    // 取消保存
    const cancel = () => {
      if (isSaving.value) return;
      emit('close');
    };
    
    // 执行保存
    const save = async () => {
      if (!isFormValid.value || isSaving.value) return;
      
      try {
        isSaving.value = true;
        saveProgress.value = 0;
        saveProgressText.value = '准备保存项目...';
        
        // 监听保存进度
        const unsubscribe = onEvent('export:progress', (data) => {
          saveProgress.value = data.progress || 0;
          saveProgressText.value = data.message || '保存中...';
        });
        
        // 执行保存操作
        setTimeout(async () => {
          try {
            // 模拟保存过程
            for (let i = 0; i <= 100; i += 10) {
              saveProgress.value = i;
              saveProgressText.value = `保存中... ${i}%`;
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // 实际保存项目
            // const success = await projectPersistence.saveProjectToPath(
            //   props.projectId, 
            //   formData.path,
            //   {
            //     includeAssets: formData.saveAssets,
            //     createBackup: formData.createBackup,
            //     compress: formData.compress
            //   }
            // );
            
            // 模拟保存成功
            const success = true;
            
            if (success) {
              // 触发保存完成事件
              emit('save-complete', {
                projectId: props.projectId,
                path: formData.path,
                name: formData.name
              });
              
              // 发出全局事件通知
              emitEvent('project:saved', {
                projectId: props.projectId,
                path: formData.path,
                name: formData.name
              });
              
              // 关闭对话框
              emit('close');
            } else {
              throw new Error('保存失败');
            }
          } catch (error) {
            emit('save-error', { error });
            console.error('保存项目失败:', error);
          } finally {
            isSaving.value = false;
            unsubscribe();
          }
        }, 300);
        
      } catch (error) {
        isSaving.value = false;
        emit('save-error', { error });
        console.error('保存项目失败:', error);
      }
    };
    
    // 初始化表单数据
    onMounted(async () => {
      if (props.projectId && !props.isNewSave) {
        try {
          // 获取项目信息
          const project = projectPersistence.getProject(props.projectId);
          if (project) {
            formData.name = project.name || '';
            formData.path = project.path || '';
          }
        } catch (error) {
          console.error('加载项目信息失败:', error);
        }
      }
      
      validateForm();
    });
    
    return {
      formData,
      errors,
      isSaving,
      saveProgress,
      saveProgressText,
      isFormValid,
      validateForm,
      browsePath,
      cancel,
      save
    };
  }
});
</script>

<style scoped>
.save-project-dialog {
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

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #ddd;
}

.form-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.save-progress {
  margin-top: 1rem;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
}

.cancel-btn,
.save-btn {
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

.save-btn {
  background-color: #4caf50;
  color: white;
}

.cancel-btn:hover {
  background-color: #666;
}

.save-btn:hover {
  background-color: #5db761;
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 