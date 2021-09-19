const fs = require('fs')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      rendererProcessFile: 'src/renderer.js',
      mainProcessWatch: [
        'src/api.js',
        ...fs.readdirSync('./src/api').map(f => `./src/api/${f}`),
        ...fs.readdirSync('./src/lib').map(f => `./src/lib/${f}`),
      ],
      builderOptions: {
        appId: 'com.orirando.ui',
        productName: 'Ori and the Will of the Wisps Randomizer',
        copyright: 'Copyright © 2021 The Ori Randomizer Dev Community',
        fileAssociations: {
          ext: 'wotwr',
          name: 'Ori WotW Rando Seed'
        },
        linux: {
          target: ['dir'],
        },
        win: {
          target: ['dir'],
        },
        protocols: [{
          name: 'Ori and the Will of the Wisps Randomizer URL handler',
          schemes: ['ori-rando'],
        }],
      },
    },
  },
}
