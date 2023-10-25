<template>
  <div class="full-width-height">
   <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :api="url"
      :tableId="tableId"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab="targetTab"
      @search="search"
      @changeTab="changeTab"
      class="full-width-height"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
        <endpoint-table
          ref="dataTable"
          :orderByFa="'id'"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :endpointTab="true"
          class="bottom-box__top"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @addSilence="addSilence"
          @reload="getTableData"
          @topology="topology"
          @metricTarget="metricTarget"
          @selectionChange="selectionChange"
        ></endpoint-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <transition name="right-box">
      <edit-endpoint-box-new v-if="rightBox.editShow" :module="object" @close="closeRightEditBox" :disabled="true" :optionType="'edit'"></edit-endpoint-box-new>
    </transition>
    <transition name="right-box">
      <edit-endpoint-box-new v-if="rightBox.show" :module="object" @close="closeRightEditBox" :disabled="false" :optionType="'add'"></edit-endpoint-box-new>
    </transition>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box></transition>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import endpointTable from '@/components/common/table/settings/endpointTable'
import EditEndpointBoxNew from '@/components/common/rightBox/editEndpointBoxNew'
import { fromRoute } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'endpointTabNew',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    endpointTable,
    EditEndpointBoxNew,
    alertSilenceBox
  },
  watch: {
    obj: {
      immediate: true,
      async handler (n) {
        if (n) {
          this.searchLabel = {}
          await this.getPreference()
          this.getTableData()
        }
      }
    }
  },
  data () {
    return {
      url: 'monitor/endpoint',
      tableId: 'endpointTab', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 13,
          name: this.$t('project.endpoint.endpointId'),
          type: 'input',
          label: 'ids',
          disabled: false
        },
        {
          id: 12,
          name: this.$t('project.endpoint.endpointName'),
          type: 'input',
          label: 'name',
          disabled: false
        }
        ]
      },
      blankSilenceObject: {
        startAt: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      nowTime: '',
      rightBox: {
        editShow: false,
        show: false
      },
      fromBottom: true,
      needAlertDaysData: true,
      trendKey: 'endpointId'
    }
  },
  methods: {
    getTableData () {
      this.tools.loading = true
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      const params = {
        ...this.searchLabel,
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      if (this.from === fromRoute.module) {
        params.moduleIds = this.obj.id
      } else if (this.from === fromRoute.asset) {
        params.assetIds = this.obj.id
      } else if (this.from === fromRoute.softwareAsset) {
        params.softwareAssetIds = this.obj.id
      }
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].configs.forEach(item => {
              item.config = JSON.parse(item.config)
            })
          }
          if (this.needAlertDaysData) {
            response.data.list.forEach(item => {
              item.trendLoading = true
              item.left = 0
              item.top = 0
              item.alertNumtooltipShow = false
              item.alertDaysData = [
                {
                  metric: { priority: 'P1' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P2' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P3' },
                  values: [[0, 0]]
                }
              ]
            })
          }
          this.tableData = response.data.list
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
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
    edit (row, copyFlag) {
      this.$get('monitor/endpoint/' + row.id).then(res => {
        this.object = JSON.parse(JSON.stringify(res.data))
        if (copyFlag) {
          this.object.id = ''
          this.object.name = this.object.name + '-copy'
          if (this.object.name.length > 64) {
            const length = this.object.name.length - 64
            this.object.name = row.name.substring(0, row.name.length - length) + '-copy'
          }
        }
        this.object.configs.forEach(item => {
          item.config = JSON.parse(item.config)
        })
        this.object.paramObj = []
        this.object.labelModule = []
        if (!this.object.configs[0].config.relabel_config) {
          this.object.configs[0].config.relabel_config = []
        }
        this.object.configs[0].config.relabel_config && this.object.configs[0].config.relabel_config.forEach(item => {
          item.showAllRelabelOption = false
          item.tags = ''
        })
        this.object.configs[1].config.forEach(item => {
          item.labelModule = []
          if (JSON.stringify(item.labels) !== '{}' && item.labels) {
            Object.keys(item.labels).forEach(key => {
              item.labelModule.push({ key, value: item.labels[key] })
            })
          } else {
            item.labelModule.push({ key: '', value: '' })
          }
          item.pipeline && item.pipeline.forEach((pipeline) => {
            if (pipeline.type === 'labels') {
              const labelsArr = []
              if (JSON.stringify(pipeline.labels) !== '{}' && pipeline.labels) {
                Object.keys(pipeline.labels).forEach(key => {
                  labelsArr.push({ key, value: pipeline.labels[key] })
                })
              } else {
                labelsArr.push({ key: '', value: '' })
              }
              pipeline.labels = labelsArr
            }
            if (pipeline.type === 'json') {
              const expressionsArr = []
              if (JSON.stringify(pipeline.expressions) !== '{}' && pipeline.expressions) {
                Object.keys(pipeline.expressions).forEach(key => {
                  expressionsArr.push({ key, value: pipeline.expressions[key] })
                })
              } else {
                expressionsArr.push({ key: '', value: '' })
              }
              pipeline.expressions = expressionsArr
            }
          })
          if (item.type === 'file') {
            item.unit = ''
            item.appName = ''
            item.listenAddress = ''
          } else if (item.type === 'journal') {
            item.fileName = ''
            item.appName = ''
            item.listenAddress = ''
          } else if (item.type === 'syslog') {
            item.fileName = ''
            item.unit = ''
          }
        })
        if (JSON.stringify(this.object.configs[0].config.labels) !== '{}' && this.object.configs[0].config.labels) {
          Object.keys(this.object.configs[0].config.labels).forEach(key => {
            this.object.labelModule.push({ key, value: this.object.configs[0].config.labels[key] })
          })
        } else {
          this.object.labelModule.push({ key: '', value: '' })
        }
        if (JSON.stringify(this.object.configs[0].config.params) !== '{}' && this.object.configs[0].config.params) {
          Object.keys(this.object.configs[0].config.params).forEach(key => {
            this.object.paramObj.push({ key, value: this.object.configs[0].config.params[key] })
          })
        } else {
          this.object.paramObj.push({ key: '', value: [] })
        }
        this.object.assetName = this.object.asset ? this.object.asset.name : ''
        this.object.softwareAssetName = this.object.softwareAsset ? this.object.softwareAsset.name : ''
        this.object.assetId = this.object.asset ? this.object.asset.id + '' : ''
        this.object.softwareAssetId = this.object.softwareAsset ? this.object.softwareAsset.id + '' : ''
        this.object.projectId = this.object.project.id
        this.object.moduleId = this.object.module.id
        this.object.type = this.object.module.type
        if (copyFlag) {
          this.rightBox.show = true
        } else {
          this.rightBox.editShow = true
        }
      })
    },
    copy (row) {
      this.edit(row, true)
    },
    closeRightEditBox (refresh) {
      this.rightBox.editShow = false
      this.rightBox.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    }
  }
}
</script>
