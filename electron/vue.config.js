const fs = require('fs')
const path = require('path')

module.exports = {
  transpileDependencies: ['dot-prop'],

  pluginOptions: {
    electronBuilder: {
      buildDependenciesFromSource: true,
      chainWebpackMainProcess: (config) => {
        config.resolve.alias.set('@', path.resolve(__dirname, './src/'))
        config.resolve.alias.set('~', path.resolve(__dirname, '../'))

        config.module
          .rule('yaml')
          .test(/\.ya?ml$/)
          .use('js-yaml-loader')
          .loader('js-yaml-loader')
          .end()
      },
      externals: ['@lwahonen/ffi-napi', '@lwahonen/ref-napi'],
      preload: 'src/preload.js',
      rendererProcessFile: 'src/renderer.js',
      mainProcessWatch: [
        'src/api.ts',
        ...fs.readdirSync('./src/api').map((f) => `./src/api/${f}`),
        ...fs.readdirSync('./src/lib').map((f) => `./src/lib/${f}`),
      ],
      builderOptions: {
        appId: 'com.orirando.ui',
        productName: 'Ori and the Will of the Wisps Randomizer',
        copyright: 'Copyright © 2021 The Ori Randomizer Dev Community',
        fileAssociations: {
          ext: 'wotwr',
          name: 'Ori WotW Rando Seed',
        },
        linux: {
          target: ['dir'],
        },
        win: {
          target: ['dir'],
        },
        protocols: [
          {
            name: 'Ori and the Will of the Wisps Randomizer URL handler',
            schemes: ['ori-rando'],
          },
        ],
      },
    },
  },
}
