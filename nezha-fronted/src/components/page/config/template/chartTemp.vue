<template>
  <div>
    <nzDataList
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.chartTemp"
      :search-msg="searchMsg"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="expr-tmpl-list-export" v-has="'expressionTemplate_add'" :title="$t('overall.createTemplate')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="expression-template-list"
          export-url="/visual/panel/export"
          import-url="/visual/panel/import"
          export-file-name="chart-temp"
          :params="searchLabel"
          :params2="{
            panelId:0,
            returnChildren: 0,
            groupId: 0
          }"
          :paramsType="'template'"
          :permissions="{import: 'expressionTemplate_add', export: 'expressionTemplate_edit'}"
          class="top-tool-export margin-r-10"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'chartTemp'"
                  :forceDeleteShow="false"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  id="alert-msg-batch-delete"
                  v-has="'expressionTemplate_delete'"
                  :api="url"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template  v-slot="slotProps">
        <chartTmplTable
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></chartTmplTable>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nzDataList>
    <transition name="right-box">
<!--      <chart-box-->
<!--        :chart="object"-->
<!--        :show-panel="showPanel"-->
<!--        :from="'chartTemp'"-->
<!--        @close="closeChartBox"-->
<!--        @delete-chart="delChart"-->
<!--        @on-create-success="createSuccess"-->
<!--        @on-delete-success="delChartOk"-->
<!--        @reload="panelReload"-->
<!--        @reloadOnlyPanel="panelReloadOnlyPanel"-->
<!--        ref="addChartModal"-->
<!--        v-if="rightBox.show"></chart-box>-->
      <chart-right-box
        v-if="rightBox.show"
        v-my-loading="rightBox.loading"
        ref="addChartModal"
        :chart="object"
        :from="'chartTemp'"
        :show-panel="showPanel"
        @close="closeChartBox"
        @reload="panelReload"
        @reloadOnlyPanel="panelReloadOnlyPanel"
        @delete-chart="delChart"
        @on-create-success="createSuccess"
        @on-delete-success="delChartOk"
      ></chart-right-box>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import dataListMixin from '@/components/common/mixin/dataList'
import chartTmplTable from '@/components/common/table/settings/chartTmplTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'

export default {
  name: 'chartTemp',
  components: {
    deleteButton,
    chartTmplTable,
    topToolMoreOptions,
    chartRightBox
  },
  mixins: [dataListMixin, routerPathParams],
  props: {
    switchTab: String
  },
  data () {
    return {
      url: 'visual/panel/chart',
      tableId: 'chartTemp',
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
            name: this.$t('overall.type'),
            type: 'selectString',
            label: 'chartType',
            readonly: true,
            disabled: false
          },
          {
            name: this.$t('dashboard.panel.chartForm.varType'),
            type: 'select',
            label: 'varType',
            readonly: true,
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
        type: 'line',
        span: 4,
        datasource: 'metrics',
        varType: 1,
        height: 4,
        unit: 2,
        param: {
          stack: 0,
          nullType: 'null',
          legend: { placement: 'bottom', values: [], show: true },
          enable: {
            legend: true,
            valueMapping: false,
            thresholds: false
          },
          thresholdShow: true,
          thresholds: [{ value: undefined, color: randomcolor() }]
        },
        elements: [{ expression: '', legend: '', type: 'expert', id: '', name: 'A', state: 1 }],
        panel: '',
        sync: 0,
        remark: '',
        groupId: ''
      },
      showPanel: {
        name: 'template',
        id: 0
      },
      nowTime: ''
    }
  },
  mounted () {

  },
  methods: {
    add () {
      this.object = this.newObject()
      this.object.panelId = 0
      this.object.panelName = 'template'
      this.object.param.thresholds = [{ value: undefined, color: randomcolor() }]
      this.rightBox.show = true
    },
    edit (data, copy) {
      if (copy) {
        this.object = JSON.parse(JSON.stringify(data))
        this.object.x = 0
        this.object.y = 0
        this.object.panelId = this.showPanel.id
        this.object.panelName = this.showPanel.name
        this.object.id = ''
        this.object.elements.forEach((item) => {
          item.id = ''
          item.chartId = ''
          delete item.seq
        })
        if (this.object.datasource !== 'metrics' && this.object.datasource !== 'log') {
          delete this.object.elements
        }
        if (!this.object.groupId || this.object.groupId == -1) {
          this.object.groupId = ''
        }
        this.rightBox.show = true
      } else {
        this.object = {}
        this.rightBox.show = true
        this.rightBox.loading = true
        this.$get('visual/panel/chart/' + data.id).then(res => {
          this.rightBox.loading = false
          if (res.code === 200) {
            const chartData = res.data
            this.object = JSON.parse(JSON.stringify(chartData))
            this.object.panelId = this.showPanel.id
            this.object.panelName = this.showPanel.name
            this.object.param = JSON.parse(this.object.param)
            if (!this.object.groupId || this.object.groupId == -1) {
              this.object.groupId = ''
            }
            if (this.object.type == 'table') {
              const arr = this.object.param.indexs ? this.object.param.indexs.split(',') : []
              this.object.param.tags = arr.map((item) => {
                return {
                  text: item,
                  tiClasses: ['ti-valid']
                }
              })
            }
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    copy (u, copyParams) {
      const copyName = this.$loadsh.get(copyParams, 'copyName', '-copy')
      this.object = { ...u, name: u.name + copyName, id: '' }
      if (this.object.name.length > 64) {
        const length = this.object.name.length - 64
        this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
      }
      if (this.object.type !== 'group' && this.object.elements) {
        this.object.elements = this.object.elements.map(item => {
          item.id = ''
          return item
        })
      }

      this.rightBox.show = true
    },
    chartBySync (row) {
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
      this.updatePath({ ...this.searchLabel, ...this.searchCheckBox, switchTab: this.switchTab })
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox, panelId: 0, returnChildren: 0, groupId: 0 }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
            if (response.data.list[i].type === 'group') {
              response.data.list[i].children = []
            }
          }
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
    closeChartBox (refresh) {
      this.rightBox.show = false
      this.chart = {}
      if (refresh) {
        this.getTableData()
      }
    },
    delChart () {

    },
    createSuccess () {
      this.rightBox.show = false
      this.getTableData()
    },
    delChartOk () {
      this.rightBox.show = false
    },
    panelReload () {},
    panelReloadOnlyPanel () {}
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
      type: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'type',
        type: 'string',
        defaultJson: {
          disabled: false,
          label: 'chartType',
          name: 'Type',
          readonly: true,
          type: 'selectString',
          val: ''
        },
        jsonKey: 'val'
      },
      state: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'state',
        type: 'string',
        defaultJson: {
          disabled: false,
          label: 'varType',
          name: 'Variable type',
          readonly: true,
          type: 'select',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
  }
}
</script>
