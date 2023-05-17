<template>
  <div class="selectTable">
    <div class="selectTable-search-input">
      <slot name="searchLeft"></slot>
      <el-input size="small" v-model="filter" @keyup.native="search">
        <i slot="suffix" class="el-icon-search"></i>
      </el-input>
    </div>
    <el-table
      v-my-loading="loading"
      :data="tableData"
      :row-style="{cursor: 'pointer'}"
      :cell-style="{height:'32px',padding:'0'}"
      :header-cell-style="{height:'32px',padding: '0'}"
      :row-class-name="({row})=>{return row[valueKey] == this.myValue ? 'row-selected':''}"
      @row-click="rowClick"
      :height="tableHeight"
      >
      <el-table-column
        v-for="(item, index) in columns"
        :key="`col-${index}-${item.prop}`"
        :min-width="`${item.minWidth}`"
        :width="`${item.width}`"
        :prop="item.prop"
        :label="item.label"
        :formatter="tableFormat"
      >
      </el-table-column>
      <template slot="empty">
        <div v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
    <div class="pagination">
      <el-pagination
        @current-change="pageChange"
        :current-page.sync="pageNo"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
export default {
  name: 'selectTable',
  model: {
    prop: 'myValue'
  },
  props: {
    // 当前选中的值
    myValue: {
      type: [Number, String]
    },
    api: {
      type: String,
      require: true
    },
    params: {
      type: Object,
      default: function () {
        return {}
      }
    },
    // 作为唯一标识的键名
    valueKey: {
      type: String,
      default: 'id'
    },
    // 搜索的键名
    searchKey: {
      type: String,
      default: 'id'
    },
    pageSize: {
      type: Number,
      default: 10
    },
    tableHeight: {
      type: Number,
      default: 288
    },
    columns: {
      type: Array,
      default: function () {
        return []
      }
    },
    // 展示数据格式化
    tableFormat: {
      type: Function,
      default: function (row, column, cellValue) {
        return cellValue || '-'
      }
    }
  },
  data () {
    return {
      loading: false,
      filter: '',
      tableData: [],
      pageNo: 1,
      total: 0
    }
  },
  methods: {
    getTableData () {
      this.loading = true
      const params = {
        ...this.params,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        [this.searchKey]: this.filter
      }
      this.$get(this.api, params).then(response => {
        this.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.total = response.data.total
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    // 当前行点击选中
    rowClick (row) {
      const value = this.myValue == row[this.valueKey] ? '' : row[this.valueKey]
      this.$emit('input', value)
    },
    // 搜索关键字
    search: bus.debounce(function () {
      this.pageNo = 1
      this.getTableData()
    }, 500),
    pageChange (val) {
      this.pageNo = val
      this.getTableData()
    }
  }
}
</script>
