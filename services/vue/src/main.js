import Vue from 'vue'
import App from './App.vue'
import {MdButton, MdContent, MdField, MdTabs} from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import VueAxios from "vue-axios";
import axios from 'axios'

Vue.config.productionTip = false;

Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdField);
Vue.use(MdTabs);
Vue.use(VueAxios, axios);

new Vue({
    render: h => h(App),
}).$mount('#app')
