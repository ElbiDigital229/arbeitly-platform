import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './style.css';

import App from './App.vue';
import router from './router/index';
import { auth0Plugin } from './plugins/auth0';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#0ea5e9',
          secondary: '#1a1a24',
          accent: '#0ea5e9',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#22c55e',
          background: '#09090f',
          surface: '#131318',
          'on-surface': '#f1f5f9',
          'on-background': '#f1f5f9',
        },
      },
    },
  },
});

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(vuetify);
app.use(router);
if (auth0Plugin) app.use(auth0Plugin);
app.mount('#app');
