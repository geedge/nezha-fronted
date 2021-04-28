import DatePicker from './src/picker/date-picker'
import localeEn from 'element-ui/lib/locale/lang/en'
import localeCn from 'element-ui/lib/locale/lang/zh-CN'
import { use } from 'element-ui/src/locale/'
/* istanbul ignore next */
DatePicker.install = function install (Vue) {
  if (localStorage.getItem('nz-language') === 'cn') {
    use(localeCn)
  } else {
    use(localeEn)
  }
  Vue.component(DatePicker.name, DatePicker)
}

export default DatePicker
