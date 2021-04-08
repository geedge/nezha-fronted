<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.expressionTemplate"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle">
      <template v-slot:top-tool-right>
        <export-excel
          id="expression-template-list"
          class="top-tool-export margin-l-20"
          export-url="expression/tmpl/export"
          import-url="expression/tmpl/import"
          export-file-name="expression-template"
          :params="searchLabel"
          :permissions="{import: 'asset_import', export: 'asset_export'}"
          @afterImport="getTableData"
          v-has="'expr_temp_save'"
        >
          <template slot="optionZone">
            <button id="expr-tmpl-list-export" v-has="'expr_temp_save'" :title="$t('overall.createTemplate')" class="top-tool-btn"
                    type="button" @click="add">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
          </template>
        </export-excel>

        <delete-button :delete-objs="batchDeleteObjs" @after="getTableData"
                       :api="'expression/tmpl'" v-has="'expr_temp_delete'" id="alert-msg-batch-delete"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table
          id="role-list-table"
          ref="dataTable"
          v-loading="tools.loading"
          :data="tableData"
          :height="mainTableHeight"
          border
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{batchDeleteObjs=selection}"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :fixed="item.fixed"
            :label="item.label"
            :prop="item.prop"
            :resizable="true"
            :sort-orders="['ascending', 'descending']"
            :width="`${item.width}`"
            class="data-column"
          >
            <template slot="header">
              <span>{{item.label}}</span>
              <div class="col-resize-area"></div>
            </template>
            <template slot-scope="scope" :column="item">
              <span v-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            :width="operationWidth"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <button class="table-operation-item" @click="$refs.dataList.showBottomBox('operationLog', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
              <el-dropdown size="medium" trigger="hover" @command="tableOperation">
                <div class="table-operation-item table-operation-item--more">
                  <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="['edit', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['copy', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('config.exprTemp.copy')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['delete', scope.row, `sys/role?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="role-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false'
                 :show-close="true" width="300px" @close="closeDialog" class="nz-dialog">
        <div class="upload-body">
          <button @click="exportCur" class="el-button el-button--default el-button--small" id="alert-msg-exportcur">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button @click="exportAll" class="el-button el-button--default el-button--small" id="alert-msg-exportall">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
    <!--侧滑-->
    <transition name="right-box">
      <exprTempBox v-if="rightBox.show" ref="exprTempBox" :exprTemp="object"
                   @close="closeRightBox"></exprTempBox>
    </transition>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import exportXLSX from '@/components/common/exportXLSX'
import exprTempBox from '@/components/common/rightBox/exprTempBox'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'

export default {
  name: 'exprTemp',
  components: {
    deleteButton,
    exprTempBox,
    nzDataList,
    'export-excel': exportXLSX
  },
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'exprTemp',
      /* 搜素相关 */
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: 'Id',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 12,
            name: this.$t('config.exprTemp.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }, {
            id: 13,
            name: this.$t('config.exprTemp.gname'),
            type: 'selectTemp',
            label: 'gname',
            disabled: false
          }
        ]
      },
      /* 表格相关 */
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.exprTemp.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.exprTemp.gname'),
          prop: 'gname',
          show: true
        }, {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expression',
          show: true
        }, {
          label: this.$t('config.exprTemp.remark'),
          prop: 'remark',
          show: true
        }
      ],
      // 导出相关
      importBox: { show: false, title: this.$t('overall.exportExcel') },
      deleteBox: { show: false, ids: '', remark: '', state: 2 },
      // 创建修改相关
      blankObject: {
        id: '',
        name: '',
        gname: '',
        expression: '',
        remark: ''
      },
      nowTime: ''
    }
  },
  computed: {
    getDuration () {
      return function (record) {
        if (record.endAt) {
          return calcDurationByStringTimeB(record.startAt, record.endAt)
        }
        return calcDurationByStringTimeB(record.startAt, this.nowTime)
      }
    }
  },
  mounted () {
    this.initEvent()
  },
  methods: {
    initEvent () {
      bus.$on('alert-rule-list-change', () => {
        this.getTableData()
      })
      bus.$on('dc-list-change', () => {
        this.getTableData()
      })
      bus.$on('alert-message-change', () => {
        this.getTableData()
      })
    },
    getTableData () {
      if (!this.hasButton('rule_view')) {
        this.$message.error(this.$t('tip.noAccess'))
        return
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get('expression/tmpl', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    showExportDialog () {
      this.importBox.show = true
    },
    closeDialog () {
      this.importBox.show = false
      this.deleteBox.show = false
    },
    exportCur () {
      const searchLabel = Object.assign({}, this.searchLabel)
      this.$set(searchLabel, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel(searchLabel)
      this.closeDialog()
    },
    exportAll () {
      const temp = JSON.parse(JSON.stringify(this.searchLabel))
      temp.pageSize = -1
      this.$set(temp, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel(temp)
      this.closeDialog()
    },
    overtime (row) {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmOvertime'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('expression/tmpl?ids=' + row.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    }
  }
}
</script>
