<template>
  <div class="pop-window-container">
    <!-- 弹出窗口列表 -->
    <component 
      v-for="window in visibleWindows"
      :key="window.id"
      :is="BasePopWidght"
      :title="window.title"
      :zIndexBase="window.zIndex"
      v-bind="getWindowProps(window)"
      @close="closeWindow(window.id)"
      @minimize="minimizeWindow(window.id)"
      @maximize="activateWindow(window.id)"
      @restore="activateWindow(window.id)"
      @active="activateWindow(window.id)"
    >
      <component 
        :is="window.component" 
        v-bind="window.props" 
      />
    </component>

    <!-- 窗口任务栏（最小化的窗口列表） -->
    <div class="window-taskbar" v-if="minimizedWindows.length > 0">
      <button 
        v-for="window in minimizedWindows" 
        :key="window.id"
        class="taskbar-item"
        @click="restoreWindow(window.id)"
      >
        {{ window.title }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, markRaw } from 'vue';
import BasePopWidght from './BasePopWidght.vue';
import popWindowManager from './PopWindowManager';

export default defineComponent({
  name: 'PopWindowContainer',
  components: {
    BasePopWidght: markRaw(BasePopWidght)
  },
  setup() {
    // 获取可见窗口列表（非最小化）
    const visibleWindows = computed(() => {
      return popWindowManager.getWindows().filter(window => 
        window.isVisible && !window.isMinimized
      );
    });

    // 获取最小化的窗口列表
    const minimizedWindows = computed(() => {
      return popWindowManager.getMinimizedWindows();
    });

    // 获取窗口组件需要的props
    const getWindowProps = (window: any) => {
      // 计算窗口的初始位置，让每个新窗口错开显示
      const windowIndex = popWindowManager.getWindows().indexOf(window);
      return {
        initialX: 100 + (windowIndex * 30),
        initialY: 100 + (windowIndex * 30)
      };
    };

    // 窗口操作函数
    const closeWindow = (id: string) => {
      popWindowManager.closeWindow(id);
    };

    const minimizeWindow = (id: string) => {
      popWindowManager.minimizeWindow(id);
    };

    const restoreWindow = (id: string) => {
      popWindowManager.restoreWindow(id);
    };

    const activateWindow = (id: string) => {
      popWindowManager.activateWindow(id);
    };

    return {
      BasePopWidght,
      visibleWindows,
      minimizedWindows,
      getWindowProps,
      closeWindow,
      minimizeWindow,
      restoreWindow,
      activateWindow
    };
  }
});
</script>

<style scoped>
.pop-window-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 允许点击透过容器到下层内容 */
  z-index: 999; /* 确保窗口容器位于应用其他内容之上 */
}

/* 窗口内部内容需要响应点击 */
.pop-window-container :deep(.ae-pop-window) {
  pointer-events: auto;
}

/* 任务栏样式 */
.window-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: #2d2d2d;
  border-top: 1px solid #444;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  z-index: 1000;
  pointer-events: auto; /* 任务栏可以点击 */
}

.taskbar-item {
  padding: 0 10px;
  height: 22px;
  background-color: #383838;
  border: 1px solid #444;
  border-radius: 3px;
  margin-right: 5px;
  color: #e8e8e8;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.taskbar-item:hover {
  background-color: #505050;
}
</style> 