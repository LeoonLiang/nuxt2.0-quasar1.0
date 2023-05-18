import Vue from 'vue'
import { Plugin } from "@nuxt/types";
import Quasar from 'quasar/src/vue-plugin'
// 引入基础sass
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.min.css'


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