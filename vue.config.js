const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: "radio" ,
    short_name: "radio"  ,
    theme_color: "orange",
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
