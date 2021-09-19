const fs = require('fs')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      appId: 'com.orirando.ui',
      productName: 'Ori and the Will of the Wisps Randomizer',
      copyright: 'Copyright © 2021 The Ori Randomizer Dev Community',
      preload: 'src/preload.js',
      rendererProcessFile: 'src/renderer.js',
      mainProcessWatch: [
        'src/api.js',
        ...fs.readdirSync('./src/api').map(f => `./src/api/${f}`),
        ...fs.readdirSync('./src/lib').map(f => `./src/lib/${f}`),
      ],
      builderOptions: {
        linux: {
          target: ['dir'],
        },
        win: {
          target: ['dir'],
        },
        protocols: {
          name: "ori-rando-protocol",
          schemes: [
            "ori-rando"
          ]
        }
      },
    },
  },
}
