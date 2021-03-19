<style scoped>
  .menus {
    position: relative;
    height: calc(100% - 50px) !important;
  }
</style>
<template>
  <div class="menus">
    <!-- 主页面 -->
    <div class="main-list" >
      <!-- 顶部工具栏 -->
      <div class="main-modal"></div>
      <div class="top-tools" >
        <div class="top-tool-main-right" >
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search" ref="searchInput" ></search-input>
          </div>
          <button :title="$t('overall.createMenus')" @click="add" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20"
                  id="menus-add" type="button">
            <i class="nz-icon-create-square nz-icon"></i>
          </button>
          <delete-button :delete-objs="batchDeleteObjs" :filter-function="(arr)=>{return '?ids='+arr.map(t=>t.id).join(',')}" @before="delFlag=true" @after="getTableData" api="sys/menu" id="menus-list-batch-delete"></delete-button>
        </div>
        <!-- 顶部分页组件，当打开底部上滑框时出现 -->
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- 自定义table列 -->
      <transition name="el-zoom-in-top">
        <element-set
          id="menu-list"
          :custom-table-title.sync="tools.customTableTitle"
          :original-table-title="tableTitle"
          @close="tools.showCustomTableTitle = false"
          ref="customTableTitle"
          v-if="tools.showCustomTableTitle"
        ></element-set>
      </transition>
      <el-table
        id="menu-list-table"
        :data="tableData"
        :height="mainTableHeight"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
        @sort-change="tableDataSort"
        border
        class="nz-table"
        ref="menusTable"
        row-key="id"
        style="width: 100%;"
        v-loading="tools.loading"
      >
        <el-table-column
          :resizable="false"
          align="center"
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column
          :fixed="item.fixed"
          :key="`col-${index}`"
          :label="item.label"
          :prop="item.prop"
          :resizable="true"
          :sort-orders="['ascending', 'descending']"
          v-for="(item, index) in tools.customTableTitle"
          v-if="item.show"
        >
          <template slot="header">
          <span :title="item.label" class="tag-header" v-if="item.type == 'tag'"><span class="tag-value">{{item.label}}</span><span style="color:orange;">&nbsp;[Notification]</span></span>
          <span v-else><span>{{item.label}}</span></span>
        </template>
          <template :column="item" slot-scope="scope">
            <div class="content-right-options" v-if="item.prop == 'option'">
              <span :id="'menus-edit-'+scope.row.id" :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option"><i :class="{'gray-filter':scope.row.buildIn == 1}" class="nz-icon nz-icon-edit"></i></span>
              &nbsp;
              <span :id="'menus-del-'+scope.row.id" :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option"><i :class="{'gray-filter':scope.row.buildIn == 1}" class="nz-icon nz-icon-delete"></i></span>
            </div>
            <template v-if="item.prop == 'name'">
              <template v-if="scope.row.i18n">
                <span>{{$t(scope.row.i18n)}}</span>
              </template>
              <template v-else-if="scope.row.name">
                <span>{{scope.row.name}}</span>
              </template>
              <template v-else>
                <span>-</span>
              </template>
            </template>
            <template v-else-if="item.prop == 'type'">
              <span>{{scope.row[item.prop] == 2?$t('config.menus.button'):$t('config.menus.menu')}}</span>
            </template>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" width="28">
          <template slot="header" :resizable="false">
            <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn " id="menu-list-totop"><i class="nz-icon nz-icon-top"></i></button>
    </div>
    <transition name="right-box">
      <menu-box :menu="menu" @close="closeRightBox" v-if="rightBox.show"></menu-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '../../common/deleteButton'
import menuBox from '../../common/rightBox/menuBox'
import bus from '../../../libs/bus'

export default {
  name: 'menus',
  components: {
    'menu-box': menuBox,
    'delete-button': deleteButton
  },
  data () {
    return {
      // 侧滑
      rightBox: {
        show: false
      },
      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        toTopBtnTop: this.$tableHeight.toTopBtnTop, // to-top按钮的top属性
        tableHover: false, // 控制滚动条和top按钮同时出现
        showTopBtn: false, // 显示To top按钮
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      mainTableHeight: this.$tableHeight.normal, // 主列表table高度
      batchDeleteObjs: [],
      menu: {},

      tableId: 'menusTable', // 需要分页的table的id，用于记录每页数量
      blankMenu: { // 空白对象
        name: '',
        code: '',
        i18n: '',
        parentId: 0,
        type: 1,
        route: '',
        orderNum: 1,
        perms: ''
      },
      pageObj: { // 分页对象
        pageNo: 1,
        pageSize: 50,
        total: 0
      },
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.menus.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.menus.code'),
          prop: 'code',
          show: true
        }, {
          label: this.$t('config.menus.i18n'),
          prop: 'i18n',
          show: true
        }, {
          label: this.$t('config.menus.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('config.menus.route'),
          prop: 'route',
          show: true
        }, {
          label: this.$t('config.menus.perms'),
          prop: 'perms',
          show: true
        }, {
          label: this.$t('config.menus.orderNum'),
          prop: 'orderNum',
          show: true
        }, {
          label: this.$t('config.menus.option'),
          prop: 'option',
          show: true,
          width: 120,
          fixed: 'right'
        }
      ],
      tableData: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }]
      },
      searchLabel: {}, // 搜索参数
      scrollbarWrap: null,
      delFlag: false
    }
  },
  methods: {
    closeRightBox (refresh) {
      this.rightBox.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    edit (u) {
      if (u.buildIn == 1) {
        return
      }
      this.menu = JSON.parse(JSON.stringify(u))
      this.rightBox.show = true
    },
    del (u) {
      if (u.buildIn == 1) {
        return
      }
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('sys/menu?ids=' + u.id).then(response => {
          if (response.code === 200) {
            this.delFlag = true
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get('sys/menu', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          this.tools.loading = false
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.menusTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    add () {
      this.menu = this.newMenu()
      this.rightBox.show = true
    },
    esc () {
      this.rightBox.show = false
    },
    newMenu () {
      return JSON.parse(JSON.stringify(this.blankMenu))
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getTableData()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
      this.getTableData()
    },
    search (searchObj) {
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item])
        }
      }
      if (this.$refs.menusTable) {
        this.$refs.menusTable.bodyWrapper.scrollTop = 0
      }
      this.getTableData()
    },
    // 数据排序
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.$set(this.searchLabel, 'orderBy', orderBy)
      this.getTableData()
    }
  },
  watch: {
    tableData: {
      deep: true,
      handler (n) {
        if (n.length === 0 && this.pageObj.pageNo > 1) {
          this.pageNo(this.pageObj.pageNo - 1)
        }

        if (!this.delFlag) { // 不是删除时回到顶部
          this.$refs.menusTable.bodyWrapper.scrollTop = 0
        } else {
          this.delFlag = false
        }
      }
    }
  },
  created () {
    // 是否存在分页缓存
    const pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId)
    if (pageSize != 'undefined' && pageSize != null) {
      this.pageObj.pageSize = pageSize
    }
  },
  mounted () {
    // 初始化表头
    this.tools.customTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path)
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path))
      : this.tableTitle
    this.tableTitleReset(this.tableTitle, this.tools.customTableTitle)
    this.getTableData()
  },
  beforeDestroy () {
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', bus.debounce)
    };
  }
}
</script>
