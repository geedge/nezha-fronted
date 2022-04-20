module.exports = {
  local: 'en',
  obj: {
    en: {
      'overall.all': 'All'
    },
    zh: {
      'overall.all': '全部'
    }
  },
  t (code) {
    return this.obj[this.local][code] || code
  }
}
