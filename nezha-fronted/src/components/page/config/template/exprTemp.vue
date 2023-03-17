<template>
  <div>
    <nzDataList
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.expressionTemplate"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="expr-tmpl-list-export" v-has="'expressionTemplate_add'" :title="$t('overall.createTemplate')" class="top-tool-btn" type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="expression-template-list"
          export-url="/expression/tmpl/export"
          import-url="/expression/tmpl/import"
          export-file-name="expression-template"
          :params="searchLabel"
          :permissions="{import: 'expressionTemplate_add', export: 'expressionTemplate_edit'}"
          class="top-tool-export margin-l-10 margin-r-10"
          @afterImport="getTableData"
          v-has="['expressionTemplate_add','expressionTemplate_edit','expressionTemplate_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'exprTemp'"
                  :forceDeleteShow="false"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  id="alert-msg-batch-delete"
                  v-has="'expressionTemplate_delete'"
                  :api="url"
                ></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <expr-tmpl-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="(row) => {copy(row)}"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></expr-tmpl-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nzDataList>
    <transition name="right-box">
      <expr-tmpl-box v-if="rightBox.show" :exprTemp="object" @close="closeRightBox"></expr-tmpl-box>
    </transition>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false' :show-close="true" width="300px" @close="closeDialog" class="nz-dialog">
        <div class="upload-body">
          <button @click="exportCur" class="el-button el-button--default el-button--small" id="alert-msg-exportcur">
            <span>{{$t('overall.current')}}</span>
          </button>
          <button @click="exportAll" class="el-button el-button--default el-button--small" id="alert-msg-exportall">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import exprTmplBox from '@/components/common/rightBox/exprTmplBox'
import deleteButton from '@/components/common/deleteButton'
import dataListMixin from '@/components/common/mixin/dataList'
import exprTmplTable from '@/components/common/table/settings/exprTmplTable'

export default {
  name: 'exprTemp',
  components: {
    deleteButton,
    exprTmplBox,
    exprTmplTable,
    topToolMoreOptions
  },
  mixins: [dataListMixin],
  props: {
    switchTab: String
  },
  data () {
    return {
      url: 'expression/tmpl',
      tableId: 'exprTemp',
      /* 搜素相关 */
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          }, {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }, {
            name: this.$t('dashboard.dashboard.chartForm.group'),
            type: 'input',
            label: 'gname',
            disabled: false
          }
        ]
      },
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
