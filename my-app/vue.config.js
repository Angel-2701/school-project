const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  productionSourceMap: true,

  configureWebpack: {
    devtool: 'source-map'
  },

  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    }
  }
})
