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
        linux: {
          target: ['AppImage'],
        },
        win: {
          target: ['portable'],
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
