<template>
  <div>
    <nzDataList
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.dashboardTemp"
      :search-msg="searchMsg"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="expr-tmpl-list-export" v-has="'dashboard_temp_add'" :title="$t('overall.createTemplate')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="dashboard-template-list"
          export-url="/visual/panel/export"
          import-url="/visual/panel/import"
          export-file-name="dashboard-temp"
          :params="searchLabel"
          :paramsType="'template'"
          :permissions="{import: 'dashboard_temp_add', export: 'dashboard_temp_edit'}"
          class="top-tool-export margin-r-10"
          @afterImport="getTableData"
          v-has="['dashboard_temp_add','dashboard_temp_edit','dashboard_temp_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'dashboardTemp'"
                  :forceDeleteShow="false"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  id="alert-msg-batch-delete"
                  v-has="'dashboard_temp_delete'"
                  :api="url">
                </delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template  v-slot="slotProps">
        <dashboardTmplTable
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
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @sync="chartBySync"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></dashboardTmplTable>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nzDataList>

    <transition name="right-box">
      <panel-box v-if="rightBox.show" :from="fromRoute.dashboardTemp" ref="panelBox" :obj="object" @close="closePanelBox" panelType="template"></panel-box>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import dataListMixin from '@/components/common/mixin/dataList'
import dashboardTmplTable from '@/components/common/table/settings/dashboardTmplTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import panelBox from '@/components/common/rightBox/panelBox'

export default {
  name: 'dashboardTemp',
  components: {
    deleteButton,
    dashboardTmplTable,
    topToolMoreOptions,
    panelBox
  },
  mixins: [dataListMixin, routerPathParams],
  data () {
    return {
      detailType: 'list',
      url: 'visual/panel',
      tableId: 'dashboardTemp',
      orderBy: 'id',
      /* 搜素相关 */
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            name: this.$t('dashboard.panel.chartForm.varType'),
            type: 'select',
            label: 'dashboardVarType',
            readonly: true,
            disabled: false
          }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    add () {
      if (!this.hasButton('panel_view')) {
        return
      }
      this.rightBox.show = true
      // 关闭selectDashboard弹框
      this.object = {
        id: '',
        name: '',
        varType: 1,
        remark: '',
        param: {
          report: {
            enable: false,
            receivers: [],
            range: {
              unit: 'day'
            },
            schedule: {
              stime: '',
              etime: '',
              nums: [],
              type: 2 + '',
              repeat: 1
            }
          },
          chartShare: 'none'
        }
      }
    },
    edit (u) {
      this.$get('visual/panel/' + u.id).then(res => {
        if (res.code === 200) {
          this.object = res.data
          if (!this.$loadsh.get(this.object, 'param.report', '')) {
            this.object = {
              ...this.object,
              param: {
                report: {
                  enable: false,
                  range: {
                    unit: 'day'
                  },
                  schedule: {
                    type: '2',
                    repeat: 1,
                    nums: [],
                    stime: '',
                    etime: ''
                  },
                  receivers: []
                },
                chartShare: 'none'
              }
            }
          }
          this.object.param.report.schedule.type = this.object.param.report.schedule.type + ''
          const startTime = this.$loadsh.get(this.object, 'param.report.schedule.stime', '')
          if (startTime !== '') {
            this.object.param.report.schedule.stime = this.utcTimeToTimezoneStr(this.object.param.report.schedule.stime, 'YYYY-MM-DD HH:mm:ss')
          } else {
            this.object.param.report.schedule.stime = ''
          }
          const endTime = this.$loadsh.get(this.object, 'param.report.schedule.etime', '')
          if (endTime !== '') {
            this.object.param.report.schedule.etime = this.utcTimeToTimezoneStr(this.object.param.report.schedule.etime, 'YYYY-MM-DD HH:mm:ss')
          } else {
            this.object.param.report.schedule.etime = ''
          }
          this.rightBox.show = true
        }
      })
    },
    copy (u) {
      this.$confirm(this.$t('tip.confirmDuplicateDashboard'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$post('/visual/panel/duplicate/' + u.id).then(res => {
          if (res.code === 200) {
            this.getTableData()
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {
      })
    },
    chartBySync (row) {
      this.$confirm(this.$t('tip.syncTip'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('dispatchHomeLoading', true)
        this.$post('visual/panel/chart/syncTmpl', { pid: row.id }).then(res => {
          this.$store.dispatch('dispatchHomeLoading', false)
          if (res.code === 200) {
            this.getTableData()
            this.$message.success(this.$t('tip.syncSuccess'))
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {
      })
    },
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.updatePath({ ...this.searchLabel, ...this.searchCheckBox })
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox, type: 'template' }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    closePanelBox (refresh) {
      this.rightBox.show = false
      if (refresh) {
        this.getTableData()
      }
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      ids: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'ids',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'ids',
          label: 'ids',
          name: 'ID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'name',
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      varType: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'varType',
        type: 'string',
        defaultJson: {
          disabled: false,
          label: 'varType',
          name: 'Variable type',
          readonly: true,
          type: 'select',
          val: '',
          listStr: 'dashboardVarType'
        },
        jsonKey: 'valnum'
      }
    }
    this.initQueryFromPath(searchKeys)
  }
}
</script>
