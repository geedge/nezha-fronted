<template>
  <div>
    <nzDataList
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.chartTemp"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-left>
        <div id="module-type-1"  class="nz-tab-item-box" @click="clickTab([],'exprTemp')"><!--v-has="'snmp_browser_view'"-->
          <div class="nz-tab-item">{{$t("config.exprTemp.exprTemp")}}</div>
        </div>
        <div id="module-type-2"  class="nz-tab-item-box" @click="clickTab([],'chartTemp')"><!--v-has="'snmp_browser_view'"-->
          <div class="nz-tab-item nz-tab-item-active">{{$t("config.chartTemp.chartTemp")}}</div>
        </div>
      </template>
      <template v-slot:top-tool-right>
<!--        <export-excel-->
<!--          id="expression-template-list"-->
<!--          export-url="expression/tmpl/export"-->
<!--          import-url="expression/tmpl/import"-->
<!--          export-file-name="expression-template"-->
<!--          :params="searchLabel"-->
<!--          :permissions="{import: 'expressionTemplate_add', export: 'expressionTemplate_view'}"-->
<!--          @afterImport="getTableData"-->
<!--          class="top-tool-export margin-r-10"-->
<!--        >-->
<!--          <template slot="optionZone">-->
<!--          -->
<!--          </template>-->
<!--        </export-excel>-->
        <button id="expr-tmpl-list-export" v-has="'expressionTemplate_add'" :title="$t('overall.createTemplate')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>

        <delete-button :delete-objs="batchDeleteObjs" @after="getTableData"
                       id="alert-msg-batch-delete" v-has="'expressionTemplate_delete'" :api="url"></delete-button></template>
      <template  v-slot="slotProps">
        <chartTmplTable
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="(row) => {copyRow(row, 'exprTmpl')}"
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
      <chart-box :chart="object" :show-panel="showPanel" :from="'chartTemp'"  @close="closeChartBox" @delete-chart="delChart" @on-create-success="createSuccess" @on-delete-success="delChartOk" @reload="panelReload" @reloadOnlyPanel="panelReloadOnlyPanel" ref="addChartModal" v-if="rightBox.show"></chart-box>
    </transition>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import exportXLSX from '@/components/common/exportXLSX'
import chartBox from '@/components/page/dashboard/chartBox'
import deleteButton from '@/components/common/deleteButton'
import dataListMixin from '@/components/common/mixin/dataList'
import chartTmplTable from '@/components/common/table/settings/chartTmplTable'

export default {
  name: 'chartTemp',
  components: {
    chartBox,
    deleteButton,
    chartTmplTable,
    'export-excel': exportXLSX
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'visual/panel/chart',
      tableId: 'chartTemp',
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
            disabled: false
          },
          {
            name: this.$t('dashboard.panel.chartForm.varType'),
            type: 'select',
            label: 'varType',
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
        span: 12,
        height: '400',
        unit: 2,
        param: { url: '', threshold: '' },
        elements: [{ expression: '', legend: '', type: 'expert', id: '' }],
        panel: '',
        sync: '',
        remark: '',
        groupId: -1,
        panelId: 0,
        varType: 1
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
      this.rightBox.show = true
    },
    edit (u) {
      if (!u.param) {
        u.param = { url: '', threshold: '' }
      }
      this.object = JSON.parse(JSON.stringify(u))
      this.object.panelId = this.showPanel.id
      this.object.panelName = this.showPanel.name
      this.rightBox.show = true
    },
    chartBySync (row) {
      this.$post('visual/panel/chart/syncTmpl', { pid: row.id }).then(res => {
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
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox, panelId: 0, returnChildren: 0, groupId: 0 }).then(response => {
        this.tools.loading = false
        response = { msg: 'success', code: 200, data: { total: 62, pageSize: 20, pages: 4, pageNo: 1, list: [{ id: 1303, name: 'Up Time', panelId: 0, groupId: 0, span: 2, height: 2, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 30, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 500, chartId: 1303, expression: 'sum(time() - node_boot_time_seconds{project="Common",asset="{{asset.host}}"})', type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1304, name: 'Endpoint down', panelId: 0, groupId: 0, span: 2, height: 2, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 2, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 501, chartId: 1304, expression: "count(up{project!='',asset='{{asset.host}}'})-count(up{project!='',asset='{{asset.host}}'}==1)", type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1305, name: 'Maximum open file descriptors', panelId: 0, groupId: 0, span: 4, height: 2, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 1, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 502, chartId: 1305, expression: 'process_max_fds{project="Common",module="node_exporter" ,asset="{{asset.host}}"}', type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1306, name: 'Ping rrt', panelId: 0, groupId: 0, span: 2, height: 2, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 29, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 503, chartId: 1306, expression: 'nz_asset_ping{host="{{asset.host}}"}', type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1307, name: 'Memory Total', panelId: 0, groupId: 0, span: 2, height: 2, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 7, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 504, chartId: 1307, expression: 'node_memory_MemTotal_bytes{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1308, name: 'Total transmit traffic (1day)', panelId: 0, groupId: 0, span: 4, height: 3, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 7, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 505, chartId: 1308, expression: 'sum(increase(node_network_transmit_bytes_total{project="Common",asset="{{asset.host}}"}[1d]))', type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1309, name: 'Total receive traffic (1day)', panelId: 0, groupId: 0, span: 4, height: 3, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'singleStat', unit: 7, weight: 0, param: { valueMapping: { mapping: [{ text: '', value: '' }], type: 'value' }, nullType: 'connected', statistics: 'last' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 506, chartId: 1309, expression: 'sum(increase(node_network_receive_bytes_total{project="Common",asset="{{asset.host}}"}[1d]))', type: 'expert', legend: null, buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1310, name: 'CPU usage', panelId: 0, groupId: 0, span: 4, height: 3, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 4, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 507, chartId: 1310, expression: 'avg(irate(node_cpu_seconds_total{project="Common",asset="{{asset.host}}",mode="system"}[1m])) by (asset)', type: 'expert', legend: 'System', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 508, chartId: 1310, expression: 'avg(irate(node_cpu_seconds_total{project="Common",asset="{{asset.host}}",mode="user"}[1m])) by (instance)', type: 'expert', legend: 'User', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 509, chartId: 1310, expression: 'avg(irate(node_cpu_seconds_total{project="Common",asset="{{asset.host}}",mode="iowait"}[1m])) by (asset)', type: 'expert', legend: 'Iowait', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 510, chartId: 1310, expression: '1 - avg(irate(node_cpu_seconds_total{project="Common",asset="{{asset.host}}",mode="idle"}[1m])) by (asset)', type: 'expert', legend: 'Total', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1311, name: 'System load average', panelId: 0, groupId: 0, span: 4, height: 3, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 3, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 511, chartId: 1311, expression: 'node_load1{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'Load1', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 512, chartId: 1311, expression: 'node_load5{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'Load5', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 513, chartId: 1311, expression: 'node_load15{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'Load15', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1312, name: 'Notebook', panelId: 0, groupId: 0, span: 4, height: 3, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'text', unit: 2, weight: 0, param: { text: '<div  class="editor-core ql-container ql-snow"><div class="ql-editor"><h2>维修记录（Repair Record）</h2><p><br></p><ol><li>XXXX年XX月XX日 返厂维修</li><li>。。。</li></ol><p><br></p></div></div>' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: null, sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1313, name: 'Memory usage', panelId: 0, groupId: 0, span: 4, height: 3, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 3, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 514, chartId: 1313, expression: '100 - ((node_memory_MemFree_bytes\n{project="Common",asset="{{asset.host}}"}+node_memory_Cached_bytes\n{project="Common",asset="{{asset.host}}"}+node_memory_Buffers_bytes\n{project="Common",asset="{{asset.host}}"})/node_memory_MemTotal_bytes\n{project="Common",asset="{{asset.host}}"}) * 100', type: 'expert', legend: 'Memory usage', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1314, name: 'Disk usage', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 4, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 515, chartId: 1314, expression: '1-(node_filesystem_free_bytes{project="Common",asset="{{asset.host}}",fstype=~"ext4|xfs"} / node_filesystem_size_bytes{project="Common",asset="{{asset.host}}",fstype=~"ext4|xfs"})', type: 'expert', legend: '{{mountpoint}}', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1315, name: 'Disk partition free space', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'table', unit: 7, weight: 0, param: { last: 1, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, threshold: '', nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 516, chartId: 1315, expression: 'node_filesystem_avail_bytes {project="Common",asset="{{asset.host}}",fstype=~"ext4|xfs"}-0', type: 'expert', legend: 'Available : {{device}} - {{mountpoint}}', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 517, chartId: 1315, expression: 'node_filesystem_size_bytes{project="Common",asset="{{asset.host}}",fstype=~"ext4|xfs"}-0', type: 'expert', legend: 'Total : {{device}} - {{mountpoint}}', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1316, name: 'Disk read and write rate (IOPS)', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 2, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 518, chartId: 1316, expression: 'irate(node_disk_reads_completed_total{project="Common",asset="{{asset.host}}"}[30m])', type: 'expert', legend: '{{device}}_read', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 519, chartId: 1316, expression: 'irate(node_disk_writes_completed_total{project="Common",asset="{{asset.host}}"}[30m])', type: 'expert', legend: '{{device}}_write', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1317, name: 'Disk read and write speed (byte/s)', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 2, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 520, chartId: 1317, expression: 'irate(node_disk_read_bytes_total{project="Common",asset="{{asset.host}}"}[30m])', type: 'expert', legend: '{{device}}_read', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 521, chartId: 1317, expression: 'irate(node_disk_written_bytes_total{project="Common",asset="{{asset.host}}"}[30m])', type: 'expert', legend: '{{device}}_write', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1318, name: 'Time-consuming for each IO read and write', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 30, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 522, chartId: 1318, expression: 'irate(node_disk_read_time_seconds_total{project="Common",asset="{{asset.host}}"}[30m]) / irate(node_disk_reads_completed_total{project="Common",asset="{{asset.host}}"}[30m])', type: 'expert', legend: '{{device}}_read', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 523, chartId: 1318, expression: 'irate(node_disk_write_time_seconds_total{project="Common",asset="{{asset.host}}"}[30m]) / irate(node_disk_writes_completed_total{project="Common",asset="{{asset.host}}"}[30m])', type: 'expert', legend: '{{device}}_write', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1319, name: 'Network traffic', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 15, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 524, chartId: 1319, expression: "irate(node_network_receive_bytes_total{project=\"Common\",asset=\"{{asset.host}}\",device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[30m])", type: 'expert', legend: '{{device}}_receive', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 525, chartId: 1319, expression: "irate(node_network_transmit_bytes_total{project=\"Common\",asset=\"{{asset.host}}\",device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[30m])", type: 'expert', legend: '{{device}}_transmit', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1320, name: 'Network connection information', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 2, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 526, chartId: 1320, expression: 'node_netstat_Tcp_CurrEstab{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'CurrEstab', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 527, chartId: 1320, expression: 'node_sockstat_TCP_tw{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'TCP_tw', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 528, chartId: 1320, expression: 'node_sockstat_sockets_used{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'Sockets_used', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 529, chartId: 1320, expression: 'node_sockstat_UDP_inuse{project="Common",asset="{{asset.host}}"}', type: 'expert', legend: 'UDP_inuse', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1321, name: 'Network traffic drop', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 15, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 530, chartId: 1321, expression: "irate(node_network_receive_drop_total{project=\"Common\",asset=\"{{asset.host}}\",device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[30m])", type: 'expert', legend: '{{device}}_receive', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 531, chartId: 1321, expression: "irate(node_network_transmit_drop_total{project=\"Common\",asset=\"{{asset.host}}\",device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[30m])", type: 'expert', legend: '{{device}}_transmit', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }, { id: 1322, name: 'Network traffic error', panelId: 0, groupId: 0, span: 4, height: 4, updateBy: -1, updateAt: '2020-10-27 08:56:07', type: 'line', unit: 15, weight: 0, param: { last: 0, legendValue: { total: 'off', min: 'off', avg: 'off', last: 'off', max: 'off' }, valueMapping: { mapping: [{ text: '', value: '' }], type: 'text' }, nullType: 'connected' }, pid: null, buildIn: 0, remark: '', seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db', elements: [{ id: 532, chartId: 1322, expression: "irate(node_network_receive_errs_total{project=\"Common\",asset=\"{{asset.host}}\",device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[30m])", type: 'expert', legend: '{{device}}_receive', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }, { id: 533, chartId: 1322, expression: "irate(node_network_transmit_errs_total{project=\"Common\",asset=\"{{asset.host}}\",device!~'tap.*|veth.*|br.*|docker.*|virbr*|lo*'}[30m])", type: 'expert', legend: '{{device}}_transmit', buildIn: 0, seq: '7aac254f-b6ff-4123-99c4-92fcdcc0d2db' }], sync: null, panel: { id: 0, name: null, createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null }, group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null }, children: null, chartNums: null, asset: null, varType: 1, varId: null, varName: null }] }, time: '2021-06-01 06:55:01' }
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
            if (response.data.list[i].type === 'group') {
              response.data.list[i].children = []
            }
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
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
  }
}
</script>
