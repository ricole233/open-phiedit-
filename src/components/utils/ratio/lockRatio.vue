<template>
  <div class="ratio-lock-container" @click="toggleLocked">
    <div class="ratio-icon" :class="{ locked: modelValue }">
      <div class="lock-body"></div>
      <div class="lock-shackle"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'lockRatio',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    toggleLocked() {
      const newValue = !this.modelValue;
      this.$emit('update:modelValue', newValue);
      this.$emit('change', newValue);
    }
  }
};
</script>

<style scoped>
.ratio-lock-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: 0 4px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.ratio-lock-container:hover {
  opacity: 1;
}

.ratio-icon {
  position: relative;
  width: 100%;
  height: 100%;
}

.lock-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 6px;
  background-color: #ff0000;
  border-radius: 1px;
  transition: background-color 0.2s ease;
}

.lock-shackle {
  position: absolute;
  top: 2px;
  left: 50%;
  width: 6px;
  height: 6px;
  border: 2px solid #ff0000;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
}

/* 锁定状态 */
.ratio-icon.locked .lock-shackle {
  border-color: #00a8ff;
  transform: translateX(-50%) translateY(0);
}

.ratio-icon.locked .lock-body {
  background-color: #00a8ff;
}

/* 未锁定状态 */
.ratio-icon:not(.locked) .lock-shackle {
  border-color: #ff0000;
  transform: translateX(-50%) translateY(-2px) rotate(-10deg);
}
</style>
