const prefix = `@import 'quasar/src/css/variables.sass'\n`

module.exports = function (content) {
  return content.includes('$')
    ? prefix + content
    : content
}
