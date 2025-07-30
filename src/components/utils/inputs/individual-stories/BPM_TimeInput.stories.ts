import type { Meta, StoryObj } from '@storybook/vue3';
import BPM_TimeInput from '../BPM_TimeInput.vue';
import { ref, computed, watch } from 'vue';

// 元数据配置
const meta = {
  title: 'INPUTS/BPM_TimeInput',
  component: BPM_TimeInput,
  tags: ['autodocs'],
} satisfies Meta<typeof BPM_TimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
export const Default: Story = {
  render: () => ({
    components: { BPM_TimeInput },
    setup() {
      const bpm = ref(120);
      const timeSignature = ref(4);
      const isLocked = ref(false);
      
      const beatDurationMs = computed(() => {
        return (60000 / bpm.value).toFixed(2);
      });
      
      return { 
        bpm, 
        timeSignature, 
        isLocked, 
        beatDurationMs 
      };
    },
    template: `
      <div>
        <BPM_TimeInput 
          v-model:bpm="bpm" 
          v-model:timeSignature="timeSignature"
          @update:locked="isLocked = $event"
        />
        
        <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
          <h3 style="margin-top: 0;">当前值</h3>
          <div><strong>BPM:</strong> {{ bpm }}</div>
          <div><strong>拍号:</strong> {{ timeSignature }}</div>
          <div><strong>每拍时长:</strong> {{ beatDurationMs }} 毫秒</div>
          <div><strong>锁定状态:</strong> {{ isLocked ? '已锁定' : '未锁定' }}</div>
        </div>
      </div>
    `
  })
};

// 仅BPM输入
export const BpmOnly: Story = {
  render: () => ({
    components: { BPM_TimeInput },
    setup() {
      const bpm = ref(140);
      
      
      return { bpm };
    },
    template: `
      <div>
        <BPM_TimeInput 
          v-model:bpm="bpm" 
          :show-time-signature="false"
        />
        
        <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
          <div><strong>BPM:</strong> {{ bpm }}</div>
          <div><strong>每拍时长:</strong> {{ (60000 / bpm).toFixed(2) }} 毫秒</div>
        </div>
      </div>
    `
  })
};

// 特殊范围
export const CustomRange: Story = {
  render: () => ({
    components: { BPM_TimeInput },
    setup() {
      const bpm = ref(60);
      const timeSignature = ref(3);
      
      return { bpm, timeSignature };
    },
    template: `
      <div>
        <BPM_TimeInput 
          v-model:bpm="bpm" 
          v-model:timeSignature="timeSignature"
          :min-bpm="40"
          :max-bpm="180"
        />
        
        <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
          <div><strong>BPM:</strong> {{ bpm }} (范围: 40-180)</div>
          <div><strong>拍号:</strong> {{ timeSignature }}</div>
        </div>
      </div>
    `
  })
};

// 拍子分数示例
export const FractionalTimeSignature: Story = {
  render: () => ({
    components: { BPM_TimeInput },
    setup() {
      const bpm = ref(120);
      const timeSignature = ref(3.5); // 3 + 1/2 拍
      
      // 监听时间签名变化
      watch(timeSignature, (newVal) => {
        console.log(`时间签名更新为: ${newVal}`);
      });
      
      // 计算每小节时间（毫秒）
      const barDurationMs = computed(() => {
        return (60000 / bpm.value * timeSignature.value).toFixed(2);
      });
      
      return { 
        bpm, 
        timeSignature,
        barDurationMs
      };
    },
    template: `
      <div>
        <BPM_TimeInput 
          v-model:bpm="bpm" 
          v-model:timeSignature="timeSignature"
        />
        
        <div style="margin-top: 20px; padding: 10px; background-color:rgb(245, 245, 245); border-radius: 4px;">
          <h3 style="margin-top: 0;">当前值</h3>
          <div><strong>BPM:</strong> {{ bpm }}</div>
          <div><strong>拍号:</strong> {{ timeSignature }}</div>
          <div><strong>每小节时长:</strong> {{ barDurationMs }} 毫秒</div>
        </div>
      </div>
    `
  })
};
//限制分母测试
export const DenominatorLimit: Story = {
  render: () => ({
    components: { BPM_TimeInput },
    setup() {
      const bpm = ref(120);
      const timeSignature = ref(4);
      const denominatorList = ref([1, 2, 4, 8, 16]);
      return { bpm, timeSignature, denominatorList };
    },
    template: `
      <div>
        <BPM_TimeInput 
          v-model:bpm="bpm" 
          v-model:timeSignature="timeSignature"
          :denominatorList="denominatorList"
        />
      </div>
    `
  })
}

// 交互式BPM计算器
export const InteractiveBpmCalculator: Story = {
  render: () => ({
    components: { BPM_TimeInput },
    setup() {
      const bpm = ref(120);
      const timeSignature = ref(4);
      const isLocked = ref(false);
      
      // 计算相关值
      const beatDurationMs = computed(() => (60000 / bpm.value).toFixed(2));
      const beatDurationSec = computed(() => (60 / bpm.value).toFixed(2));
      const barDurationMs = computed(() => (60000 / bpm.value * timeSignature.value).toFixed(2));
      const beatsPerSecond = computed(() => (bpm.value / 60).toFixed(2));
      
      // 常见音符时值（以四分音符为1拍）
      const noteDurations = computed(() => {
        const quarterNote = 60000 / bpm.value;
        return {
          whole: (quarterNote * 4).toFixed(2),        // 全音符
          half: (quarterNote * 2).toFixed(2),         // 二分音符
          quarter: quarterNote.toFixed(2),            // 四分音符
          eighth: (quarterNote / 2).toFixed(2),       // 八分音符
          sixteenth: (quarterNote / 4).toFixed(2),    // 十六分音符
          triplet: (quarterNote / 3).toFixed(2)       // 三连音
        };
      });
      
      return { 
        bpm,
        timeSignature,
        isLocked,
        beatDurationMs,
        beatDurationSec,
        barDurationMs,
        beatsPerSecond,
        noteDurations
      };
    },
    template: `
      <div>
        <h2>BPM计算器</h2>
        
        <BPM_TimeInput 
          v-model:bpm="bpm" 
          v-model:timeSignature="timeSignature"
          @update:locked="isLocked = $event"
        />
        
        <div style="margin-top: 20px;">
          <h3>时间计算</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr>
              <th style="padding: 8px; border-bottom: 1px solid #ddd;">参数</th>
              <th style="padding: 8px; border-bottom: 1px solid #ddd;">值</th>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">每拍时长</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ beatDurationMs }} 毫秒 ({{ beatDurationSec }} 秒)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">每小节时长</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ barDurationMs }} 毫秒</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">每秒拍数</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ beatsPerSecond }} 拍/秒</td>
            </tr>
          </table>
          
          <h3>音符时值 (毫秒)</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr>
              <th style="padding: 8px; border-bottom: 1px solid #ddd;">音符类型</th>
              <th style="padding: 8px; border-bottom: 1px solid #ddd;">时长 (ms)</th>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">全音符</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ noteDurations.whole }}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">二分音符</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ noteDurations.half }}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">四分音符 (1拍)</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ noteDurations.quarter }}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">八分音符</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ noteDurations.eighth }}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">十六分音符</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ noteDurations.sixteenth }}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">三连音</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{ noteDurations.triplet }}</td>
            </tr>
          </table>
        </div>
      </div>
    `
  })
}; 