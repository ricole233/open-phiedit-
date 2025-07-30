<template>
  <div class="new-project-dialog">
    <div class="dialog-header">
      <h2>新建项目</h2>
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
      
      <div class="form-section">
        <h3>基本设置</h3>
        
        <div class="form-row">
          <div class="form-group triple">
            <label for="project-width">预览宽度</label>
            <ValueInput 
              id="project-width" 
              v-model.number="formData.width" 
              min="0" 
              max="3840"
              @input="validateForm"
            />
          </div>
          
          <div class="form-group triple">
            <label for="project-height">预览高度</label>
            <ValueInput 
              id="project-height" 
              v-model.number="formData.height" 
              min="0" 
              max="2160"
              @input="validateForm"
            />
          </div>

          <div class="form-group triple">
            <label for="project-frameRate">帧率</label>
            <ValueInput 
              id="project-frameRate" 
              v-model.number="formData.frameRate" 
              min="15" 
              max="240"
              @input="validateForm"
            />
          </div>
        </div>
        
        <div class="form-section">
        <h3>音频文件</h3>
        <p class="section-desc">至少需要一个音频文件作为项目的主音乐。导入音频后，项目持续时长将自动更新为音频时长。</p>
        
        <div class="form-row">
          <div class="form-group audio-upload">
            <button class="upload-btn" @click="triggerFileInput">
              <span class="upload-icon">+</span>
              <span class="upload-text">选择音频文件</span>
            </button>
            <input 
              ref="audioFileInput"
              type="file" 
              accept="audio/*" 
              multiple
              style="display: none;"
              @change="handleAudioFiles"
            />
          </div>
        </div>

        <!-- 已选择的音频文件列表 -->
        <div class="audio-files-list" v-if="audioFiles.length > 0">
          <h4>已选择的音频文件</h4>
          <div class="audio-file" v-for="(file, index) in audioFiles" :key="index">
            <div class="audio-file-info">
              <div class="audio-file-name">{{ file.name }}</div>
              <div class="audio-file-meta">
                <span v-if="file.duration">{{ formatDuration(file.duration) }}</span>
                <span v-if="file.size"> | {{ formatFileSize(file.size) }}</span>
              </div>
            </div>
            <div class="audio-file-controls">
              <button v-if="index === 0" class="audio-main-tag">主音频</button>
              <div v-if="index === 0 && bpmResult" class="bpm-result-tag">
                BPM: {{ bpmResult.bpm }}
                <span class="confidence-indicator" :style="confidenceStyle"></span>
              </div>
              <div v-if="index === 0 && isAnalyzing" class="analyzing-tag">
                BPM分析中...
              </div>
              <button class="audio-toggle-player" @click="toggleAudioPlayer(index)" :class="{ active: expandedAudioIndex === index }">
                <span v-if="expandedAudioIndex === index">↑</span>
                <span v-else>↓</span>
              </button>
              <button class="audio-remove" @click="removeAudioFile(index)">×</button>
            </div>
            
            <!-- 可折叠播放器 -->
            <div class="audio-player-container" v-if="expandedAudioIndex === index">
              <div class="audio-player">
                <button class="player-control" @click="togglePlayAudio(index)">
                  <span v-if="playingIndex === index">⏸</span>
                  <span v-else>▶</span>
                </button>
                <div class="progress-container" @click="seekAudio($event, index)">
                  <div class="progress-bar" :style="{ width: getPlayProgress(index) + '%' }"></div>
                </div>
                <div class="time-display">
                  {{ formatPlayTime(currentPlayTime) }} / {{ formatPlayTime(file.duration || 0) }}
                </div>
              </div>
            </div>
            
            <div class="audio-file-actions" v-if="index === 0">
              <button 
                class="audio-action-btn" 
                @click="applyDetectedBPM" 
                :disabled="!bpmResult || bpmApplied"
                title="将分析出的BPM值应用到项目设置"
              >
                {{ bpmApplied ? '已应用BPM' : '应用BPM到项目' }}
              </button>
              <button 
                class="audio-action-btn" 
                @click="applyDurationToProject(file)" 
                :disabled="durationApplied"
                title="将音频时长应用到项目设置"
              >
                {{ durationApplied ? '已应用时长' : '应用时长到项目' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 音频分析结果和可视化 -->
        <div v-if="bpmAnalysisError || needInstallLib" class="audio-analysis-panel">
          <div v-if="bpmAnalysisError" class="error-message">
            {{ bpmAnalysisError }}
          </div>
          
          <div v-if="needInstallLib" class="info-message">
            需安装依赖库: npm install realtime-bpm-analyzer
          </div>
          
          <div v-if="bpmResult" class="bpm-action">
            <button class="action-btn" @click="applyDetectedBPM" v-if="!bpmApplied">应用检测到的BPM ({{ bpmResult.bpm }})</button>
            <span v-else class="applied-message">已应用检测到的BPM值</span>
          </div>
        </div>

        <div class="form-error" v-if="errors.audio">{{ errors.audio }}</div>
      </div>

        <div class="form-row">
          <div class="form-group quarter">
            <label for="project-bpm">第一帧BPM值</label>
            <ValueInput 
              id="project-bpm" 
              v-model.number="formData.bpm" 
              :min="0.1" 
              :step="0.1"
              @input="validateForm"
            />
            <div v-if="bpmApplied" class="info-value-tag">
              应用BPM: {{ formData.bpm }}
            </div>
          </div>
          
          <div class="form-group half">
            <label for="project-duration">谱面持续时长</label>
            <!-- <TimeInput 
              id="project-duration" 
              v-model="formData.duration" 
              :min="0" 
              @input="validateForm"
              :showHours="true"
              :showMinutes="true"
              :showSeconds="true"
              :showMilliseconds="true"
              @change="onDurationChange"
            /> -->
            <TimeInput 
              v-model="formData.duration" 
              :min="0"
              @input="validateForm"
              :showHours="true"
              :showMinutes="true"
              :showSeconds="true"
              :showMilliseconds="true"
              @change="onValueChange"
            />
            <div v-if="durationApplied" class="info-value-tag">
              应用时长: {{ formatMilliseconds(formData.duration) }}
            </div>
          </div>
          

          
        </div>
      </div>
      
      
      
      <div class="form-section">
        <h3>项目元数据</h3>
        
        <div class="form-group">
          <label for="charter">谱师</label>
          <input id="charter" v-model="formData.charter" type="text" placeholder="谱师名称" />
        </div>
        
        <div class="form-group">
          <label for="composer">曲师</label>
          <input id="composer" v-model="formData.composer" type="text" placeholder="曲师名称" />
        </div>
        
        <div class="form-group">
          <label for="level">谱面难度</label>
          <input id="level" v-model="formData.level" type="text" placeholder="例如: 15、16.5、in 15.5、sp" />
        </div>

        <!-- <div class="form-row">
          <div class="form-group half">
            <label for="output-format">导出格式</label>
            <select id="output-format" v-model="formData.outputFormat">
              <option value="phigine">Phigine</option>
              <option value="rpe" disabled>RPE（暂不支持）</option>
              <option value="phigros" disabled>Phigros（暂不支持）</option>
            </select>
            <div class="field-help">PhiEngine是项目文件格式，RPE和Phigros是导出目标格式</div>
          </div>
        </div> -->
      </div>
    </div>
    
    <div class="dialog-footer">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button class="btn-create" @click="createProject" :disabled="!isFormValid">创建项目</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { getProjectPersistence, initializeServices } from '../../../../core/services/initServices';
import { createPopWindow } from '../index';
import ValueInput from '../../inputs/ValueInput.vue';
import TimeInput from '../../inputs/TimeInput.vue';
import { AudioAnalyzer, AudioFeatures, BPMResult } from '../../../../core/utils/analyzer/AudioAnalyzer';
import { emitEvent } from '../../../../core/events/eventBus';

export default defineComponent({
  name: 'NewProject',
  components: {
    ValueInput,
    TimeInput
  },
  setup(props, { emit }) {
    // 获取项目持久化服务
    let projectPersistence;
    
    try {
      // 尝试获取项目持久化服务
      projectPersistence = getProjectPersistence();
    } catch (error) {
      console.error('项目持久化服务未初始化，正在初始化...', error);
      // 如果服务未初始化，尝试初始化
      initializeServices();
      // 再次尝试获取服务
      try {
        projectPersistence = getProjectPersistence();
        console.log('服务初始化成功');
      } catch (secondError) {
        console.error('无法初始化项目持久化服务，将无法创建项目', secondError);
        // 显示错误提示
        emit('error', { message: '无法初始化项目持久化服务，请刷新页面重试' });
      }
    }
    
    // 音频分析器实例
    const audioAnalyzer = AudioAnalyzer.getInstance();
    
    // 音频文件输入引用
    const audioFileInput = ref<HTMLInputElement | null>(null);
    const waveformCanvas = ref<HTMLCanvasElement | null>(null);
    
    // 音频播放相关
    const audioPlayer = ref<HTMLAudioElement | null>(null);
    const playingIndex = ref<number | null>(null);
    const expandedAudioIndex = ref<number | null>(null);
    const currentPlayTime = ref<number>(0);
    const playTimer = ref<number | null>(null);
    
    // 已选择的音频文件
    const audioFiles = ref<Array<{
      file: File,
      name: string,
      duration?: number,
      size: number
    }>>([]);
    
    // 表单数据
    const formData = reactive({
      name: '未命名项目',
      width: 1920,
      height: 1080,
      frameRate: 30,
      bpm: 120,
      duration: 0,
      charter: '',
      composer: '',
      level: '',
      outputFormat: 'phigine'
    });
    
    // 表单错误信息
    const errors = reactive({
      name: '',
      audio: ''
    });
    
    // 表单验证状态
    const isFormValid = ref(false);
    
    // 音频分析相关状态
    const isAnalyzing = ref(false);
    const isLoading = ref(false);
    const showAudioAnalysis = ref(false);
    const bpmResult = ref<BPMResult | null>(null);
    const activeTab = ref('waveform');
    const waveformData = ref<number[]>([]);
    const bpmAnalysisError = ref<string | null>(null);
    const needInstallLib = ref<boolean>(false);
    const bpmApplied = ref(false);
    const durationApplied = ref(false);
    
    // 音频文件是否已选择
    const isAudioSelected = computed(() => audioFiles.value.length > 0);
    
    // 监视bpmApplied和durationApplied的变化
    watch(bpmApplied, (newValue) => {
      console.log('bpmApplied变化:', newValue);
      // 确保在值变化时强制更新DOM
      nextTick(() => {
        console.log('BPM应用状态已更新到UI');
      });
    });
    
    watch(durationApplied, (newValue) => {
      console.log('durationApplied变化:', newValue);
      // 确保在值变化时强制更新DOM
      nextTick(() => {
        console.log('时长应用状态已更新到UI');
      });
    });
    
    // 计算置信度样式
    const confidenceStyle = computed(() => {
      if (!bpmResult.value) return {};
      
      const confidence = bpmResult.value.confidence;
      let color = '#ff4d4d'; // 低置信度，红色
      
      if (confidence > 0.8) {
        color = '#4CAF50'; // 高置信度，绿色
      } else if (confidence > 0.5) {
        color = '#FFC107'; // 中置信度，黄色
      }
      
      return { color };
    });
    
    // 验证表单
    const validateForm = () => {
      let valid = true;
      
      // 验证项目名称
      if (!formData.name.trim()) {
        errors.name = '项目名称不能为空';
        valid = false;
      } else {
        errors.name = '';
      }
      
      // 验证是否有音频文件
      if (audioFiles.value.length === 0) {
        errors.audio = '至少需要一个音频文件';
        valid = false;
      } else {
        errors.audio = '';
      }
      
      isFormValid.value = valid;
    };
    
    // 初始验证
    validateForm();
    
    // 触发文件选择
    const triggerFileInput = () => {
      if (audioFileInput.value) {
        audioFileInput.value.click();
      }
    };
    
    // 处理音频文件选择
    const handleAudioFiles = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      
      // 重置分析状态 - 先重置，避免旧状态干扰
      resetAnalysis();
      
      const files = Array.from(input.files);
      
      // 处理文件元信息
      for (const file of files) {
        const fileInfo = {
          file,
          name: file.name,
          size: file.size
        };
        
        // 获取音频文件时长
        try {
          const duration = await getAudioDuration(file);
          Object.assign(fileInfo, { duration });
          
          // 如果是第一个文件，更新项目持续时间（秒转毫秒）
          if (audioFiles.value.length === 0) {
            formData.duration = duration * 1000 || 0;
            durationApplied.value = true; // 自动应用时长
            
            // 强制更新UI，确保状态变化反映到界面
            nextTick(() => {
              console.log('初始时长应用状态:', durationApplied.value, formData.duration);
            });
          }
        } catch (error) {
          console.error('获取音频时长失败:', error);
        }
        
        audioFiles.value.push(fileInfo);
      }
      
      validateForm();
      
      // 如果有主音频文件，自动分析BPM
      if (audioFiles.value.length > 0) {
        await analyzeMainAudio();
      }
    };
    
    // 重置音频分析状态
    const resetAnalysis = () => {
      bpmResult.value = null;
      waveformData.value = [];
      bpmAnalysisError.value = null;
      needInstallLib.value = false;
      showAudioAnalysis.value = false;
      bpmApplied.value = false;
      durationApplied.value = false;
      
      // 确保UI刷新
      nextTick(() => {
        console.log('重置应用状态:', bpmApplied.value, durationApplied.value);
      });
    };
    
    // 分析主音频文件
    const analyzeMainAudio = async () => {
      if (audioFiles.value.length === 0) return;
      
      const mainAudioFile = audioFiles.value[0].file;
      const mainAudioUrl = URL.createObjectURL(mainAudioFile);
      
      isAnalyzing.value = true;
      isLoading.value = true;
      bpmAnalysisError.value = null;
      needInstallLib.value = false;
      bpmApplied.value = false;
      
      try {
        // 直接分析BPM，不分析波形
        bpmResult.value = await audioAnalyzer.analyzeAccurateBPM(mainAudioUrl);
        
        // 如果BPM分析成功且值合理
        if (bpmResult.value && bpmResult.value.bpm > 0) {
          // 如果是首次设置或当前BPM是默认值，自动应用
          if (formData.bpm === 0 || formData.bpm === 120) {
            applyDetectedBPM();
          }
        }
      } catch (error) {
        console.error('BPM分析失败:', error);
        
        if (error instanceof Error && error.message.includes('realtime-bpm-analyzer')) {
          bpmAnalysisError.value = '无法使用高级BPM分析';
          needInstallLib.value = true;
        } else {
          bpmAnalysisError.value = `BPM分析失败: ${error instanceof Error ? error.message : '未知错误'}`;
        }
      } finally {
        isAnalyzing.value = false;
        isLoading.value = false;
        
        // 释放创建的URL
        URL.revokeObjectURL(mainAudioUrl);
      }
    };
    
    // 应用检测到的BPM
    const applyDetectedBPM = () => {
      if (bpmResult.value && bpmResult.value.bpm > 0) {
        console.log('应用BPM:', bpmResult.value.bpm);
        formData.bpm = Math.round(bpmResult.value.bpm * 100) / 100; // 保留两位小数
        bpmApplied.value = true; // 标记已应用
        
        // 触发表单验证
        validateForm();
        
        // 强制更新UI，确保状态变化反映到界面
        nextTick(() => {
          console.log('BPM应用状态:', bpmApplied.value);
        });
      }
    };
    
    // 应用音频时长到项目
    const applyDurationToProject = (file: { duration?: number }) => {
      if (file && typeof file.duration === 'number' && file.duration > 0) {
        console.log('应用时长:', file.duration);
        // 将秒转换为毫秒
        const durationMs = Math.round(file.duration * 1000);
        console.log('转换为毫秒:', durationMs);
        formData.duration = durationMs;
        durationApplied.value = true; // 标记已应用
        
        // 触发表单验证
        validateForm();
        
        // 强制更新UI，确保状态变化反映到界面
        nextTick(() => {
          console.log('时长应用状态:', durationApplied.value);
        });
      }
    };
    
    // 格式化毫秒显示
    const formatMilliseconds = (ms: number): string => {
      if (ms <= 0) return '0';
      // 转换为适合阅读的时分秒格式
      const totalSeconds = ms / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.floor((totalSeconds % 1) * 1000);
      
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
      } else {
        return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
      }
    };

    // 处理TimeInput值变化事件
    const onValueChange = (value: number) => {
      console.log('TimeInput值变化:', value);
      formData.duration = value;
      validateForm();
    };
    
    // 获取音频文件时长
    const getAudioDuration = (file: File): Promise<number> => {
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);
        
        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(objectUrl);
          resolve(audio.duration);
        });
        
        audio.addEventListener('error', (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('无法读取音频文件时长'));
        });
        
        audio.src = objectUrl;
      });
    };
    
    // 应用formData.duration为检测出的音频时长 
    const applyDurationToAudio = () => {
      if (audioFiles.value.length > 0 && audioFiles.value[0].duration) {
        formData.duration = audioFiles.value[0].duration * 1000;
      }
    };
    
    // 移除音频文件
    const removeAudioFile = (index: number) => {
      audioFiles.value.splice(index, 1);
      
      // 如果移除了主音频文件，将新的第一个文件的时长设为项目时长
      if (index === 0) {
        // 重置分析结果
        resetAnalysis();
        
        // 如果还有其他音频文件，使用新的第一个文件
        if (audioFiles.value.length > 0 && audioFiles.value[0].duration) {
          formData.duration = audioFiles.value[0].duration * 1000;
          durationApplied.value = true;
          
          nextTick(() => {
            console.log('新主音频时长应用状态:', durationApplied.value);
          });
        }
      }
      
      validateForm();
    };
    
    // 格式化持续时间
    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    };
    
    // 取消创建
    const cancel = () => {
      emit('cancel');
    };
    
    // 创建项目
    const createProject = () => {
      if (!isFormValid.value) return;
      
      try {
        // 确保有项目持久化服务
        if (!projectPersistence) {
          console.error('无法创建项目，持久化服务不可用');
          emit('error', { message: '无法创建项目，服务不可用' });
          return;
        }
        
        // 准备项目设置
        const projectSettings = {
          name: formData.name.trim(),
          width: formData.width,
          height: formData.height,
          frameRate: formData.frameRate,
          duration: formData.duration,
          format: formData.outputFormat,
          meta: {
            name: formData.name.trim(),
            charter: formData.charter || '未知谱师',
            composer: formData.composer || '未知作曲家',
            level: formData.level || '??'
          }
        };
        
        // 创建新项目
        const newProject = projectPersistence.createNewProject(formData.name.trim());
        
        // 更新项目设置
        Object.assign(newProject.settings, projectSettings);
        Object.assign(newProject.settings.meta, projectSettings.meta);
        
        // 设置项目格式
        newProject.format = 'phigine'; // 项目文件始终是phigine格式
        
        // 设置BPM列表，添加初始BPM点
        newProject.settings.BPMList = [{
          bpm: formData.bpm,
          startTime: 0,
          measure: 4, // 默认4/4拍
          unit: 4,
          offset: 0,
          isMain: true
        }];
        
        // 导入音频文件
        if (audioFiles.value.length > 0) {
          // 在实际应用中，这里应该调用资源管理器服务导入音频文件
          // 这里仅做模拟，实际项目中需要替换为实际的音频导入逻辑
          const audioFilePaths = audioFiles.value.map(audioFile => {
            return {
              name: audioFile.name,
              path: URL.createObjectURL(audioFile.file),
              duration: audioFile.duration || 0
            };
          });
          
          // 设置主音频文件路径
          if (audioFilePaths.length > 0) {
            newProject.settings.meta.song = audioFilePaths[0].path;
          }
          
          // 发送音频文件导入事件，让其他组件处理实际的文件导入
          document.dispatchEvent(new CustomEvent('import-audio', { 
            detail: audioFiles.value.map(af => af.file)
          }));
        }
        
        // 发送创建成功事件
        document.dispatchEvent(new CustomEvent('project-created', { 
          detail: newProject
        }));
        
        // 发送全局通知事件让其他组件更新
        emitEvent('project:current:changed', { project: newProject });
        
        // 全局通知
        emitEvent('notification:show', {
          type: 'success',
          title: '项目创建成功',
          message: `项目 "${newProject.settings.name}" 已创建`,
          duration: 3000
        });
        
        // 本地组件事件
        emit('created', newProject);
        
        // 关闭弹窗
        emit('close');
        
      } catch (error) {
        console.error('创建项目失败:', error);
        emit('error', error);
      }
    };
    
    // 切换播放器显示状态
    const toggleAudioPlayer = (index: number) => {
      if (expandedAudioIndex.value === index) {
        expandedAudioIndex.value = null;
      } else {
        expandedAudioIndex.value = index;
        // 初始化播放器但不自动播放
        initAudioPlayer(index);
      }
    };
    
    // 初始化音频播放器
    const initAudioPlayer = (index: number) => {
      // 如果没有音频播放器，创建一个
      if (!audioPlayer.value) {
        audioPlayer.value = new Audio();
        
        // 配置播放器事件
        audioPlayer.value.onended = () => {
          playingIndex.value = null;
          currentPlayTime.value = 0;
          stopPlayTimer();
        };
        
        audioPlayer.value.ontimeupdate = () => {
          if (audioPlayer.value) {
            currentPlayTime.value = audioPlayer.value.currentTime;
          }
        };
      }
      
      // 准备音频源
      if (playingIndex.value !== index) {
        const file = audioFiles.value[index].file;
        const audioUrl = URL.createObjectURL(file);
        
        // 停止之前的播放
        if (playingIndex.value !== null) {
          audioPlayer.value.pause();
        }
        
        audioPlayer.value.src = audioUrl;
        audioPlayer.value.load();
      }
    };
    
    // 播放/暂停音频
    const togglePlayAudio = (index: number) => {
      if (!audioPlayer.value) {
        initAudioPlayer(index);
      }
      
      // 如果点击的是当前正在播放的音频，暂停播放
      if (playingIndex.value === index) {
        audioPlayer.value.pause();
        playingIndex.value = null;
        stopPlayTimer();
        return;
      }
      
      // 播放选中的音频
      audioPlayer.value.play()
        .then(() => {
          playingIndex.value = index;
          startPlayTimer();
        })
        .catch(error => {
          console.error('音频播放失败:', error);
        });
    };
    
    // 开始定时更新播放时间
    const startPlayTimer = () => {
      stopPlayTimer();
      playTimer.value = window.setInterval(() => {
        if (audioPlayer.value) {
          currentPlayTime.value = audioPlayer.value.currentTime;
        }
      }, 100);
    };
    
    // 停止定时更新
    const stopPlayTimer = () => {
      if (playTimer.value) {
        clearInterval(playTimer.value);
        playTimer.value = null;
      }
    };
    
    // 获取播放进度百分比
    const getPlayProgress = (index: number): number => {
      if (playingIndex.value !== index || !audioPlayer.value || !audioFiles.value[index].duration) {
        return 0;
      }
      
      const progress = (currentPlayTime.value / audioFiles.value[index].duration) * 100;
      return Math.min(progress, 100);
    };
    
    // 点击进度条跳转播放位置
    const seekAudio = (event: MouseEvent, index: number) => {
      if (!audioPlayer.value || !audioFiles.value[index].duration) return;
      
      const progressContainer = event.currentTarget as HTMLElement;
      const rect = progressContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const containerWidth = rect.width;
      const percentage = clickX / containerWidth;
      
      const seekTime = percentage * audioFiles.value[index].duration;
      audioPlayer.value.currentTime = seekTime;
      currentPlayTime.value = seekTime;
      
      // 如果没有播放，自动开始播放
      if (playingIndex.value !== index) {
        togglePlayAudio(index);
      }
    };
    
    // 格式化播放时间显示
    const formatPlayTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 组件卸载时清理资源
    onBeforeUnmount(() => {
      // 清理音频分析器
      audioAnalyzer.dispose();
      
      // 停止定时器
      stopPlayTimer();
      
      // 停止并清理音频播放器
      if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value.src = '';
      }
    });

    // 在组件挂载后初始化一些内容
    onMounted(() => {
      // 初始化状态
      bpmApplied.value = false;
      durationApplied.value = false;
      
      // 打印初始状态
      console.log('组件挂载初始状态:', {
        bpmApplied: bpmApplied.value,
        durationApplied: durationApplied.value
      });
    });
    
    return {
      formData,
      errors,
      isFormValid,
      audioFiles,
      audioFileInput,
      waveformCanvas,
      isAudioSelected,
      isAnalyzing,
      isLoading,
      showAudioAnalysis,
      bpmResult,
      activeTab,
      bpmAnalysisError,
      needInstallLib,
      confidenceStyle,
      validateForm,
      triggerFileInput,
      handleAudioFiles,
      removeAudioFile,
      analyzeMainAudio,
      applyDetectedBPM,
      formatDuration,
      formatFileSize,
      cancel,
      createProject,
      bpmApplied,
      durationApplied,
      applyDurationToProject,
      applyDurationToAudio,
      formatMilliseconds,
      onValueChange,
      playingIndex,
      togglePlayAudio,
      expandedAudioIndex,
      currentPlayTime,
      toggleAudioPlayer,
      initAudioPlayer,
      getPlayProgress,
      seekAudio,
      formatPlayTime
    };
  }
});
</script>

<style scoped>
.new-project-dialog {
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

.form-row {
  display: flex;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}
.form-group.full {
  width: 100%;
}
.form-group.half {
  width: calc(50% - 7.5px);
}
.form-group.triple {
  width: calc(33.33% - 11.25px);
}

.form-group.quarter {
  width: calc(25% - 11.25px);
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

.form-error {
  display: block;
  margin-top: 4px;
  color: #ff6b6b;
  font-size: 12px;
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

.btn-create {
  background-color: #7289da;
  color: white;
}

.btn-create:hover {
  background-color: #5e76d3;
}

.btn-create:disabled {
  background-color: #4d5a85;
  color: #aaa;
  cursor: not-allowed;
}

.section-desc {
  margin: -10px 0 15px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

.field-help {
  margin-top: 4px;
  font-size: 11px;
  color: #777;
}

/* 音频上传样式 */
.audio-upload {
  width: 100%;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
  margin: 0;
  background-color: #3a3a3a;
  border: 1px dashed #666;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background-color: #444;
  border-color: #7289da;
  color: #ddd;
}

.upload-icon {
  font-size: 20px;
  margin-right: 10px;
}

.upload-text {
  font-size: 14px;
}

/* 音频文件列表样式 */
.audio-files-list {
  margin-top: 15px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
}

.audio-files-list h4 {
  margin: 0;
  padding: 10px;
  font-size: 12px;
  font-weight: normal;
  color: #aaa;
  background-color: #383838;
  border-bottom: 1px solid #444;
}

.audio-file {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-bottom: 1px solid #3c3c3c;
}

.audio-file:last-child {
  border-bottom: none;
}

.audio-file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.audio-file-name {
  font-size: 13px;
  color: #ddd;
  margin-bottom: 4px;
}

.audio-file-meta {
  font-size: 11px;
  color: #888;
}

.audio-file-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-main-tag {
  background-color: #4a6bbd;
  color: white;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  cursor: default;
}

.audio-analyze-btn {
  background-color: #2196F3;
  color: white;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.audio-analyze-btn:hover {
  background-color: #1976D2;
}

.audio-analyze-btn:disabled {
  background-color: #4d5a85;
  color: #aaa;
  cursor: wait;
}

.audio-remove {
  background-color: transparent;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  font-size: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-remove:hover {
  background-color: #d63031;
  color: white;
}

/* 音频分析面板样式 */
.audio-analysis-panel {
  margin-top: 15px;
  background-color: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
}

.analysis-tabs {
  display: flex;
  border-bottom: 1px solid #333;
}

.tab-btn {
  padding: 8px 16px;
  background-color: transparent;
  color: #e0e0e0;
  border: none;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  transition: color 0.2s;
  margin: 0;
}

.tab-btn:hover {
  color: #fff;
}

.tab-btn.active {
  color: #4CAF50;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4CAF50;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  gap: 16px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.visualization-container {
  padding: 15px;
}

.visualization-panel {
  background-color: #272727;
  border-radius: 4px;
  overflow: hidden;
}

.visualization-panel canvas {
  width: 100%;
  height: 150px;
  display: block;
}

.empty-result {
  padding: 20px;
  text-align: center;
  color: #888;
}

.bpm-result {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header {
  display: flex;
  align-items: center;
}

.result-label {
  font-size: 13px;
  color: #888;
  margin-right: 10px;
}

.result-value {
  font-size: 20px;
  font-weight: 500;
  color: #4CAF50;
  margin-right: 8px;
}

.confidence-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
}

.result-action {
  display: flex;
  align-items: center;
}

.action-btn {
  padding: 4px 12px;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #45a049;
}

.error-message {
  margin: 10px;
  padding: 8px 12px;
  background-color: rgba(255, 0, 0, 0.15);
  border-left: 3px solid #f44336;
  color: #f44336;
  border-radius: 0 4px 4px 0;
}

.info-message {
  margin: 10px;
  padding: 8px 12px;
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
  color: #90caf9;
  font-style: italic;
  border-radius: 0 4px 4px 0;
}

.bpm-result-tag {
  background-color: #2196F3;
  color: white;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.confidence-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.analyzing-tag {
  background-color: #555;
  color: #ddd;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
}

.bpm-action {
  padding: 15px;
  display: flex;
  justify-content: center;
}

.applied-message {
  color: #4CAF50;
  font-size: 13px;
}

.audio-file-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-left: 8px;
}

.audio-action-btn {
  background-color: #555;
  color: #e0e0e0;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  transition: background-color 0.2s;
  margin: 0;
}

.audio-action-btn:hover {
  background-color: #666;
}

.audio-action-btn:disabled {
  background-color: #444;
  color: #777;
  cursor: not-allowed;
}

.audio-toggle-player {
  background-color: #4CAF50;
  color: white;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  transition: background-color 0.2s;
  margin: 0;
}

.audio-toggle-player:hover {
  background-color: #45a049;
}

.audio-toggle-player.active {
  background-color: #2196F3;
}

/* 音频播放器样式 */
.audio-player-container {
  margin-top: 8px;
  margin-bottom: 8px;
  padding: 0 8px;
  border-radius: 4px;
  background-color: #272727;
}

.audio-player {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 8px;
}

.player-control {
  background-color: #4CAF50;
  color: white;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  margin: 0;
  transition: background-color 0.2s;
}

.player-control:hover {
  background-color: #45a049;
}

.progress-container {
  flex: 1;
  height: 4px;
  background-color: #444;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.progress-bar {
  height: 100%;
  background-color: #2196F3;
  border-radius: 2px;
  width: 0;
}

.time-display {
  font-size: 10px;
  color: #aaa;
  min-width: 80px;
  text-align: right;
}

.info-value-tag {
  margin-top: 5px;
  padding: 3px 8px;
  background-color: #2196F3;
  color: white;
  font-size: 11px;
  border-radius: 3px;
  display: inline-block;
}
</style>