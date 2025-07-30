<template>
  <div class="export-project-dialog">
    <div class="dialog-header">
      <h2>导出项目</h2>
    </div>
    
    <div class="dialog-content">
      <div v-if="!currentProject" class="no-project">
        <p>没有打开的项目</p>
      </div>
      
      <template v-else>
        <div class="form-section">
          <h3>项目信息</h3>
          
          <div class="project-info">
            <div class="info-row">
              <div class="info-label">项目名称</div>
              <div class="info-value">{{ currentProject.settings.name }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">谱师</div>
              <div class="info-value">{{ currentProject.settings.meta.charter || '未设置' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">曲师</div>
              <div class="info-value">{{ currentProject.settings.meta.composer || '未设置' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">难度</div>
              <div class="info-value">{{ currentProject.settings.meta.level || '未设置' }}</div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>导出选项</h3>
          
          <div class="form-group">
            <label for="export-format">导出格式</label>
            <select id="export-format" v-model="exportOptions.format" @change="onFormatChange">
              <option value="phigine">PhiEngine (项目文件)</option>
              <option value="phigine_archive">PhiEngine (完整压缩包)</option>
              <option value="phigros" :disabled="!isFormatSupported('phigros')">Phigros 谱面</option>
              <option value="rpe" :disabled="!isFormatSupported('rpe')">RPE 格式</option>
            </select>
            <div class="field-help" v-if="!isFormatSupported(exportOptions.format)">
              {{ formatSupportMessages[exportOptions.format] || '此格式暂不支持' }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="export-location">导出位置</label>
            <div class="path-input">
              <input id="export-location" v-model="exportOptions.location" type="text" readonly />
              <button @click="selectExportLocation" class="browse-btn">浏览...</button>
            </div>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeAudio" />
              包含音频文件
            </label>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.includeAssets" />
              包含素材资源
            </label>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="exportOptions.optimizeSize" />
              优化文件大小
            </label>
          </div>
        </div>
        
        <div class="form-section">
          <h3>导出预览</h3>
          
          <div class="export-preview">
            <div class="preview-item">
              <div class="preview-icon">📄</div>
              <div class="preview-name">{{ getExportFileName() }}</div>
            </div>
            
            <div class="preview-detail">
              <div class="preview-info-row">
                <div class="preview-info-label">包含音符数量</div>
                <div class="preview-info-value">{{ getNoteCount() }}</div>
              </div>
              <div class="preview-info-row">
                <div class="preview-info-label">包含判定线数量</div>
                <div class="preview-info-value">{{ getJudgeLineCount() }}</div>
              </div>
              <div class="preview-info-row">
                <div class="preview-info-label">预计文件大小</div>
                <div class="preview-info-value">{{ getEstimatedFileSize() }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 导出进度 -->
        <div class="export-progress" v-if="isExporting">
          <div class="progress-bar-container">
            <div class="progress-bar-fill" :style="{ width: `${exportProgress}%` }"></div>
          </div>
          <div class="progress-text">{{ exportProgressText }}</div>
        </div>
      </template>
    </div>
    
    <div class="dialog-footer">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button 
        class="btn-export" 
        @click="exportProject" 
        :disabled="!isExportable || isExporting"
      >
        {{ isExporting ? '正在导出...' : '导出' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useProjectStore } from '@/stores/projectStore';
import { getProjectPersistence, getService } from '@/core/services/initServices';
import { emitEvent, onEvent } from '@/core/events/eventBus';
import { fileSystemService } from '@/core/services/FileSystemService';
import { exportService, ExportOptions } from '@/core/services/ExportService';

export default defineComponent({
  name: 'ExportProject',
  
  setup(props, { emit }) {
    const projectStore = useProjectStore();
    const currentProject = computed(() => projectStore.currentProject);
    
    // 导出选项
    const exportOptions = reactive({
      format: 'phigine',
      location: '',
      includeAudio: true,
      includeAssets: true,
      optimizeSize: false
    });
    
    // 导出状态
    const isExporting = ref(false);
    const exportProgress = ref(0);
    const exportProgressText = ref('');
    const exportError = ref('');
    
    // 不支持的格式提示信息
    const formatSupportMessages = {
      phigros: '此功能正在开发中',
      rpe: '此功能正在开发中'
    };
    
    // 是否可以导出
    const isExportable = computed(() => {
      return currentProject.value && 
             exportOptions.location && 
             isFormatSupported(exportOptions.format);
    });
    
    // 检查格式是否支持
    const isFormatSupported = (format: string): boolean => {
      return ['phigine', 'phigine_archive'].includes(format);
    };
    
    // 格式变更处理
    const onFormatChange = () => {
      // 根据格式更新文件扩展名
      if (exportOptions.location) {
        const baseName = exportOptions.location.split('.')[0];
        exportOptions.location = `${baseName}.${getFormatExtension(exportOptions.format)}`;
      }
    };
    
    // 获取格式对应的文件扩展名
    const getFormatExtension = (format: string): string => {
      switch (format) {
        case 'phigine': return 'phigine';
        case 'phigine_archive': return 'zip';
        case 'phigros': return 'zip';
        case 'rpe': return 'zip';
        default: return 'phigine';
      }
    };
    
    // 选择导出位置
    const selectExportLocation = async () => {
      try {
        const result = await fileSystemService.showSaveDialog({
          title: '选择导出位置',
          defaultPath: getExportFileName(),
          filters: [
            { name: getFormatLabel(exportOptions.format), extensions: [getFormatExtension(exportOptions.format)] }
          ]
        });
        
        if (!result.canceled && result.filePath) {
          exportOptions.location = result.filePath;
        }
      } catch (error) {
        console.error('选择导出位置失败', error);
        exportError.value = error instanceof Error ? error.message : '选择导出位置失败';
      }
    };
    
    // 获取格式标签
    const getFormatLabel = (format: string): string => {
      switch (format) {
        case 'phigine': return 'PhiEngine 项目文件';
        case 'phigine_archive': return 'PhiEngine 压缩包';
        case 'phigros': return 'Phigros 谱面';
        case 'rpe': return 'RPE 格式';
        default: return '项目文件';
      }
    };
    
    // 获取导出文件名
    const getExportFileName = (): string => {
      if (!currentProject.value) return 'project.phigine';
      
      const name = currentProject.value.settings.name || 'project';
      const sanitizedName = name.replace(/[^\w\s.-]/g, '_');
      
      return `${sanitizedName}.${getFormatExtension(exportOptions.format)}`;
    };
    
    // 获取音符数量
    const getNoteCount = (): number => {
      if (!currentProject.value || !currentProject.value.chart) return 0;
      return currentProject.value.chart.notes.length;
    };
    
    // 获取判定线数量
    const getJudgeLineCount = (): number => {
      if (!currentProject.value || !currentProject.value.chart) return 0;
      return currentProject.value.chart.judgeLines.length;
    };
    
    // 估算文件大小
    const getEstimatedFileSize = (): string => {
      if (!currentProject.value) return '未知';
      
      // 基础项目数据大小估计 (简单估算)
      let size = JSON.stringify(currentProject.value).length;
      
      // 如果包含音频文件，增加估算
      if (exportOptions.includeAudio) {
        // 假设每个音频文件10MB
        const audioCount = currentProject.value.resources?.audio?.length || 0;
        size += audioCount * 10 * 1024 * 1024;
      }
      
      // 如果包含素材资源，增加估算
      if (exportOptions.includeAssets) {
        // 假设每个素材文件1MB
        const assetsCount = currentProject.value.resources?.images?.length || 0;
        size += assetsCount * 1024 * 1024;
      }
      
      // 格式化显示
      if (size < 1024) {
        return `${size} B`;
      } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
      } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
    };
    
    // 导出项目
    const exportProject = async () => {
      if (!currentProject.value || !isExportable.value) return;
      
      try {
        isExporting.value = true;
        exportProgress.value = 0;
        exportProgressText.value = '准备导出...';
        exportError.value = '';
        
        const options: ExportOptions = {
          format: exportOptions.format as any,
          includeAudio: exportOptions.includeAudio,
          includeAssets: exportOptions.includeAssets,
          optimizeSize: exportOptions.optimizeSize,
          targetPath: exportOptions.location
        };
        
        // 调用导出服务
        const result = await exportService.exportProject(
          currentProject.value,
          options,
          (progress, message) => {
            exportProgress.value = progress;
            exportProgressText.value = message;
          }
        );
        
        // 导出成功
        emitEvent('notification:show', {
          type: 'success',
          title: '导出成功',
          message: `项目已成功导出到: ${result}`
        });
        
        // 关闭导出对话框
        emit('close');
      } catch (error) {
        console.error('导出项目失败', error);
        exportError.value = error instanceof Error ? error.message : '导出失败';
        
        emitEvent('notification:show', {
          type: 'error',
          title: '导出失败',
          message: exportError.value
        });
      } finally {
        isExporting.value = false;
      }
    };
    
    // 取消导出
    const cancel = () => {
      emit('close');
    };
    
    // 组件挂载时初始化
    onMounted(() => {
      // 设置默认导出位置和文件名
      exportOptions.location = getExportFileName();
    });
    
    return {
      currentProject,
      exportOptions,
      isExporting,
      exportProgress,
      exportProgressText,
      exportError,
      isExportable,
      formatSupportMessages,
      isFormatSupported,
      onFormatChange,
      selectExportLocation,
      getExportFileName,
      getNoteCount,
      getJudgeLineCount,
      getEstimatedFileSize,
      exportProject,
      cancel
    };
  }
});
</script>

<style scoped>
.export-project-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #2d2d2d;
  color: #e8e8e8;
  font-family: Arial, sans-serif;
}

.dialog-header {
  padding: 10px 15px;
  border-bottom: 1px solid #444;
}

.dialog-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.dialog-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #444;
}

.form-section h3 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #aaa;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #bbb;
}

input, select {
  width: 100%;
  padding: 8px 10px;
  background-color: #3a3a3a;
  border: 1px solid #555;
  border-radius: 4px;
  color: #e8e8e8;
  font-size: 14px;
}

input:focus, select:focus {
  border-color: #7289da;
  outline: none;
}

.path-input {
  display: flex;
  gap: 8px;
}

.path-input input {
  flex: 1;
}

.browse-btn {
  padding: 8px 12px;
  background-color: #4d4d4d;
  border: none;
  border-radius: 4px;
  color: #e8e8e8;
  cursor: pointer;
}

.browse-btn:hover {
  background-color: #5a5a5a;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.field-help {
  margin-top: 4px;
  font-size: 11px;
  color: #ff6b6b;
}

.project-info {
  background-color: #383838;
  border-radius: 4px;
  padding: 12px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 80px;
  font-size: 13px;
  color: #999;
}

.info-value {
  flex: 1;
  font-size: 13px;
}

.export-preview {
  background-color: #383838;
  border-radius: 4px;
  padding: 12px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #444;
}

.preview-icon {
  font-size: 24px;
}

.preview-name {
  font-size: 14px;
  font-weight: bold;
}

.preview-detail {
  padding-top: 5px;
}

.preview-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.preview-info-label {
  font-size: 12px;
  color: #999;
}

.preview-info-value {
  font-size: 12px;
}

.no-project {
  text-align: center;
  padding: 30px;
  color: #888;
}

.dialog-footer {
  padding: 15px;
  border-top: 1px solid #444;
  text-align: right;
}

button {
  padding: 8px 16px;
  margin-left: 10px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background-color: #4d4d4d;
  color: #e8e8e8;
}

.btn-cancel:hover {
  background-color: #5a5a5a;
}

.btn-export {
  background-color: #7289da;
  color: white;
}

.btn-export:hover {
  background-color: #5e76d3;
}

.btn-export:disabled {
  background-color: #4d5a85;
  color: #aaa;
  cursor: not-allowed;
}

.export-progress {
  margin-top: 15px;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background-color: #3a3a3a;
  border-radius: 3px;
  margin-bottom: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #aaa;
  text-align: right;
}
</style>