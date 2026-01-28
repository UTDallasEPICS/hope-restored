import { defineCustomElement, createApp, getCurrentInstance, h } from 'vue';
import App from '@/app.ce.vue';
import css from '@/assets/main.css?inline';
import { createPinia } from 'pinia';

const createElementInstance = (component: any) => {
  return defineCustomElement({
    setup() {
      const app = createApp({} as any);

      const pinia = createPinia();
      app.use(pinia);

      const inst = getCurrentInstance() as any;
      Object.assign(inst.appContext, app._context);
      Object.assign(inst.provides, app._context.provides);
    },
    render: () => h(component),
    styles: [css],
  });
};
customElements.define(
  'hrm-chat',
  createElementInstance(App as any) as any
);