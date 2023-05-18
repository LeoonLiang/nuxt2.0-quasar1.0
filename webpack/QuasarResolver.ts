import { resolveModule } from 'local-pkg'
import { ComponentResolver } from 'unplugin-vue-components'
export default function QuasarResolver(): ComponentResolver {
  const getQuasarFunPath = require('quasar/dist/babel-transforms/imports.js')
  return {
    type: 'component',
    resolve: (name: string) => {
      try {
        const path = getQuasarFunPath(name)
        const cssPath = path.replace('.js', '.sass')
        const cssLocalPath = resolveModule(cssPath) || ''
        return { as: name, from: path, sideEffects: cssLocalPath ? [
          cssPath
        ] : []}
      } catch (error) {
      }
    }
  }
}