<template>
  <div class="demo-window">
    <div class="demo-content">
      <h2>{{ title }}</h2>
      <p>这是一个示例窗口内容，用于演示弹出窗口功能。</p>
      
      <div class="demo-controls">
        <label for="demo-input">示例输入：</label>
        <input id="demo-input" v-model="inputValue" />
      </div>

      <div class="demo-controls">
        <label for="demo-select">示例选择：</label>
        <select id="demo-select" v-model="selectedOption">
          <option value="option1">选项 1</option>
          <option value="option2">选项 2</option>
          <option value="option3">选项 3</option>
        </select>
      </div>

      <div class="demo-buttons">
        <button @click="emitMessage">发送消息</button>
        <button @click="openAnotherWindow">打开另一个窗口</button>
      </div>

      <div v-if="messages.length > 0" class="demo-messages">
        <h3>消息列表：</h3>
        <ul>
          <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { createPopWindow } from '../CreatePopWindow';

export default defineComponent({
  name: 'DemoWindow',
  props: {
    title: {
      type: String as PropType<string>,
      default: '示例窗口'
    },
    initialMessage: {
      type: String as PropType<string>,
      default: ''
    }
  },
  setup(props) {
    const inputValue = ref('');
    const selectedOption = ref('option1');
    const messages = ref<string[]>([]);

    if (props.initialMessage) {
      messages.value.push(props.initialMessage);
    }

    // 发送消息
    const emitMessage = () => {
      if (inputValue.value.trim()) {
        messages.value.push(`${selectedOption.value}: ${inputValue.value}`);
        inputValue.value = '';
      }
    };

    // 打开另一个窗口
    const openAnotherWindow = () => {
      createPopWindow({
        title: '子窗口',
        component: 'DemoWindow', // 应该引用实际组件
        props: {
          title: '通过父窗口创建的子窗口',
          initialMessage: `从父窗口传递的消息: ${new Date().toLocaleTimeString()}`
        }
      });
    };

    return {
      inputValue,
      selectedOption,
      messages,
      emitMessage,
      openAnotherWindow
    };
  }
});
</script>

<style scoped>
.demo-window {
  padding: 15px;
  font-family: 'Arial', sans-serif;
  color: #e8e8e8;
  height: 100%;
  overflow: auto;
}

.demo-content {
  padding: 10px;
}

h2 {
  margin-top: 0;
  color: #ccc;
  font-size: 16px;
  border-bottom: 1px solid #444;
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.demo-controls {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #aaa;
}

input, select {
  width: 100%;
  padding: 6px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 3px;
  color: #e8e8e8;
}

.demo-buttons {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

button {
  padding: 6px 12px;
  background-color: #444;
  border: 1px solid #555;
  border-radius: 3px;
  color: #e8e8e8;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #555;
}

.demo-messages {
  margin-top: 20px;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 3px;
}

h3 {
  font-size: 14px;
  color: #ccc;
  margin-top: 0;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 5px 0;
  border-bottom: 1px solid #444;
}

li:last-child {
  border-bottom: none;
}
</style> 