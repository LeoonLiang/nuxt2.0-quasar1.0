import Vue from 'vue'
import { Plugin } from "@nuxt/types";
import {
  Quasar,
  QBtn,
  QCard,
  QCardSection
} from 'quasar'
import 'quasar/dist/quasar.min.css'

const quasarPlugin: Plugin = ({app, ssrContext}) => {
  Vue.use(Quasar)
  Quasar.ssrUpdate({app, ssr: ssrContext})
  Vue.component('QBtn', QBtn)
  Vue.component('QCard', QCard)
  Vue.component('QCardSection', QCardSection)
  // body上platform类
  if (process.server) {
    (app.head as any).bodyAttrs = {} as any
    (app.head as any).bodyAttrs.class = app.context.ssrContext.Q_BODY_CLASSES.split(' ')
  }
}

export default quasarPlugin