
<script>
import en from '../../common/language/en'
import cn from '../../common/language/cn'
export default {
  name: 'language',
  data () {
    return {
      result: null,
      languageList: []
    }
  },
  methods: {
    compareFile: function (obj, compareObj) {
      if (!obj) {
        obj = en
      }
      if (!compareObj) {
        compareObj = cn
      }
      const keys = Object.keys(obj)
      for (const key of keys) {
        if (typeof obj[key] === 'object') {
          if (!compareObj[key]) {
            this.$set(compareObj, key, {})
          }
          this.compareFile(obj[key], compareObj[key])
        } else {
          if (!compareObj[key]) {
            this.$set(compareObj, key, obj[key])
          }
        }
      }
      this.result = cn
    },
    listLanguage: function (obj, compareObj) {
      if (!obj) {
        obj = en
      }
      if (!compareObj) {
        compareObj = cn
      }
      const keys = Object.keys(obj)
      for (const key of keys) {
        if (typeof obj[key] === 'object') {
          if (!compareObj[key]) {
            this.$set(compareObj, key, {})
          }
          this.listLanguage(obj[key], compareObj[key])
        } else {
          if (!compareObj[key]) {
            this.$set(compareObj, key, obj[key])
          }
          this.languageList.push({ en: obj[key], cn: compareObj[key] })
        }
      }
    }
  }
}
</script>
