<template>
  <div class="ae-demo">
    <div class="demo-header">
      <h1>AE 风格弹出窗口演示</h1>
      <p>这个演示展示了类似 Adobe After Effects 的弹出窗口系统。</p>
    </div>
    
    <div class="demo-controls">
      <button @click="openDemoWindow">打开演示窗口</button>
      <button @click="openMultipleWindows">打开多个窗口</button>
      <button @click="closeAllWindows">关闭所有窗口</button>
    </div>
    
    <div class="demo-status">
      <h3>窗口状态</h3>
      <div v-if="windows.length === 0" class="empty-state">
        没有打开的窗口
      </div>
      <ul v-else>
        <li v-for="window in windows" :key="window.id">
          {{ window.title }} 
          <span class="status-badge" :class="{ 'active': window.id === activeWindowId }">
            {{ window.isMinimized ? '已最小化' : (window.id === activeWindowId ? '活动窗口' : '正常') }}
          </span>
          <button @click="activateWindow(window.id)">激活</button>
          <button @click="closeWindow(window.id)">关闭</button>
        </li>
      </ul>
    </div>

    <!-- 窗口容器组件 - 用于渲染弹出窗口 -->
    <PopWindowContainer />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { PopWindowContainer, popWindowManager, createPopWindow } from './index';
import DemoWindow from './DemoWindow.vue';

export default defineComponent({
  name: 'SimpleDemo',
  components: {
    PopWindowContainer,
    DemoWindow
  },
  setup() {
    const windowCounter = ref(0);
    
    // 计算属性，获取窗口列表
    const windows = computed(() => {
      return popWindowManager.getWindows();
    });
    
    // 当前活动窗口ID
    const activeWindowId = computed(() => {
      return popWindowManager.getActiveWindowId();
    });

    // 打开一个演示窗口
    const openDemoWindow = () => {
      windowCounter.value++;
      createPopWindow({
        title: `演示窗口 ${windowCounter.value}`,
        component: DemoWindow,
        props: {
          title: `演示窗口 ${windowCounter.value}`,
          initialMessage: `这是窗口 ${windowCounter.value} 的初始消息。`
        },
        onClose: () => {
          console.log(`窗口 ${windowCounter.value} 已关闭`);
        }
      });
    };

    // 打开多个窗口
    const openMultipleWindows = () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          windowCounter.value++;
          createPopWindow({
            title: `演示窗口 ${windowCounter.value}`,
            component: DemoWindow,
            props: {
              title: `演示窗口 ${windowCounter.value}`,
              initialMessage: `这是窗口 ${windowCounter.value} 的初始消息。`
            }
          });
        }, i * 300);
      }
    };

    // 关闭所有窗口
    const closeAllWindows = () => {
      const allWindows = [...popWindowManager.getWindows()];
      allWindows.forEach(window => {
        popWindowManager.closeWindow(window.id);
      });
    };
    
    // 激活指定窗口
    const activateWindow = (id: string) => {
      popWindowManager.activateWindow(id);
    };
    
    // 关闭指定窗口
    const closeWindow = (id: string) => {
      popWindowManager.closeWindow(id);
    };

    // 在组件挂载时自动打开一个窗口
    onMounted(() => {
      setTimeout(() => {
        openDemoWindow();
      }, 500);
    });

    return {
      windows,
      activeWindowId,
      openDemoWindow,
      openMultipleWindows,
      closeAllWindows,
      activateWindow,
      closeWindow
    };
  }
});
</script>

<style scoped>
.ae-demo {
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

.demo-header {
  margin-bottom: 20px;
}

.demo-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.demo-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background-color: #4d4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #666;
}

.demo-status {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  margin-top: 20px;
}

.demo-status h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.empty-state {
  color: #777;
  font-style: italic;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 10px;
}

li:last-child {
  border-bottom: none;
}

.status-badge {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #ddd;
  color: #333;
}

.status-badge.active {
  background-color: #4CAF50;
  color: white;
}

li button {
  padding: 4px 8px;
  font-size: 12px;
  margin-left: auto;
}
</style> 