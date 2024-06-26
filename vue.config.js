const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '/api': {
        //此处要与 /services/api.js 中的 API_PROXY_PREFIX 值保持一致
        target: 'http://gateway.fnconsumertest.com',
        // target:'http://192.168.2.62:8810',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
});
