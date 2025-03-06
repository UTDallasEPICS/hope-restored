import { defineNuxtPlugin } from '#imports';
import QrReader from 'vue3-qr-reader';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('QrReader', QrReader);
});