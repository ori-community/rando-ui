const fs = require('fs')

module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      rendererProcessFile: 'src/renderer.js',
      mainProcessWatch: [
        'src/api.js',
        ...fs.readdirSync('./src/api').map(f => `./src/api/${f}`),
      ],
      builderOptions: {
        linux: {
          target: ['AppImage'],
        },
        win: {
          target: ['portable'],
        },
      },
    },
  },
}
