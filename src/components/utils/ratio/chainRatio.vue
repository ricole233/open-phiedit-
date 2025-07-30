<template>
  <div class="chain-ratio-container" @click="toggleRatio">
    <div class="chain-icon" :class="{ 'active': value }">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChainRatio',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleRatio() {
      const newValue = !this.value;
      this.$emit('input', newValue);
      this.$emit('change', newValue);
      console.log('ChainRatio toggled:', newValue); // 添加调试日志
    }
  }
}
</script>

<style scoped>
.chain-ratio-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin-left: 4px;
  border-radius: 3px;
}

.chain-ratio-container:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.chain-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a5a5a; /* 未激活状态的颜色 */
  opacity: 0;
}

.chain-icon.active {
  color: #00a8ff; /* 激活状态的颜色 */
  opacity: 1;
}
</style>
