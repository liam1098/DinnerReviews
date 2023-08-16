import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'; // Import Bootstrap CSS
import 'bootstrap'; // Import Bootstrap JS
import '@fortawesome/fontawesome-free/css/all.css';

createApp(App).use(router).mount('#app')
