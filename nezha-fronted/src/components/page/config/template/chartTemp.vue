<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.chartTemp"
      :search-msg="searchMsg">
      <template v-slot:top-tool-left>
        <div id="module-type-1"  class="nz-tab-item-box" @click="clickTab([],'exprTemp')"><!--v-has="'snmp_browser_view'"-->
          <div class="nz-tab-item">{{$t("config.exprTemp.exprTemp")}}</div>
        </div>
        <div id="module-type-2"  class="nz-tab-item-box" @click="clickTab([],'chartTemp')"><!--v-has="'snmp_browser_view'"-->
          <div class="nz-tab-item nz-tab-item-active">{{$t("config.chartTemp.chartTemp")}}</div>
        </div>
      </template>
      <template v-slot:top-tool-right>
        <export-excel
          id="expression-template-list"
          export-url="expression/tmpl/export"
          import-url="expression/tmpl/import"
          export-file-name="expression-template"
          :params="searchLabel"
          :permissions="{import: 'expressionTemplate_add', export: 'expressionTemplate_view'}"
          @afterImport="getTableData"
          class="top-tool-export margin-r-10"
        >
          <template slot="optionZone">
            <button id="expr-tmpl-list-export" v-has="'expressionTemplate_add'" :title="$t('overall.createTemplate')" class="top-tool-btn"
                    type="button" @click="add">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
          </template>
        </export-excel>

        <delete-button :delete-objs="batchDeleteObjs" @after="getTableData"
                       id="alert-msg-batch-delete" v-has="'expressionTemplate_delete'" :api="url"></delete-button></template>
      <template  v-slot="slotProps">
        <chartTmplTable
          ref="dataTable"
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="(row) => {copyRow(row, 'exprTmpl')}"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></chartTmplTable>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <chart-box :chart="object" :show-panel="showPanel" :from="'temp'"  @close="closeChartBox" @delete-chart="delChart" @on-create-success="createSuccess" @on-delete-success="delChartOk" @reload="panelReload" @reloadOnlyPanel="panelReloadOnlyPanel" ref="addChartModal" v-if="rightBox.show"></chart-box>
    </transition>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import exportXLSX from '@/components/common/exportXLSX'
import chartBox from '@/components/page/dashboard/chartBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import chartTmplTable from '@/components/common/table/settings/chartTmplTable'

export default {
  name: 'chartTemp',
  components: {
    chartBox,
    deleteButton,
    nzDataList,
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
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox, panelId: 0, returnChildren: 0 }).then(response => {
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
