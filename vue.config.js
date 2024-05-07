const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: process.env.VUE_APP_PWA_NAME ,
    short_name: process.env.VUE_SHORT_NAME  ,
    theme_color: process.env.VUE_THEME_COLOR ,
    icons: [
      {
        src: process.env.VUE_SRC_ICO || "./img/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      }
      // etc ...
    ]
    // etc ...
  }
})
