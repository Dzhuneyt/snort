import Vue from 'vue'
import App from './App.vue'
import {MdButton, MdContent, MdField, MdTabs} from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import VueAxios from "vue-axios";
import axios from 'axios'
import VueRouter from 'vue-router'
import Form from "./components/Form";
import VisitedLink from "./components/VisitedLink";

Vue.config.productionTip = false;

Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdField);
Vue.use(MdTabs);
Vue.use(VueAxios, axios);
Vue.use(VueRouter);

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    {path: '/', component: Form},
    {
        name: 'visitlink',
        path: '/:hash', component: VisitedLink
    }
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({mode: 'history', routes});

new Vue({
    render: h => h(App),
    router,
}).$mount('#app')
