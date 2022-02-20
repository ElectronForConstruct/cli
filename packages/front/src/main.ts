import { createApp } from 'vue';
import { BaklavaVuePlugin } from '@baklavajs/plugin-renderer-vue3';

import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import '@baklavajs/plugin-renderer-vue3/dist/styles.css';

const app = createApp(App);

app.use(BaklavaVuePlugin);
app.use(store);
app.use(router);
app.mount('#app');
