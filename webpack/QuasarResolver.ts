import { promises as fs } from 'node:fs'
import { resolveModule } from 'local-pkg'
import { ComponentResolver } from 'unplugin-vue-components'
const getQuasarFullPath = require('quasar/dist/babel-transforms/imports.js')
async function getSideEffects(componentName: string, sideEffects: string[], isLoaded: string[]) {
  if (isLoaded.includes(componentName)) return
  isLoaded.push(componentName)

  const path = getQuasarFullPath(componentName)
  const localPath = resolveModule(path) as string
  const cssPath = path.replace('.js', '.sass')
  const cssLocalPath = resolveModule(cssPath) || ''
  if (cssLocalPath && !sideEffects.includes(cssPath)) sideEffects.push(cssPath)
  if (!localPath) return
  const content = await fs.readFile(localPath, 'utf-8')
  const referencedComponents = content.match(/Q\w*(?=\.js)/g)
  if (referencedComponents) {
    await Promise.allSettled(referencedComponents.map(item => getSideEffects(item, sideEffects, isLoaded)))
  }
}
export default  function QuasarResolver(): ComponentResolver[] {
  return [{
    type: 'component',
    resolve: async (name: string) => {
      try {
        const isLoaded: string[] = []
        const path = getQuasarFullPath(name)
        const sideEffects: string[] = []
        await getSideEffects(name, sideEffects, isLoaded)
        return { as: name, from: path, sideEffects}
      } catch (error) {
      }
    }
  },{
    type: 'directive',
    resolve: (name: string) => {
      try {
        const path = getQuasarFullPath(name)
        return {
          as: name,
          from: path
        }
      } catch (error) {
      }
      
    }
  }]
}