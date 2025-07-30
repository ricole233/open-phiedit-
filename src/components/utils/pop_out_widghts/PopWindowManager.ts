import { ref, reactive, markRaw } from 'vue';

/**
 * 窗口信息接口
 */
interface WindowInfo {
  id: string;
  title: string;
  component: any;
  props?: Record<string, any>;
  zIndex: number;
  isMinimized: boolean;
  isVisible: boolean;
}

/**
 * 窗口管理器类
 * 用于管理多个弹出窗口的状态
 */
class PopWindowManager {
  // 存储所有窗口的信息
  private windows = reactive<Record<string, WindowInfo>>({});
  // 当前激活的窗口ID
  private activeWindowId = ref<string | null>(null);
  // zIndex 基础值
  private baseZIndex = 1000;
  // 窗口计数器（用于生成唯一ID）
  private windowCounter = 0;

  /**
   * 创建一个新窗口
   * @param title 窗口标题
   * @param component 窗口内容组件
   * @param props 传递给组件的props
   * @returns 窗口的唯一ID
   */
  createWindow(title: string, component: any, props: Record<string, any> = {}): string {
    const id = `window-${++this.windowCounter}`;
    
    this.windows[id] = {
      id,
      title,
      component: markRaw(component), // 使用markRaw确保组件不会被Vue响应式系统追踪
      props,
      zIndex: this.baseZIndex + Object.keys(this.windows).length,
      isMinimized: false,
      isVisible: true
    };
    
    this.activateWindow(id);
    return id;
  }

  /**
   * 激活指定的窗口
   * @param id 窗口ID
   */
  activateWindow(id: string): void {
    if (!this.windows[id]) return;
    
    this.activeWindowId.value = id;
    
    // 提升激活窗口的zIndex
    const maxZIndex = Math.max(
      ...Object.values(this.windows).map(window => window.zIndex),
      this.baseZIndex
    );
    
    this.windows[id].zIndex = maxZIndex + 1;
  }

  /**
   * 关闭指定的窗口
   * @param id 窗口ID
   */
  closeWindow(id: string): void {
    if (!this.windows[id]) return;
    
    // 删除窗口
    delete this.windows[id];
    
    // 如果关闭的是当前激活窗口，则尝试激活另一个窗口
    if (this.activeWindowId.value === id) {
      const remainingWindows = Object.keys(this.windows);
      if (remainingWindows.length > 0) {
        this.activateWindow(remainingWindows[remainingWindows.length - 1]);
      } else {
        this.activeWindowId.value = null;
      }
    }
  }

  /**
   * 最小化指定的窗口
   * @param id 窗口ID
   */
  minimizeWindow(id: string): void {
    if (!this.windows[id]) return;
    
    this.windows[id].isMinimized = true;
    
    // 如果最小化的是当前激活窗口，则尝试激活另一个窗口
    if (this.activeWindowId.value === id) {
      const visibleWindows = Object.entries(this.windows)
        .filter(([windowId, window]) => !window.isMinimized && windowId !== id)
        .map(([windowId]) => windowId);
      
      if (visibleWindows.length > 0) {
        this.activateWindow(visibleWindows[visibleWindows.length - 1]);
      }
    }
  }

  /**
   * 恢复最小化的窗口
   * @param id 窗口ID
   */
  restoreWindow(id: string): void {
    if (!this.windows[id]) return;
    
    this.windows[id].isMinimized = false;
    this.activateWindow(id);
  }

  /**
   * 隐藏指定的窗口
   * @param id 窗口ID
   */
  hideWindow(id: string): void {
    if (!this.windows[id]) return;
    this.windows[id].isVisible = false;
  }

  /**
   * 显示指定的窗口
   * @param id 窗口ID
   */
  showWindow(id: string): void {
    if (!this.windows[id]) return;
    this.windows[id].isVisible = true;
    this.activateWindow(id);
  }

  /**
   * 获取窗口列表
   * @returns 所有窗口信息的数组
   */
  getWindows(): WindowInfo[] {
    return Object.values(this.windows);
  }

  /**
   * 获取指定窗口的信息
   * @param id 窗口ID
   * @returns 窗口信息对象
   */
  getWindow(id: string): WindowInfo | null {
    return this.windows[id] || null;
  }

  /**
   * 获取当前激活窗口的ID
   * @returns 激活窗口的ID，如果没有则返回null
   */
  getActiveWindowId(): string | null {
    return this.activeWindowId.value;
  }

  /**
   * 获取当前激活的窗口信息
   * @returns 激活窗口的信息对象，如果没有则返回null
   */
  getActiveWindow(): WindowInfo | null {
    return this.activeWindowId.value ? this.windows[this.activeWindowId.value] : null;
  }

  /**
   * 获取可见窗口列表
   * @returns 所有可见窗口的信息数组
   */
  getVisibleWindows(): WindowInfo[] {
    return Object.values(this.windows).filter(window => window.isVisible);
  }

  /**
   * 获取最小化窗口列表
   * @returns 所有最小化窗口的信息数组
   */
  getMinimizedWindows(): WindowInfo[] {
    return Object.values(this.windows).filter(window => window.isMinimized);
  }
}

// 创建单例实例
const popWindowManager = new PopWindowManager();

// 导出单例实例
export default popWindowManager; 