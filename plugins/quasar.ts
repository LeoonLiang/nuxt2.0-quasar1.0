/* eslint import/namespace: ['error', { allowComputed: true }] */
import Vue from 'vue'
import { Plugin } from "@nuxt/types";
import {Quasar, Notify} from 'quasar'
// 引入基础sass
import '@quasar/extras/material-icons/material-icons.css'

const quasarPlugin: Plugin = ({app, ssrContext}) => {
  Vue.use(Quasar, {plugins: {Notify} })
  Quasar.ssrUpdate({app, ssr: ssrContext})
  // body上platform类
  if (process.server) {
    (app.head as any).bodyAttrs = {} as any
    (app.head as any).bodyAttrs.class = app.context.ssrContext.Q_BODY_CLASSES.split(' ')
  }
}

export default quasarPlugin