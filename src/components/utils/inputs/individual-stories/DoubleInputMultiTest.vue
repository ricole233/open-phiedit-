<template>
  <div class="multi-test-container">
    <h2>多控件测试环境</h2>
    
    <div class="test-grid">
      <!-- 第一行：独立控件 -->
      <div class="test-row">
        <h3>独立控件测试（各自有独立状态）</h3>
        <div class="test-case">
          <div class="label">控件 1:</div>
          <DoubleInput
            v-model="value1"
            :minX="-100" :maxX="100"
            :minY="-100" :maxY="100"
            :precision="1"
            :step="1"
            v-model:chainRatio="lock1"
            @change="onChange(1, $event)"
          />
          <div class="value-display">
            值: [{{ value1[0] }}, {{ value1[1] }}], 锁定: {{ lock1 ? '是' : '否' }}
          </div>
        </div>

        <div class="test-case">
          <div class="label">控件 2:</div>
          <DoubleInput
            v-model="value2"
            :minX="0" :maxX="500"
            :minY="0" :maxY="500"
            :precision="0"
            :step="5"
            v-model:chainRatio="lock2"
            @change="onChange(2, $event)"
          />
          <div class="value-display">
            值: [{{ value2[0] }}, {{ value2[1] }}], 锁定: {{ lock2 ? '是' : '否' }}
          </div>
        </div>
      </div>

      <!-- 第二行：关联控件 -->
      <div class="test-row">
        <h3>关联控件测试（共享锁定状态）</h3>
        <div class="test-case">
          <div class="label">控件 A:</div>
          <DoubleInput
            v-model="valueA"
            :minX="-200" :maxX="200"
            :minY="-200" :maxY="200"
            :precision="1"
            :step="1"
            v-model:chainRatio="sharedLock"
            @change="onChange('A', $event)"
          />
          <div class="value-display">
            值: [{{ valueA[0] }}, {{ valueA[1] }}], 锁定: {{ sharedLock ? '是' : '否' }}
          </div>
        </div>

        <div class="test-case">
          <div class="label">控件 B:</div>
          <DoubleInput
            v-model="valueB"
            :minX="-50" :maxX="50"
            :minY="-50" :maxY="50"
            :precision="2"
            :step="0.5"
            v-model:chainRatio="sharedLock"
            @change="onChange('B', $event)"
          />
          <div class="value-display">
            值: [{{ valueB[0] }}, {{ valueB[1] }}], 锁定: {{ sharedLock ? '是' : '否' }}
          </div>
        </div>
      </div>

      <!-- 第三行：动态创建的控件 -->
      <div class="test-row">
        <h3>动态控件测试</h3>
        <button @click="addControl" class="btn">添加控件</button>
        <button @click="removeControl" class="btn">移除控件</button>

        <div v-for="(item, index) in dynamicControls" :key="index" class="test-case">
          <div class="label">动态控件 {{ index + 1 }}:</div>
          <DoubleInput
            v-model="item.value"
            :minX="item.minX" :maxX="item.maxX"
            :minY="item.minY" :maxY="item.maxY"
            :precision="item.precision"
            :step="item.step"
            v-model:chainRatio="item.locked"
            @change="onDynamicChange(index, $event)"
          />
          <div class="value-display">
            值: [{{ item.value[0] }}, {{ item.value[1] }}], 锁定: {{ item.locked ? '是' : '否' }}
          </div>
        </div>
      </div>

      <!-- 第四行：事件日志 -->
      <div class="test-row">
        <h3>事件日志（最近10条）</h3>
        <div class="event-log">
          <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DoubleInput from '../DoubleInput.vue';

export default {
  name: 'DoubleInputMultiTest',
  components: {
    DoubleInput
  },
  data() {
    return {
      // 独立控件数据
      value1: [50, 25],
      value2: [200, 100],
      lock1: false,
      lock2: true,
      
      // 共享锁定状态的控件数据
      valueA: [100, 50],
      valueB: [20, 10],
      sharedLock: false,
      
      // 动态控件数据
      dynamicControls: [
        {
          value: [10, 10],
          minX: -100, maxX: 100,
          minY: -100, maxY: 100,
          precision: 1,
          step: 1,
          locked: false
        }
      ],
      
      // 事件日志
      eventLogs: []
    };
  },
  methods: {
    // 记录值变化事件
    onChange(id, value) {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
      this.eventLogs.unshift(`${timeStr} - 控件 ${id} 值变为: [${value[0]}, ${value[1]}]`);
      
      // 保持日志不超过10条
      if (this.eventLogs.length > 10) {
        this.eventLogs.pop();
      }
    },
    
    // 记录动态控件的值变化
    onDynamicChange(index, value) {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
      this.eventLogs.unshift(`${timeStr} - 动态控件 ${index+1} 值变为: [${value[0]}, ${value[1]}]`);
      
      // 保持日志不超过10条
      if (this.eventLogs.length > 10) {
        this.eventLogs.pop();
      }
    },
    
    // 添加动态控件
    addControl() {
      // 生成随机初始值和配置
      const randomValue = [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
      ];
      
      const precision = Math.floor(Math.random() * 2) + 1; // 1-2位小数
      const step = precision === 1 ? 1 : 0.1;
      
      this.dynamicControls.push({
        value: randomValue,
        minX: -100, maxX: 100,
        minY: -100, maxY: 100,
        precision: precision,
        step: step,
        locked: Math.random() > 0.5 // 随机锁定状态
      });
      
      this.eventLogs.unshift(`添加了新控件，初始值: [${randomValue[0]}, ${randomValue[1]}]`);
      if (this.eventLogs.length > 10) {
        this.eventLogs.pop();
      }
    },
    
    // 移除动态控件
    removeControl() {
      if (this.dynamicControls.length > 0) {
        const removed = this.dynamicControls.pop();
        this.eventLogs.unshift(`移除了控件，其值为: [${removed.value[0]}, ${removed.value[1]}]`);
        if (this.eventLogs.length > 10) {
          this.eventLogs.pop();
        }
      }
    }
  }
};
</script>

<style scoped>
.multi-test-container {
  font-family: Arial, sans-serif;
  color: #ccc;
  background-color: #2d2d2d;
  padding: 20px;
  border-radius: 5px;
}

h2 {
  color: #fff;
  margin-bottom: 20px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

h3 {
  color: #ddd;
  margin: 15px 0 10px;
  font-size: 16px;
}

.test-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.test-row {
  padding: 15px;
  background-color: #333;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.test-case {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 8px;
  background-color: #3a3a3a;
  border-radius: 3px;
}

.label {
  min-width: 80px;
  font-weight: bold;
}

.value-display {
  margin-left: 10px;
  min-width: 220px;
  font-family: monospace;
  font-size: 12px;
}

.btn {
  background-color: #4a4a4a;
  color: #fff;
  border: none;
  padding: 5px 10px;
  margin-right: 10px;
  border-radius: 3px;
  cursor: pointer;
}

.btn:hover {
  background-color: #5a5a5a;
}

.event-log {
  background-color: #252525;
  padding: 10px;
  border-radius: 3px;
  height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  padding: 5px;
  border-bottom: 1px solid #333;
}

.log-item:first-child {
  border-top: 1px solid #333;
}
</style> 