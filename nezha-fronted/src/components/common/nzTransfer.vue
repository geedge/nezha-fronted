<template>
  <div class="nz-transfer">
    <div :style="calcStyle" class="nz-transfer__box nz-transfer__box--left">
      <div class="box__header">
        <search-input
          ref="searchInput"
          :placeholder="$t('overall.placeHolder')"
          :search-msg="searchMsg"
          :show-history="false"
          :show-search="false"
          :isNzTransfet="true"
          style="width:100%"
          @search="search"
        ></search-input>
      </div>
      <div class="box__table">
        <el-table
          v-my-loading="loading"
          :data="selectableData"
          :row-class-name="setRowShow"
          height="100%"
          size="small"
          @selection-change="selectableSelectionChange"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="50">
          </el-table-column>
          <el-table-column
            :label="item.label"
            v-for="(item,index) in tableTitle"
            :key="index"
          >
            <template slot-scope="scope" v-if="!item.slot">{{scope.row[item.prop].name || scope.row[item.prop]}}</template>
            <slot :name="item.prop" v-if="item.slot"></slot>
          </el-table-column>
        </el-table>
      </div>
      <div class="box__footer">
        <el-pagination
          @current-change="pageNoChange"
          :current-page.sync="selectablePage.pageNo"
          :page-size="selectablePage.pageSize"
          :total="selectablePage.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input ref="jumpInput" v-model.number="selectablePage.pageNo" class="jump-input" @change="selectableChange" @keyup.enter.native="selectableChange"/>
            <span class="jump-pages">/&nbsp{{selectablePage.pages}}</span>
          </template>
        </el-pagination>
        <button :class="{'top-tool-btn--disabled': selectableSelection.length === 0}"
                class="top-tool-btn"
                type="button"
                :title="$t('overall.rightShift')"
                @click="leftToRight">
          <i class="nz-icon nz-icon-arrow-right"></i>
        </button>
      </div>
    </div>
    <div :style="calcStyle" class="nz-transfer__box nz-transfer__box--right" :class="showError?'error' : ''">
      <div class="box__header">
        <slot name="title"></slot>
        <slot></slot>
      </div>
      <div class="box__table">
        <el-table
          :data="selectedData"
          height="100%"
          size="small"
          @selection-change="selectedSelectionChange"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="50">
          </el-table-column>
          <el-table-column
            :label="item.label"
            v-for="(item,index) in tableTitle"
            :key="index"
          >
            <template slot-scope="scope" v-if="!item.slot">{{scope.row[item.prop].name || scope.row[item.prop]}}</template>
            <slot :name="item.prop" v-if="item.slot"></slot>
          </el-table-column>
        </el-table>
      </div>
      <div class="box__footer">
        <button :class="{'top-tool-btn--disabled': selectedSelection.length === 0}"
                :disabled="selectedSelection.length === 0"
                class="top-tool-btn"
                type="button"
                :title="$t('overall.leftShift')"
                @click="rightToLeft">
          <i class="nz-icon nz-icon-arrow-left"></i>
        </button>
<!--        <el-pagination
          :current-page.sync="selectedPage.pageNo"
          :page-size="selectedPage.pageSize"
          :total="selectedPage.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input ref="jumpInput" class="jump-input" v-model="selectedPage.pageNo" @change="selectedChange" @keyup.enter.native="selectedChange"/>
            <span class="jump-pages">/&nbsp{{selectedPage.pages}}</span>
          </template>
        </el-pagination>-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'nzTransfer',
  props: {
    height: {
      type: String,
      default: '430'
    },
    tableData: { // 左侧待选
      type: Array
    },
    searchMsg: {
      type: Object
    },
    pageObj: {
      type: Object
    },
    tableTitle: {
      type: Array
    },
    showError: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectedData: [], // 右侧已选
      searchLabel: {},
      loading: false,
      selectablePage: {},
      selectedPage: {
        pageSize: 10,
        pageNo: 1,
        total: 0,
        pages: 0
      },
      selectableSelection: [],
      selectedSelection: []
    }
  },
  computed: {
    selectableData () {
      return this.tableData.filter(d => {
        return !this.selectedData.find(s => d.id === s.id)
      })
    },
    calcStyle () {
      const style = {}
      let height
      if (parseInt(this.height)) {
        height = `${this.height}px`
      } else {
        height = this.height
      }
      style.height = height
      return style
    }
  },
  methods: {
    search (searchLabel) {
      this.searchLabel = { ...searchLabel }
      this.$emit('search', this.searchLabel, this.selectablePage)
    },
    selectableChange (current) { // 左侧table翻页
      // this.selectablePage.pageNo = current
      this.$emit('search', this.searchLabel, this.selectablePage)
    },
    selectedChange (current) { // 右侧table翻页

    },
    pageNoChange (val) {
      this.$emit('pageNo', val)
    },
    selectableSelectionChange (val) { // 左侧选项变化
      this.selectableSelection = val
    },
    selectedSelectionChange (val) { // 右侧选项变化
      this.selectedSelection = val
    },
    leftToRight () {
      this.selectedData.splice(0, 0, ...this.selectableSelection)
      this.$emit('leftToRight', this.selectedData)
    },
    rightToLeft () {
      this.$emit('rightToLeft', this.selectedSelection)
      this.selectedData = this.selectedData.filter(d => !this.selectedSelection.find(s => d.id === s.id))
    },
    startLoading () {
      this.loading = true
    },
    endLoading () {
      this.loading = false
    },
    setRowShow ({ row }) {
      if (this.tableData.some(d => d.hide && row.id === d.id)) {
        return 'hide-row'
      }
      return ''
    }
  },
  watch: {
    pageObj: {
      immediate: true,
      deep: true,
      handler (n) {
        this.selectablePage = { ...n }
      }
    }
  }
}
</script>
