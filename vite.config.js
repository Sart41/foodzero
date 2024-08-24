import { resolve } from 'path'
import { defineConfig } from 'vite'
import Unfonts from 'unplugin-fonts/vite'
import injectHTML from 'vite-plugin-html-inject';

const fontsConfig = {
  google: {
    families: [
      {
        name: 'Lato',
        styles: 'wght@400;700'
      },
      {
        name: 'Rufina',
        styles: 'wght@400;700'
      }
    ]
  }
}

export default defineConfig({


  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // about: resolve(__dirname, 'pages/PageAbout/index.html'),
        // what: resolve(__dirname, 'pages/PageWhatWeDo/index.html'),
        // media: resolve(__dirname, 'pages/PageMedia/index.html'),
        // contacts: resolve(__dirname, 'pages/PageContacts/index.html'),
        // donation: resolve(__dirname, 'pages/PageDonation/index.html'),
      },
    },
  },

  plugins: [
    Unfonts(fontsConfig),
    injectHTML(),
  ],

  resolve: {
    alias: {
      'pages': resolve(__dirname, '/pages'),
      '@': resolve(__dirname, '/src')
    }
  },

})