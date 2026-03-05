import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

export const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "arbeitlyDark",
    themes: {
      arbeitlyDark: {
        dark: true,
        colors: {
          background: "#0b1929",
          surface: "#0f2a3e",
          primary: "#00e5ff",
          secondary: "#00b8d4",
          "on-background": "#ffffff",
          "on-surface": "#e0e0e0",
        },
      },
    },
  },
});
