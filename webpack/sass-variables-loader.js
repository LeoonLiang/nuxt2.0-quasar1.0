const fs = require('fs')
const join = require('path').join
const extScc = fs.existsSync(join(__dirname, '../css/quasar.variables.scss'))
const prefix = extScc ? `@import '~~/css/quasar.variables.scss', 'quasar/src/css/variables.sass'\n` : `'quasar/src/css/variables.sass'\n`

module.exports = function (content) {
  return content.includes('$')
    ? prefix + content
    : content
}
