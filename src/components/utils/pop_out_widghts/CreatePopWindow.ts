import { Component } from 'vue';
import popWindowManager from './PopWindowManager';

/**
 * 创建弹出窗口的配置选项接口
 */
interface CreatePopWindowOptions {
  title: string;
  component: Component;
  props?: Record<string, any>;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
}

/**
 * 创建弹出窗口的辅助函数
 * @param options 弹出窗口的配置选项
 * @returns 创建的窗口ID
 */
export function createPopWindow(options: CreatePopWindowOptions): string {
  // 使用窗口管理器创建新窗口
  const windowId = popWindowManager.createWindow(
    options.title, 
    options.component, 
    options.props || {}
  );
  
  // 注册事件回调函数
  if (options.onClose) {
    // 这里可以实现事件监听
    // 在实际应用中，可能需要一个事件总线或者订阅机制
    // 简单起见，这里假设有这样的机制
    const originalCloseWindow = popWindowManager.closeWindow.bind(popWindowManager);
    popWindowManager.closeWindow = (id: string) => {
      if (id === windowId && options.onClose) {
        options.onClose();
      }
      originalCloseWindow(id);
    };
  }
  
  return windowId;
}

/**
 * 创建并显示一个确认对话框
 * @param title 对话框标题
 * @param message 对话框消息内容
 * @param onConfirm 确认回调函数
 * @param onCancel 取消回调函数
 * @returns 创建的窗口ID
 */
export function createConfirmDialog(
  title: string, 
  message: string,
  onConfirm: () => void,
  onCancel: () => void = () => {}
): string {
  // 这里假设有一个 ConfirmDialog 组件
  // 在实际应用中需要实现这个组件
  return createPopWindow({
    title,
    component: 'ConfirmDialog', // 这里应该是实际的组件引用
    props: { 
      message,
      onConfirm: () => {
        onConfirm();
        popWindowManager.closeWindow(windowId);
      },
      onCancel: () => {
        onCancel();
        popWindowManager.closeWindow(windowId);
      }
    }
  });
}

/**
 * 创建并显示一个警告对话框
 * @param title 对话框标题
 * @param message 对话框消息内容
 * @param onClose 关闭回调函数
 * @returns 创建的窗口ID
 */
export function createAlertDialog(
  title: string, 
  message: string,
  onClose: () => void = () => {}
): string {
  // 这里假设有一个 AlertDialog 组件
  // 在实际应用中需要实现这个组件
  return createPopWindow({
    title,
    component: 'AlertDialog', // 这里应该是实际的组件引用
    props: { 
      message,
      onClose: () => {
        onClose();
        popWindowManager.closeWindow(windowId);
      }
    }
  });
}

// 导出窗口管理器，方便直接使用
export { popWindowManager };
export default createPopWindow; 