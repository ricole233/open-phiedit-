/**
 * 项目相关组件索引
 * 导出项目创建、打开、保存等相关组件
 */

// 导入组件
import NewProject from './NewProject.vue';
import OpenNewProject from './OpenNewProject.vue';
import ExportProject from './ExportProject.vue';
import SaveProject from './SaveProject.vue';
import LoadProject from './LoadProject.vue';

// 命名导出
export {
  NewProject,
  OpenNewProject,
  ExportProject,
  SaveProject,
  LoadProject
};

// 默认导出所有组件
export default {
  NewProject: () => import('./NewProject.vue'),
  OpenNewProject: () => import('./OpenNewProject.vue'),
  ExportProject: () => import('./ExportProject.vue'),
  SaveProject: () => import('./SaveProject.vue'),
  LoadProject: () => import('./LoadProject.vue')
}; 