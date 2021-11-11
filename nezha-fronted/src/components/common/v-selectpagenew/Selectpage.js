import './css/selectPage.css'
import dropdown from 'v-dropdown'

import data from 'v-selectpage/src/mixins/data'
import methods from './methods'
import util from 'v-selectpage/src/mixins/util'
import render from 'v-selectpage/src/mixins/render'

export default {
  name: 'v-selectpage',
  mixins: [data, methods, util, render],
  components: {
    'v-dropdown': dropdown,
    'sp-tag': () => import('v-selectpage/src/components/Tag'),
    'sp-select': () => import('v-selectpage/src/components/Select'),
    'sp-page': () => import('./Pagination'),
    'sp-list': () => import('v-selectpage/src/components/List'),
    'sp-table': () => import('v-selectpage/src/components/Table')
  },
  provide () {
    return {
      i18n: this.i18n,
      renderCell: this.renderCell,
      keyField: this.keyField,
      showField: this.showField,
      inPicked: this.inPicked,
      rtl: this.rtl
    }
  },
  mounted () {
    // set searchField when user not config
    if (!this.searchField) {
      if (typeof this.showField === 'string') {
        this.searchColumn = this.showField
      } else if (Array.isArray(this.showField) && this.showField.length) {
        this.searchColumn = this.showField[0].data
      }
    } else this.searchColumn = this.searchField

    // sort data list
    this.sortList()
    this.initSelection()
  }
}
