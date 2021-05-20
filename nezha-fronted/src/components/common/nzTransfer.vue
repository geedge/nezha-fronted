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
          style="width:100%"
          @search="search"
        ></search-input>
      </div>
      <div class="box__table">
        <el-table
          v-loading="loading"
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
            width="36">
          </el-table-column>
          <el-table-column
            :label="item.label"
            v-for="(item,index) in tableTitle"
            :key="index"
          >
            <template slot-scope="scope" v-if="!item.slot">{{scope.row[item.prop]}}</template>
            <slot :name="item.prop" v-else></slot>
          </el-table-column>
        </el-table>
      </div>
      <div class="box__footer">
        <el-pagination
          :current-page.sync="selectablePage.pageNo"
          :page-size="selectablePage.pageSize"
          :total="selectablePage.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input ref="jumpInput" v-model="selectablePage.pageNo" class="jump-input" @change="selectableChange" @keyup.enter.native="selectableChange"/>
            <span class="jump-pages">/&nbsp{{selectablePage.pages}}</span>
          </template>
        </el-pagination>
        <button :class="{'top-tool-btn--disabled': selectableSelection.length === 0}"
                class="top-tool-btn"
                type="button"
                @click="leftToRight">
          <i class="nz-icon nz-icon-arrow-right"></i>
        </button>
      </div>
    </div>
    <div :style="calcStyle" class="nz-transfer__box nz-transfer__box--right">
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
            width="36">
          </el-table-column>
          <el-table-column
            :label="item.label"
            v-for="(item,index) in tableTitle"
            :key="index"
          >
            <template slot-scope="scope" v-if="!item.slot">{{scope.row[item.prop]}}</template>
            <slot :name="item.prop" v-else></slot>
          </el-table-column>
        </el-table>
      </div>
      <div class="box__footer">
        <button :class="{'top-tool-btn--disabled': selectedSelection.length === 0}"
                :disabled="selectedSelection.length === 0"
                class="top-tool-btn"
                type="button"
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
      this.selectablePage.pageNo = current
      this.$emit('search', this.searchLabel, this.selectablePage)
    },
    selectedChange (current) { // 右侧table翻页

    },
    selectableSelectionChange (val) { // 左侧选项变化
      this.selectableSelection = val
    },
    selectedSelectionChange (val) { // 右侧选项变化
      this.selectedSelection = val
    },
    leftToRight () {
      this.$emit('leftToRight', this.selectableSelection)
      this.selectedData.splice(0, 0, ...this.selectableSelection)
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

<style lang="scss">
.nz-transfer {
  display: flex;
  justify-content: space-between;

  .nz-transfer__box {
    width: calc(50% - 7.5px);
    border: 1px solid $--right-box-border-color;
    border-radius: $--primary-border-radius;

    .box__header {
      display: flex;
      align-items: center;
      padding: 0 10px;
      height: 52px;
      color: #666;
      box-sizing: border-box;
      border-bottom: 1px solid $--right-box-border-color;

      input {
        background-color: transparent !important;
      }
    }

    .box__table {
      height: calc(100% - 94px);
      border-bottom: 1px solid $--right-box-border-color;

      .el-table--border::after, .el-table--group::after, .el-table::before {
        height: 0;
      }
      .el-table__row {
        td {
          border-color: $--right-box-border-color;

          &:first-of-type .cell {
            text-overflow: unset;
          }
        }
      }
    }

    .box__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 1px;
      height: 42px;
      box-sizing: border-box;

      .jump-input {
        width: 40px;

        .el-input__inner {
          padding: 0 5px;
          height: 24px;
          line-height: 24px;
        }
      }

      .jump-pages {
        padding-left: 9px;
        font-size: 14px;
        color: #333;
      }

      .top-tool-btn {
        height: 28px;
        width: 28px;
        line-height: 28px;
      }

      .el-pagination {
        display: flex;
        align-items: center;
        padding: 0;

        .btn-prev, .btn-next {
          border: none;
          background-color: transparent !important;
        }
        .btn-prev {
          margin: 0 5px;
        }
        .btn-next {
          margin: 0;
        }
      }
    }
  }
}
.hide-row {
  display: none !important;
}
</style>
