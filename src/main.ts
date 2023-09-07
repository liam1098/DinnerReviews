
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'; // Import Bootstrap CSS
import 'bootstrap'; // Import Bootstrap JS
import '@fortawesome/fontawesome-free/css/all.css';

import Toast, { PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

app.use(router);
app.use(Toast, {
    transition: "Vue-Toastification__slideBlurred",
    maxToasts: 1,
    newestOnTop: true
});
app.mount('#app');

