
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'; // Import Bootstrap CSS
import 'bootstrap'; // Import Bootstrap JS
import '@fortawesome/fontawesome-free/css/all.css';

import Toast, { PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { store } from './store';
import { loadUserInfoFromLocalStorage } from '@/store/localStorageFunctions'


const app = createApp(App);


const userInfoFromLocalStorage = loadUserInfoFromLocalStorage();

// Initialize the store with user info from local storage (if available)
if (userInfoFromLocalStorage) {
  store.commit('user/SET_USER_INFO', userInfoFromLocalStorage);
}

app.use(router);
app.use(store)
app.use(Toast, {
    transition: "Vue-Toastification__slideBlurred",
    maxToasts: 1,
    newestOnTop: true
});
app.mount('#app');

