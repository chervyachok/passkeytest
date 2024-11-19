import './scss/app.scss'
import 'bootstrap';

import { Buffer } from 'buffer';
window.Buffer = Buffer;

// app
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App);

// Pinia
import { createPinia } from 'pinia'
app.use(createPinia())

// mitt
import $mitt from '@/helpers/emitter';	
app.provide('$mitt', $mitt)
app.config.globalProperties.$mitt = $mitt;

import { useLoader } from "@/store/loader.store.js";
app.config.globalProperties.$loader = useLoader();
app.provide('$loader', useLoader())


// router
import router from "./router";
app.use(router)

// dayjs
import dayjs from "dayjs"; 
import relativeTime from "dayjs/plugin/relativeTime"; 
dayjs.locale('en')
dayjs.extend(relativeTime)
app.config.globalProperties.$date = dayjs
app.provide('$date', dayjs)


app.mount('#app')
