<template>
  <div class="lock-value-input-container">
    <value-input 
      :modelValue="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :precision="precision"
      :disabled="locked"
      :allowed-values="allowedValues"
      @update:modelValue="onValueUpdate"
    />
    <div 
      class="lock-button" 
      :class="{ 'locked': locked }"
      @click="toggleLock"
    >
      <span class="lock-icon">{{ locked ? '🔒' : '🔓' }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ValueInput from './ValueInput.vue';

export default defineComponent({
  name: 'LockValueInput',
  components: {
    ValueInput
  },
  props: {
    modelValue: {
      type: [Number, String],
      default: 0
    },
    min: {
      type: Number,
      default: -Infinity
    },
    max: {
      type: Number,
      default: Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    precision: {
      type: Number,
      default: 0
    },
    defaultLocked: {
      type: Boolean,
      default: false
    },
    allowedValues: {
      type: Array as () => number[],
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:locked'],
  setup(props, { emit }) {
    const locked = ref(props.defaultLocked);

    function toggleLock() {
      locked.value = !locked.value;
      emit('update:locked', locked.value);
    }

    function onValueUpdate(val: number) {
      if (!locked.value) {
        emit('update:modelValue', val);
      }
    }

    return {
      locked,
      toggleLock,
      onValueUpdate
    };
  }
});
</script>

<style scoped>
.lock-value-input-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.lock-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  background-color: #2c2c2c;
  border-radius: 3px;
  cursor: pointer;
  user-select: none;
}

.lock-button:hover {
  background-color: #3a3a3a;
}

.lock-button.locked {
  background-color: #4a4a4a;
}

.lock-icon {
  font-size: 12px;
  line-height: 1;
}
</style>
