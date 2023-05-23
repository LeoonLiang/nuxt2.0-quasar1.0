# Nuxt2.0 + Quasar1.0
## 为什么这两在一起了
我们公司目前用的是Quasar1.0，1.0是用的是vue2，vue2还能勉强部分ie，也是为了这部分ie使用的1.0；你不得不说Quasar确实是个非常优秀的框架，真的是应有尽有。那么为什么又要加入nuxt呢。


因为遇到了一个不可处理的问题，quasar1.0在打包的时候，外链的关键css不会被preload，而是prefetch，这就导致在页面html都渲染出来了，css还没有，画面会抖动。通过阅读源码也无法解决，他的关键css那个json生成有些问题好像，具体的比较久远当时也没有解决。大家可以尝试自行起一个quasar包去build出来便知。关键css为prefetch。（SSR）

## 初步想法
使用nuxt2.0脚手架，使用nuxt的ssr，为了复用旧组件，使用quasar为组件库。初步思路很简单，就像在nuxt中使用其他组件库一样，引入quasar就好。初步写为：
```
<!-- 简单按需 -->
import { Btn, Dialog } from 'quasar'
Vue.component('QBtn', Btn)
Vue.component('QDialog', QDialog)
```


## 遇到问题， 分析解决
### 服务端报错，platfrom undefind等
通过阅读btn之类的组件源码，可以看到他组件里面直接使用```$q.xxx```，就是$q相关的东西，所以很显然，我们需要注册这个东西，那就跑不了
```
Vue.use(Quasar)
```
我们会发现，他还是不行，因为服务端还是没有相关参数。这时候去读了下quasar脚手架里的.qusara文件夹发现还需要加一句,我下面写完整的nuxt，plugins
```
import Vue from 'vue'
import { Plugin } from "@nuxt/types";
import Quasar from 'quasar'
 const quasarPlugin: Plugin = ({app, ssrContext}) => {
  Vue.use(Quasar)
  Quasar.ssrUpdate({app, ssr: ssrContext})
}
```
至此，也就解决了服务端报错的问题。也能正常使用了

## 按需引入
目前这样直接use quasar肯定是不行的，这样直接把整个quasar给我们打包进来了，巨大无比。我们尝试按需引入。查看源码知道他的主要注册文件路径为```src/vue-plugin```，其实他```src/index.common.js```里也导出了这个，所以我们应该解构出quasar
```
import { Quasar } from 'quasar'
Vue.use(Quasar)
```
不过```nuxt.config.js```还要加个配置,不然他会说你quasar包没导出Quasar
```
build: {
  transpile: ['quasar']
}
```
这样用组件就需要自己一个一个去注册了

## 真的按需了？
nuxt打包一下，发现整个quasar都被打进去了，**这是为啥？这里我确实还不是很理解。**不过问题还是要去解决。

直接引入具体的文件
```
import Quasar from 'quasar/src/vue-plugin.js'
Vue.use(Quasar)
```
这样打包就正常了；到这里能发现你使用组件也不能直接从'quasar'里解构，也是要找具体的，如
```
import QBtn from 'quasar/src/components/QBtn/QBtn.js'
```
然后去注册，这一套组合拳下来也太麻烦了。

## babel-plugin-transform-imports
引入**babel-plugin-transform-imports**这个包可以帮我解决这个事情,并在nuxt.config.js中加入
```
build: {
    transpile: ['quasar'],
    babel: {
      plugins: [
        [
          'transform-imports',
          {
            quasar: {
              transform: require('quasar/dist/babel-transforms/imports.js'),
              preventFullImport: true,
            },
          },
        ],
      ]
    }
  },
```
quasar中是留了这么个文件来指明各个组件，工具都在具体哪里的，所以这个打包工具可以做这事。我们现在就可以放心从'quasar'中拿东西了
```
import { Quasar, QBtn } from 'quasar'
Vue.use(Quasar)
Vue.components('QBtn', QBtn)
```
写到这里已经完成基本需求了，但是这样引入组件，还是很麻烦，用啥引入啥，可以想到现在的组件库的按需引入，会引入一个包去自动做。

## unplugin-vue-components
在nuxt.config.js中加入
```
 import QuasarResolver from './webpack/QuasarResolver' // *
 build: {
    transpile: ['quasar'],
    babel: {
      plugins: [
        [
          'transform-imports',
          {
            quasar: {
              transform: require('quasar/dist/babel-transforms/imports.js'),
              preventFullImport: true,
            },
          },
        ],
      ]
    },
    // *
    plugins: [
      Components({
        dts: true,
        directives: true,
        resolvers: [QuasarResolver()],
      }),
    ]
  },
```
他的原理可以简单的理解为，他解析template后，会把标签的tag给你，如Div、QBtn、Img，就是所有的html tag他都会给你，**然后传给你这个resolver函数，你这个resolver根据他给的tag，返回对应引入路径给他，他就会引入**，这个resolver大部分情况下可以使用这个库自带的reslover，他已经适配了很多库了，但是quasar的，他是quasar2.0的resolver，所以并不适用，需要自己写一个。大伙可以进去看看各个reslover都是怎么写的，然后模仿一个即可。
我自己写的这个reslover
```
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
```
可以看到，你只需要找到那个能给他路径的文件，然后按格式返回就行，这样就自动按需引入成功了。到这里又进一步了。

## 解决其他问题
### 样式问题
我们一直在按需引入，但是样式总不能直接饮用他的```index.min.css```吧，虽然简单粗暴，但是有点大，话不多说，按需引入样式也是通过unplugin-vue-components，他有个sideeffect的东西，类似副作用。我们可以看到quasar组件源码下有各自的sass，我们改造reslover，引入即可，这里有附加的三个问题。
1. 如QBtn文件夹下面有QBtn.sass，我们可以很简单的引入，但是发现他QBtn.js可能里面引用了QIcon，这是unplugin-vue-components给不了你的tag，所以你需要解决这些附带的sass
2. 有些公共的样式需要引入如flex这个class
3. 全局sass需要处理，QBtn.sass里使用了一些变量，然而变量定义在**quasar/src/css/variables.sass**里，需要处理我们逐步解决
   
首先是1，改写reslover，引入对应组件sass，同时读写对应组件的js文件，看看里面引入了哪些外部组件，顺带把他们的sass也引入。
```
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
      const path = getQuasarFullPath(name)
      return {
        as: name,
        from: path
      }
    }
  }]
}
```
上面还顺带引入了directive，原理差不多，具体代码内容就是递归引入文件的样式而已。

然后先解决3，我们会发现上面的代码写完还是会报错，因为组件sass里引入全局变量，也就是问题3。这里我们需要在webpack解析sass的时候，帮他把这全局变量的sass给引入,这里需要写个loader即可
```
// sass-variables-loader.js
const prefix = `@import 'quasar/src/css/variables.sass'\n`

module.exports = function (content) {
  return content.includes('$')
    ? prefix + content
    : content
}

```
```
build: {
    ...其他配置
    //loader
    extend(config) {
      config.module.rules.push({
        test: /\.sass$/,
        use: [
          {
            loader: join(__dirname, './webpack/sass-variables-loader.js'),
          },
        ],
      })
    },
  },
```
最后再是问题2。手动引入吧，在quasar的plugins里，也就是我们上面vue.user(quasar)的文件里
```
import 'quasar/src/css/core/animations.sass'
import 'quasar/src/css/core/colors.sass'
import 'quasar/src/css/core/elevation.sass'
import 'quasar/src/css/core/flex.sass'
import 'quasar/src/css/core/helpers.sass'
import 'quasar/src/css/core/mouse.sass'
import 'quasar/src/css/core/orientation.sass'
import 'quasar/src/css/core/positioning.sass'
import 'quasar/src/css/core/size.sass'
import 'quasar/src/css/core/touch.sass'
import 'quasar/src/css/core/transitions.sass'
import 'quasar/src/css/core/typography.sass'
import 'quasar/src/css/core/visibility.sass'
import 'quasar/src/css/core/dark.sass'
import 'quasar/src/css/normalize.sass'
```

### icon问题
我们知道quasar自带icon，他组件里也有默认使用一些，这里需要安装``` "@quasar/extras": "^1.0.0",```然后引入即可
```
import '@quasar/extras/material-icons/material-icons.css'
```

### Dialog等quasar插件问题
直接拿出来一起use即可
```
import {Quasar, Notify} from 'quasar'
import 'quasar/src/plugins/Notify.sass'
Vue.use(Quasar, {plugins: {Notify} })
```

### 平台class问题
我们使用quasar的时候，在不同端，他会在body上填不同class，如移动端的时候，在body上填mobile类，方便我们css使用,不过他是在他的template html里写的Q_BODY_CLASSES。nuxt对标一下就是还是在上面的plugins里写
```
const quasarPlugin: Plugin = ({app, ssrContext}) => {
  Vue.use(Quasar, {plugins: {Notify} })
  Quasar.ssrUpdate({app, ssr: ssrContext})
  // body上platform类
  if (process.server) {
    (app.head as any).bodyAttrs = {} as any
    (app.head as any).bodyAttrs.class = app.context.ssrContext.Q_BODY_CLASSES.split(' ')
  }
}
```

至此，这个奇奇怪怪的需求就基本完成了。分享记录下，万一你也有这个需求。谷歌基本没这个需求的解决方法，太多基于quasar2和nuxt3了。如果能用quasar2，我就不用nuxt了，quasar真香。OK，Peace!