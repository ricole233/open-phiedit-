<template>
  <div class="mix-number-container">
    <ValueInput
      v-model="integerPart"
      :step="1"
      :precision="0"
      @update:modelValue="onIntegerChange"
    />
    <span class="separator">+</span>
    <ValueInput
      v-model="numerator"
      :min="0"
      :max="denominatorValue - 1"
      :step="1"
      :precision="0"
      :loop="true"
      @update:modelValue="onNumeratorChange"
      @intplus="handleNumeratorIntPlus"
    />
    <span class="separator">/</span>
    <LockValueInput
      v-model="denominatorValue"
      :min="1"
      :step="1"
      :precision="0"
      :allowed-values="denominatorListProp"
      :default-locked="isDenominatorLocked"
      @update:modelValue="onDenominatorChange"
      @update:locked="onDenominatorLockChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import ValueInput from './ValueInput.vue';
import LockValueInput from './LockValueInput.vue';

export default defineComponent({
  name: 'MixNumber',
  components: {
    ValueInput,
    LockValueInput,
  },
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    precision: {
      type: Number,
      default: 2
    },
    step: {
      type: Number,
      default: 1
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
    }
  },
  emits: ['update:modelValue', 'update:denominatorLocked'],
  setup(props, { emit }) {
    const integerPart = ref(0);
    const numerator = ref(0);
    const denominatorValue = ref(props.denominator);
    const isDenominatorLocked = ref(props.denominatorLocked);
    
    // 创建一个计算属性用于模板中
    const denominatorListProp = computed(() => {
      return props.denominatorList.length > 0 ? props.denominatorList : undefined;
    });

    // 如果有分母列表，初始化时选择第一个有效的分母
    watch(() => props.denominatorList, (newList) => {
      if (newList.length > 0 && !newList.includes(denominatorValue.value)) {
        denominatorValue.value = newList[0];
        updatePartsFromValue(props.modelValue);
      }
    }, { immediate: true });

    // 监听分母属性变化
    watch(() => props.denominator, (newValue) => {
      if (newValue !== denominatorValue.value) {
        const oldValue = internalValue.value;
        denominatorValue.value = newValue;
        updatePartsFromValue(oldValue);
      }
    });

    // 监听分母锁定状态变化
    watch(() => props.denominatorLocked, (newValue) => {
      isDenominatorLocked.value = newValue;
    });

    const internalValue = computed(() => {
      const sign = Math.sign(integerPart.value) || 1;
      return integerPart.value + sign * (numerator.value / denominatorValue.value);
    });

    function updatePartsFromValue(value: number) {
      const sign = Math.sign(value) || 1;
      const absValue = Math.abs(value);
      integerPart.value = Math.trunc(value);
      
      const remainder = absValue - Math.floor(absValue);
      if (remainder > 1e-9) {
          const newNumerator = remainder * denominatorValue.value;
          numerator.value = Math.round(newNumerator);
      } else {
          numerator.value = 0;
      }
    }

    watch(() => props.modelValue, (newValue) => {
      if (Math.abs(newValue - internalValue.value) > 1e-9) {
        updatePartsFromValue(newValue);
      }
    }, { immediate: true });

    function onIntegerChange() {
      emit('update:modelValue', internalValue.value);
    }

    function onNumeratorChange() {
      emit('update:modelValue', internalValue.value);
    }

    function handleNumeratorIntPlus(event: { plus: number }) {
      if (event.plus) {
        // 根据 plus 值更新整数部分
        const intChange = Math.floor(event.plus);
        if (intChange !== 0) {
          integerPart.value += intChange;
          emit('update:modelValue', internalValue.value);
        }
      }
    }

    function onDenominatorChange(newDenominator: number) {
      const oldValue = internalValue.value;
      if (newDenominator > 0) {
        // 检查分母是否在允许的列表中
        const denominatorList = props.denominatorList;
        if (denominatorList.length > 0 && !denominatorList.includes(newDenominator)) {
          // 找到最接近的有效分母值
          let closest = denominatorList[0];
          let minDiff = Math.abs(newDenominator - closest);
          
          for (const denom of denominatorList) {
            const diff = Math.abs(newDenominator - denom);
            if (diff < minDiff) {
              closest = denom;
              minDiff = diff;
            }
          }
          denominatorValue.value = closest;
        } else {
          denominatorValue.value = newDenominator;
        }
        updatePartsFromValue(oldValue);
        emit('update:modelValue', internalValue.value);
      }
    }

    function onDenominatorLockChange(locked: boolean) {
      isDenominatorLocked.value = locked;
      emit('update:denominatorLocked', locked);
    }
    
    return {
      integerPart,
      numerator,
      denominatorValue,
      isDenominatorLocked,
      onIntegerChange,
      onNumeratorChange,
      handleNumeratorIntPlus,
      onDenominatorChange,
      onDenominatorLockChange,
      denominatorListProp
    };
  },
});
</script>

<style scoped>
.mix-number-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.separator {
  color: #ccc;
  user-select: none;
}
</style>
