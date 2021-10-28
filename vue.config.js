var path = require('path');
module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set('@', path.resolve(__dirname, 'src')),
      config.module.rule('md')
        .test(/\.md/)
        .use('vue-loader')
        .loader('vue-loader')
        .end()
        .use('vue-markdown-loader')
        .loader('vue-markdown-loader/lib/markdown-compiler')
        .options({
          raw: true
        })
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/web/'
    : '/',
  pluginOptions: {
    webpack: {
      dir: [
        './webpack'
      ]
    }
  }
}
