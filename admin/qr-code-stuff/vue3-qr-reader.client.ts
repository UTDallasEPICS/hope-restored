import { defineNuxtPlugin } from 'nuxt/app';
import QrReader from 'vue3-qr-reader';

export default defineNuxtPlugin((nuxtApp: any) => {
    nuxtApp.vueApp.component('QrReader', QrReader);
});