import { ComponentResolver } from 'unplugin-vue-components'
export default function QuasarResolver(): ComponentResolver {
  const getQuasarFunPath = require('quasar/dist/babel-transforms/imports.js')
  return {
    type: 'component',
    resolve: (name: string) => {
      try {
        const path = getQuasarFunPath(name)
        return { as: name, from: path }
      } catch (error) {
      }
    }
  }
}