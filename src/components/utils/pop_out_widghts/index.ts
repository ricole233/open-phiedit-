/**
 * AE风格弹出窗口系统
 * 
 * 这个模块提供了类似Adobe After Effects的弹出窗口系统，包括：
 * 1. 基础窗口组件（BasePopWidght）
 * 2. 窗口管理器（PopWindowManager）
 * 3. 窗口容器组件（PopWindowContainer）
 * 4. 创建窗口的辅助函数
 */

// 导出基础窗口组件
export { default as BasePopWidght } from './BasePopWidght.vue';

// 导出窗口容器组件
export { default as PopWindowContainer } from './PopWindowContainer.vue';

// 导出窗口管理器
export { default as popWindowManager } from './PopWindowManager';

// 导出创建窗口的辅助函数
export { default as createPopWindow, createConfirmDialog, createAlertDialog } from './CreatePopWindow';

// 提供默认导出，方便整体引入
export default {
  install: (app: any) => {
    // 注册组件
    app.component('BasePopWidght', BasePopWidght);
    app.component('PopWindowContainer', PopWindowContainer);
    
    // 将窗口管理器和创建函数添加到全局属性
    app.config.globalProperties.$popWindowManager = popWindowManager;
    app.config.globalProperties.$createPopWindow = createPopWindow;
    app.config.globalProperties.$createConfirmDialog = createConfirmDialog;
    app.config.globalProperties.$createAlertDialog = createAlertDialog;
  }
};

// 导入所需的组件和函数
import BasePopWidght from './BasePopWidght.vue';
import PopWindowContainer from './PopWindowContainer.vue';
import popWindowManager from './PopWindowManager';
import createPopWindow, { createConfirmDialog, createAlertDialog } from './CreatePopWindow'; 