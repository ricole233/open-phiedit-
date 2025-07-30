<template>
  <div class="import-assets-dialog" v-if="visible" @keydown.esc="handleCancel">
    <div class="dialog-overlay" @click="handleCancel"></div>
    <div class="dialog-content" ref="dialogRef">
      <div class="dialog-header">
        <h3>导入素材</h3>
        <button class="close-btn" @click="handleCancel">✖</button>
      </div>
      
      <div class="dialog-body">
        <div class="file-browse-section">
          <div class="file-preview-area" v-if="selectedFiles.length">
            <div class="file-preview-grid">
              <div v-for="file in selectedFiles" :key="file.path" class="file-preview-item" :class="{ 'selected': selectedFilePaths.includes(file.path) }" @click="toggleFileSelection(file.path)">
                <div class="file-thumbnail" :class="getFileTypeClass(file)">
                  <span class="file-icon">{{ getFileIcon(file) }}</span>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-meta">{{ formatFileSize(file.size) }}</div>
                </div>
                <div class="file-select-indicator">
                  <input type="checkbox" :checked="selectedFilePaths.includes(file.path)" @click.stop>
                </div>
              </div>
            </div>
          </div>
          <div class="file-drop-area" v-else @click="triggerFileBrowse" @dragover.prevent @drop="handleFileDrop">
            <div class="drop-message">
              <div class="drop-icon">📁</div>
              <div>点击选择文件或拖放文件到此处</div>
              <div class="file-types">支持的格式：图像、视频、音频</div>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none;" 
            multiple 
            @change="handleFileSelect"
            accept=".jpg,.jpeg,.png,.gif,.webp,.tiff,.bmp,.svg,.psd,.mp4,.mov,.avi,.webm,.mkv,.flv,.mp3,.wav,.ogg,.aac,.flac,.ai,.eps,.pdf,.aep,.aet"
          >
        </div>
        
        <div class="import-options">
          <h4>导入选项</h4>
          
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="options.generateThumbnail">
              生成缩略图
            </label>
          </div>
          
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="options.copyToLocalCache">
              复制到本地缓存
            </label>
          </div>
          
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="options.extractMetadata">
              提取元数据
            </label>
          </div>
          
          <div class="option-group" v-if="targetFolders.length > 0">
            <label>导入到文件夹:</label>
            <select v-model="selectedTargetFolder">
              <option v-for="folder in targetFolders" :key="folder.id" :value="folder.id">
                {{ folder.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="secondary-btn" @click="handleCancel">取消</button>
        <button 
          class="primary-btn" 
          @click="handleImport" 
          :disabled="!canImport"
        >
          导入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { onEvent, emitEvent } from '../../../../core/events/eventBus';
import { AssetType, FolderAsset } from '../../../../core/models/AssetModel';
import { AssetImportOptions } from '../../../../core/persistence/AssetPersistence';

// 属性定义
const props = defineProps<{
  visible: boolean;
  parentFolderId?: string;
}>();

// 事件定义
const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'import', files: string[], targetFolderId: string, options: AssetImportOptions): void;
}>();

// 引用
const dialogRef = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// 状态
const selectedFiles = ref<Array<{path: string, name: string, type: string, size: number}>>([]);
const selectedFilePaths = ref<string[]>([]);
const options = ref<AssetImportOptions>({
  generateThumbnail: true,
  copyToLocalCache: true,
  extractMetadata: true
});
const targetFolders = ref<Array<{id: string, name: string}>>([]);
const selectedTargetFolder = ref<string>(props.parentFolderId || '');

// 计算属性
const canImport = computed(() => selectedFilePaths.value.length > 0);

// 初始化目标文件夹
onMounted(() => {
  // 监听目标文件夹更新事件
  onEvent('import:folders:update', ({ folders }) => {
    targetFolders.value = folders;
    
    // 如果没有默认选择的目标文件夹，选择第一个
    if (!selectedTargetFolder.value && folders.length > 0) {
      selectedTargetFolder.value = folders[0].id;
    }
  });
  
  // 请求获取可用文件夹
  emitEvent('import:folders:request');
  
  // 焦点到对话框
  nextTick(() => {
    if (dialogRef.value) {
      dialogRef.value.focus();
    }
  });
  
  // 添加键盘监听
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// 键盘事件处理
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.visible) {
    handleCancel();
    event.preventDefault();
  } else if ((event.key === 'Enter' || event.key === ' ') && props.visible && canImport.value) {
    handleImport();
    event.preventDefault();
  }
}

// 触发文件浏览器
function triggerFileBrowse() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFiles(Array.from(target.files));
  }
}

// 处理文件拖放
function handleFileDrop(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer && event.dataTransfer.files) {
    processFiles(Array.from(event.dataTransfer.files));
  }
}

// 处理文件处理
function processFiles(files: File[]) {
  // 将File对象转换为我们需要的格式
  const processedFiles = files.map(file => {
    // 提取文件类型
    let type = determineFileType(file.name);
    
    return {
      path: URL.createObjectURL(file), // 创建临时URL
      name: file.name.split('.')[0], // 移除扩展名
      type,
      size: file.size
    };
  });
  
  selectedFiles.value = processedFiles;
  selectedFilePaths.value = processedFiles.map(file => file.path);
}

// 根据文件名确定文件类型
function determineFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff', 'bmp', 'svg', 'psd'].includes(extension || '')) {
    return 'image';
  } else if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv'].includes(extension || '')) {
    return 'video';
  } else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension || '')) {
    return 'audio';
  } else if (['ai', 'eps', 'pdf'].includes(extension || '')) {
    return 'vector';
  } else if (['aep', 'aet'].includes(extension || '')) {
    return 'project';
  }
  
  return 'other';
}

// 切换文件选择状态
function toggleFileSelection(path: string) {
  const index = selectedFilePaths.value.indexOf(path);
  if (index === -1) {
    selectedFilePaths.value.push(path);
  } else {
    selectedFilePaths.value.splice(index, 1);
  }
}

// 获取文件类型样式类
function getFileTypeClass(file: {type: string}) {
  return `file-type-${file.type}`;
}

// 获取文件图标
function getFileIcon(file: {type: string}) {
  switch(file.type) {
    case 'image': return '🖼️';
    case 'video': return '🎬';
    case 'audio': return '🎵';
    case 'vector': return '📐';
    case 'project': return '🎞️';
    default: return '📄';
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// 处理取消
function handleCancel() {
  emit('close');
}

// 处理导入
function handleImport() {
  if (selectedFilePaths.value.length === 0) return;
  
  emit('import', 
    selectedFilePaths.value,
    selectedTargetFolder.value,
    options.value
  );
}
</script>

<style scoped>
.import-assets-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}

.dialog-content {
  position: relative;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  background-color: #2d2d2d;
  border-radius: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #3a3a3a;
  border-bottom: 1px solid #555;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  color: #eee;
}

.close-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 16px;
  cursor: pointer;
}

.dialog-body {
  padding: 16px;
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.file-browse-section {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.file-drop-area {
  border: 2px dashed #555;
  border-radius: 6px;
  padding: 32px;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.file-drop-area:hover {
  border-color: #888;
  background-color: #353535;
}

.drop-message {
  text-align: center;
  color: #ccc;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #666;
}

.file-types {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}

.file-preview-area {
  border: 1px solid #555;
  border-radius: 6px;
  flex: 1;
  overflow: auto;
  padding: 8px;
  background-color: #252525;
}

.file-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.file-preview-item {
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
}

.file-preview-item:hover {
  background-color: #333;
}

.file-preview-item.selected {
  border-color: #0e639c;
  background-color: rgba(14, 99, 156, 0.2);
}

.file-thumbnail {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: #1e1e1e;
}

.file-icon {
  font-size: 36px;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  font-size: 11px;
  color: #888;
}

.file-select-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}

.import-options {
  padding: 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background-color: #333;
}

.import-options h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #ddd;
  font-size: 14px;
}

.option-group {
  margin-bottom: 8px;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ccc;
}

.option-group select {
  width: 100%;
  padding: 4px;
  background-color: #252525;
  color: #ccc;
  border: 1px solid #444;
  border-radius: 3px;
  margin-top: 4px;
}

.dialog-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: #333;
  border-top: 1px solid #444;
}

.primary-btn, .secondary-btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background-color: #0e639c;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: #1177bb;
}

.primary-btn:disabled {
  background-color: #444;
  color: #999;
  cursor: not-allowed;
}

.secondary-btn {
  background-color: #3a3a3a;
  color: #ccc;
}

.secondary-btn:hover {
  background-color: #444;
}

/* 文件类型特定样式 */
.file-type-image .file-icon {
  color: #4caf50;
}

.file-type-video .file-icon {
  color: #2196f3;
}

.file-type-audio .file-icon {
  color: #f44336;
}

.file-type-vector .file-icon {
  color: #ff9800;
}

.file-type-project .file-icon {
  color: #9c27b0;
}
</style> 