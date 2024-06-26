import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/element-theme/index.css';
import './assets/css/element/index.css';
Vue.config.productionTip = false;

import { createPinia, PiniaVuePlugin } from 'pinia';
Vue.use(PiniaVuePlugin);
const pinia = createPinia();

import ElementUI from 'element-ui';
Vue.use(ElementUI, { size: 'small', zIndex: 3000 });
ElementUI.Select.props.filterable.default = true;
ElementUI.Dialog.props.closeOnClickModal.default = false; // 弹框默认点击遮罩层不关闭
ElementUI.Drawer.props.wrapperClosable.default = false; // 抽屉默认点击遮罩层不关闭
ElementUI.Table.props.border.default = true;
// 表格header设置
ElementUI.Table.props.headerCellStyle.default = () => {
  return {
    background: '#EEEEEE',
    color: '#000C01',
    border: '1px solid rgb(204 204 204 / 23%)',
    'border-right': 'none',
    'border-left': 'none',
    'font-family': 'MicrosoftYaHei',
    'font-size': '1.4rem',
    'line-height': ' 1.9rem',
    'font-style': ' normal',
    'font-weight': '500',
  };
};
new Vue({
  pinia,
  router,
  render: (h) => h(App),
}).$mount('#app');
