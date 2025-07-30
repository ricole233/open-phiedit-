<template>
  <div class="bpm-input-container">
    <div class="bpm-section">
      <div class="label">BPM</div>
      <LockValueInput
        v-model="bpmValue"
        :min="minBpm"
        :max="maxBpm"
        :step="1"
        :precision="2"
        :default-locked="bpmLocked"
        @update:modelValue="onBpmChange"
        @update:locked="onBpmLocked"
      />
    </div>
    <div v-if="showTimeSignature" class="time-section">
      <div class="label">拍数（时间值）</div>
      <MixNumber 
        v-model="timeSignatureValue"
        @update:modelValue="onTimeSignatureChange" 
        :precision="precision"
        :step="0.25"
        :denominator-list="denominatorList"
        :denominator="denominator"
        :denominator-locked="denominatorLocked"
        @update:denominatorLocked="onDenominatorLockChange"
       />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import LockValueInput from './LockValueInput.vue';
import MixNumber from './MixNumber.vue';

export default defineComponent({
  name: 'BPM_TimeInput',
  components: {
    LockValueInput,
    MixNumber
  },
  props: {
    bpm: {
      type: Number,
      default: 120
    },
    timeSignature: {
      type: Number,
      default: 4
    },
    timevalue: {
      type: Number,
      default: 0
    },
    minBpm: {
      type: Number,
      default: 10
    },
    maxBpm: {
      type: Number,
      default: 500
    },
    showTimeSignature: {
      type: Boolean,
      default: true
    },
    precision: {
      type: Number,
      default: 2
    },
    denominatorList: {
      type: Array as () => number[],
      default: () => []
    },
    denominator: {
      type: Number,
      default: 4
    },
    denominatorLocked: {
      type: Boolean,
      default: false
    },
    bpmLocked: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:bpm', 'update:timeSignature', 'update:locked', 'update:denominatorLocked', 'update:timevalue'],
  setup(props, { emit }) {
    // BPM数值
    const bpmValue = ref(props.bpm);
    const timeSignatureValue = ref(props.timeSignature);
    const isBpmLocked = ref(props.bpmLocked);
    const timeValue = ref(props.timevalue);

    // 监听属性变化
    watch(() => props.bpm, (newValue) => {
      if (newValue !== bpmValue.value) {
        bpmValue.value = newValue;
      }
    });

    watch(() => props.timeSignature, (newValue) => {
      if (newValue !== timeSignatureValue.value) {
        timeSignatureValue.value = newValue;
      }
    });

    watch(() => props.timevalue, (newValue) => {
      if (newValue !== timeValue.value) {
        timeValue.value = newValue;
      }
    });

    // 计算每拍时间（毫秒）
    const beatDuration = computed(() => {
      return 60000 / bpmValue.value;
    });

    // 监听BPM或时间值的变化，更新另一个值
    watch(timeValue, (newValue) => {
      emit('update:timevalue', newValue);
    });

    // BPM改变事件处理
    function onBpmChange(value: number) {
      bpmValue.value = value;
      emit('update:bpm', value);
    }

    // 拍号改变事件处理
    function onTimeSignatureChange(value: number) {
      timeSignatureValue.value = value;
      emit('update:timeSignature', value);
    }

    // BPM锁定状态改变
    function onBpmLocked(locked: boolean) {
      isBpmLocked.value = locked;
      emit('update:locked', locked);
    }

    // 分母锁定状态改变
    function onDenominatorLockChange(locked: boolean) {
      emit('update:denominatorLocked', locked);
    }

    return {
      bpmValue,
      timeSignatureValue,
      timeValue,
      beatDuration,
      onBpmChange,
      onTimeSignatureChange,
      onBpmLocked,
      onDenominatorLockChange
    };
  }
});
</script>

<style scoped>
.bpm-input-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.bpm-section, .time-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}
</style>
