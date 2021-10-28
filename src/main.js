import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import 'github-markdown-css/github-markdown.css'
import store from './store'
import clipboard from 'clipboard';
//注册到vue原型上
Vue.prototype.clipboard = clipboard;
Vue.config.productionTip = false
Vue.use(ElementUI).use(VXETable)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
