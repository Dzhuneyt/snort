import Vue from 'vue'
import App from './App.vue'
import {MdButton, MdContent, MdTabs, MdField} from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.config.productionTip = false;

Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdField);
Vue.use(MdTabs);

new Vue({
    render: h => h(App),
}).$mount('#app')
