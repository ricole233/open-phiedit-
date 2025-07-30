<template>
  <div class="use-example">
    <button class="pop-button" @click="openPopupWindow">{{ buttonText }}</button>
    
    <!-- 窗口容器 - 用于显示弹出窗口 -->
    <PopWindowContainer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { PopWindowContainer, createPopWindow } from '../index';
import DemoWindow from './DemoWindow.vue';

export default defineComponent({
  name: 'UseExample',
  components: {
    PopWindowContainer
  },
  props: {
    buttonText: {
      type: String,
      default: '打开窗口'
    },
    windowTitle: {
      type: String,
      default: '示例窗口'
    },
    windowWidth: {
      type: Number,
      default: 500
    },
    windowHeight: {
      type: Number,
      default: 400
    },
    windowInitialX: {
      type: Number,
      default: 100
    },
    windowInitialY: {
      type: Number,
      default: 100
    }
  },
  setup(props) {
    // 窗口计数器
    const windowCounter = ref(0);

    // 打开弹出窗口
    const openPopupWindow = () => {
      windowCounter.value++;
      
      // 创建窗口
      createPopWindow({
        title: `${props.windowTitle} ${windowCounter.value}`,
        component: DemoWindow,
        props: {
          title: `${props.windowTitle} ${windowCounter.value}`,
          initialMessage: `这是窗口 ${windowCounter.value} 的内容，创建于 ${new Date().toLocaleTimeString()}`
        },
        onClose: () => {
          console.log(`窗口 ${windowCounter.value} 已关闭`);
        }
      });
    };

    return {
      openPopupWindow,
      buttonText: props.buttonText
    };
  }
});
</script>

<style scoped>
.use-example {
  padding: 20px;
}

.pop-button {
  padding: 10px 20px;
  background-color: #4D4D4D;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pop-button:hover {
  background-color: #666;
}

.pop-button:active {
  background-color: #333;
}
</style> 