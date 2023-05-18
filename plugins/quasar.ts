import Vue from 'vue'
import { Plugin } from "@nuxt/types";
import Quasar from 'quasar/src/vue-plugin'
// 引入基础sass
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

const quasarPlugin: Plugin = ({app, ssrContext}) => {
  Vue.use(Quasar)
  Quasar.ssrUpdate({app, ssr: ssrContext})
  // body上platform类
  if (process.server) {
    (app.head as any).bodyAttrs = {} as any
    (app.head as any).bodyAttrs.class = app.context.ssrContext.Q_BODY_CLASSES.split(' ')
  }
}

export default quasarPlugin