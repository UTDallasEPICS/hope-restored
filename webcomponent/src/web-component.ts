import { defineCustomElement, createApp, getCurrentInstance, h } from 'vue';
import { createPinia } from 'pinia';
import App from '@/components/App.ce.vue';
import css from '@/styles/index.css';

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
  'hope-restored-info',
  createElementInstance(App as any) as any
);

