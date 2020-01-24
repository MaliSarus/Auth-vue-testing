import Vue from 'vue'
import App from './App.vue'

import axios from 'axios'
import Vuelidate from 'vuelidate'

import router from './router'
import store from './store'

Vue.use(Vuelidate);

axios.defaults.baseURL = 'https://vue-axios-c2f34.firebaseio.com';

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
