<template>
  <div 
    v-show="visible" 
    class="ae-pop-window" 
    :class="{ 'active': isActive }" 
    :style="windowStyle"
    @mousedown="activateWindow"
  >
    <!-- 窗口标题栏 -->
    <div 
      class="window-header" 
      @mousedown="startDrag" 
      @dblclick="toggleMaximize"
    >
      <div class="window-title">{{ title }}</div>
      <div class="window-controls">
        <button class="control-btn minimize" @click.stop="minimize">
          <span>—</span>
        </button>
        <button class="control-btn maximize" @click.stop="toggleMaximize">
          <span>□</span>
        </button>
        <button class="control-btn close" @click.stop="close">
          <span>×</span>
        </button>
      </div>
    </div>

    <!-- 窗口内容 -->
    <div class="window-content">
      <slot></slot>
    </div>

    <!-- 窗口调整大小的控制点 -->
    <div v-if="!isMaximized" class="resize-handle top-left" @mousedown.stop="startResize('top-left')"></div>
    <div v-if="!isMaximized" class="resize-handle top" @mousedown.stop="startResize('top')"></div>
    <div v-if="!isMaximized" class="resize-handle top-right" @mousedown.stop="startResize('top-right')"></div>
    <div v-if="!isMaximized" class="resize-handle right" @mousedown.stop="startResize('right')"></div>
    <div v-if="!isMaximized" class="resize-handle bottom-right" @mousedown.stop="startResize('bottom-right')"></div>
    <div v-if="!isMaximized" class="resize-handle bottom" @mousedown.stop="startResize('bottom')"></div>
    <div v-if="!isMaximized" class="resize-handle bottom-left" @mousedown.stop="startResize('bottom-left')"></div>
    <div v-if="!isMaximized" class="resize-handle left" @mousedown.stop="startResize('left')"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'BasePopWidght',
  props: {
    title: {
      type: String,
      default: '窗口'
    },
    initialWidth: {
      type: Number,
      default: 400
    },
    initialHeight: {
      type: Number,
      default: 300
    },
    initialX: {
      type: Number,
      default: 100
    },
    initialY: {
      type: Number,
      default: 100
    },
    minWidth: {
      type: Number,
      default: 200
    },
    minHeight: {
      type: Number,
      default: 150
    },
    zIndexBase: {
      type: Number,
      default: 1000
    }
  },
  emits: ['close', 'minimize', 'maximize', 'restore', 'active'],
  setup(props, { emit }) {
    // 窗口状态
    const visible = ref(true);
    const isActive = ref(true);
    const isMaximized = ref(false);
    const isMinimized = ref(false);
    const windowId = ref(uuidv4());
    
    // 窗口位置和大小
    const x = ref(props.initialX);
    const y = ref(props.initialY);
    const width = ref(props.initialWidth);
    const height = ref(props.initialHeight);
    const zIndex = ref(props.zIndexBase);
    
    // 拖拽状态
    const isDragging = ref(false);
    const dragStartX = ref(0);
    const dragStartY = ref(0);
    const originalX = ref(0);
    const originalY = ref(0);
    
    // 调整大小状态
    const isResizing = ref(false);
    const resizeDirection = ref('');
    const resizeStartX = ref(0);
    const resizeStartY = ref(0);
    const originalWidth = ref(0);
    const originalHeight = ref(0);

    // 窗口位置和样式的计算属性
    const windowStyle = computed(() => {
      if (isMaximized.value) {
        return {
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: zIndex.value
        };
      }
      
      return {
        top: `${y.value}px`,
        left: `${x.value}px`,
        width: `${width.value}px`,
        height: `${height.value}px`,
        zIndex: zIndex.value
      };
    });

    // 窗口控制函数
    const close = () => {
      visible.value = false;
      emit('close');
    };

    const minimize = () => {
      isMinimized.value = true;
      emit('minimize');
      // 这里可以根据实际需要实现最小化逻辑
    };

    const maximize = () => {
      // 保存当前位置和大小，以便还原
      if (!isMaximized.value) {
        originalX.value = x.value;
        originalY.value = y.value;
        originalWidth.value = width.value;
        originalHeight.value = height.value;
      }
      
      isMaximized.value = true;
      emit('maximize');
    };

    const restore = () => {
      isMaximized.value = false;
      // 还原窗口位置和大小
      x.value = originalX.value;
      y.value = originalY.value;
      width.value = originalWidth.value;
      height.value = originalHeight.value;
      
      emit('restore');
    };

    const toggleMaximize = () => {
      if (isMaximized.value) {
        restore();
      } else {
        maximize();
      }
    };

    const activateWindow = () => {
      isActive.value = true;
      // 在窗口管理器中提升此窗口的 zIndex
      zIndex.value = props.zIndexBase + 10;
      emit('active', windowId.value);
    };

    // 拖拽相关函数
    const startDrag = (event: MouseEvent) => {
      // 如果窗口已最大化，不允许拖动
      if (isMaximized.value) return;
      
      isDragging.value = true;
      dragStartX.value = event.clientX;
      dragStartY.value = event.clientY;
      originalX.value = x.value;
      originalY.value = y.value;
      
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', endDrag);
    };

    const handleDrag = (event: MouseEvent) => {
      if (!isDragging.value) return;
      
      const deltaX = event.clientX - dragStartX.value;
      const deltaY = event.clientY - dragStartY.value;
      
      x.value = originalX.value + deltaX;
      y.value = originalY.value + deltaY;
    };

    const endDrag = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
    };

    // 调整大小相关函数
    const startResize = (direction: string) => {
      isResizing.value = true;
      resizeDirection.value = direction;
      resizeStartX.value = event.clientX;
      resizeStartY.value = event.clientY;
      originalWidth.value = width.value;
      originalHeight.value = height.value;
      originalX.value = x.value;
      originalY.value = y.value;
      
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', endResize);
    };

    const handleResize = (event: MouseEvent) => {
      if (!isResizing.value) return;
      
      const deltaX = event.clientX - resizeStartX.value;
      const deltaY = event.clientY - resizeStartY.value;
      
      // 根据调整方向处理大小调整
      switch (resizeDirection.value) {
        case 'top-left':
          width.value = Math.max(props.minWidth, originalWidth.value - deltaX);
          height.value = Math.max(props.minHeight, originalHeight.value - deltaY);
          x.value = originalX.value + (originalWidth.value - width.value);
          y.value = originalY.value + (originalHeight.value - height.value);
          break;
        case 'top':
          height.value = Math.max(props.minHeight, originalHeight.value - deltaY);
          y.value = originalY.value + (originalHeight.value - height.value);
          break;
        case 'top-right':
          width.value = Math.max(props.minWidth, originalWidth.value + deltaX);
          height.value = Math.max(props.minHeight, originalHeight.value - deltaY);
          y.value = originalY.value + (originalHeight.value - height.value);
          break;
        case 'right':
          width.value = Math.max(props.minWidth, originalWidth.value + deltaX);
          break;
        case 'bottom-right':
          width.value = Math.max(props.minWidth, originalWidth.value + deltaX);
          height.value = Math.max(props.minHeight, originalHeight.value + deltaY);
          break;
        case 'bottom':
          height.value = Math.max(props.minHeight, originalHeight.value + deltaY);
          break;
        case 'bottom-left':
          width.value = Math.max(props.minWidth, originalWidth.value - deltaX);
          height.value = Math.max(props.minHeight, originalHeight.value + deltaY);
          x.value = originalX.value + (originalWidth.value - width.value);
          break;
        case 'left':
          width.value = Math.max(props.minWidth, originalWidth.value - deltaX);
          x.value = originalX.value + (originalWidth.value - width.value);
          break;
      }
    };

    const endResize = () => {
      isResizing.value = false;
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', endResize);
    };

    // 生命周期钩子
    onMounted(() => {
      activateWindow();
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', endResize);
    });

    return {
      visible,
      isActive,
      isMaximized,
      windowStyle,
      close,
      minimize,
      maximize,
      restore,
      toggleMaximize,
      activateWindow,
      startDrag,
      startResize,
      x,
      y,
      width,
      height
    };
  }
});
</script>

<style scoped>
.ae-pop-window {
  position: absolute;
  background-color: #2d2d2d;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
  font-family: 'Arial', sans-serif;
  color: #e8e8e8;
}

.ae-pop-window.active {
  border-color: #666;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  height: 28px;
  background-color: #383838;
  cursor: move;
  user-select: none;
}

.window-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.window-controls {
  display: flex;
  align-items: center;
}

.control-btn {
  width: 20px;
  height: 20px;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 2px;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.1s, color 0.1s;
}

.control-btn:hover {
  background-color: #505050;
  color: #fff;
}

.control-btn.close:hover {
  background-color: #e81123;
  color: #fff;
}

.window-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* 调整大小的控制点样式 */
.resize-handle {
  position: absolute;
  background-color: transparent;
}

.resize-handle.top-left {
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  cursor: nw-resize;
}

.resize-handle.top {
  top: 0;
  left: 8px;
  right: 8px;
  height: 4px;
  cursor: n-resize;
}

.resize-handle.top-right {
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  cursor: ne-resize;
}

.resize-handle.right {
  top: 8px;
  right: 0;
  width: 4px;
  bottom: 8px;
  cursor: e-resize;
}

.resize-handle.bottom-right {
  right: 0;
  bottom: 0;
  width: 8px;
  height: 8px;
  cursor: se-resize;
}

.resize-handle.bottom {
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 4px;
  cursor: s-resize;
}

.resize-handle.bottom-left {
  bottom: 0;
  left: 0;
  width: 8px;
  height: 8px;
  cursor: sw-resize;
}

.resize-handle.left {
  top: 8px;
  left: 0;
  width: 4px;
  bottom: 8px;
  cursor: w-resize;
}
</style>

