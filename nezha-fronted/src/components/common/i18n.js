import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
import { get } from '@/http'
import messages from './language'
import enLocale from 'element-ui/lib/locale/lang/en' // 引入element语言包
import zhLocale from 'element-ui/lib/locale/lang/zh-CN' // 引入element语言包
Vue.use(VueI18n)
// 从localStorage获取语言选择。
const i18n = new VueI18n({
  locale: localStorage.getItem('nz-language') || 'en', // 初始未选择默认 en 英文
  messages
})
locale.i18n((key, value) => i18n.t(key, value)) // 兼容element

export function loadI18n (i18nData) {
  if (i18nData) {
    Object.keys(i18nData).forEach(lang => {
      if (lang === 'zh') {
        Object.assign(i18nData[lang], { ...zhLocale })
      } else if (lang === 'en') {
        Object.assign(i18nData[lang], { ...enLocale })
      }
      i18n.setLocaleMessage(lang, { ...i18nData[lang] })
    })
  }
}
export default i18n
