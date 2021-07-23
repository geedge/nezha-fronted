<template>
  <div class="full-width-height">
    <nz-bottom-data-list
      :api="url"
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
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :endpointTab="true"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @addSilence="addSilence"
          @reload="getTableData"
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

export default {
  name: 'terminalLogTab',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    endpointTable,
    EditEndpointBoxNew,
    alertSilenceBox
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
        if (n) {
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
      fromBottom: true
    }
  },
  methods: {
    getTableData () {
      const params = {
        ...this.searchLabel,
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize
      }
      if (this.from === fromRoute.module) {
        params.moduleIds = this.obj.id
      } else if (this.from === fromRoute.asset) {
        params.assetIds = this.obj.id
      }
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
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
    edit (row) {
      this.$get('monitor/endpoint/' + row.id).then(res => {
        const u = res.data
        this.object = JSON.parse(JSON.stringify(u))
        this.object.configs = JSON.parse(this.object.configs)
        this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
        this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : 9100
        this.object.paramObj = []
        this.object.labelModule = []
        if (JSON.stringify(this.object.configs.labels) !== '{}' && this.object.configs.labels) {
          Object.keys(this.object.configs.labels).forEach(key => {
            this.object.labelModule.push({ key, value: this.object.configs.labels[key] })
          })
        } else {
          this.object.labelModule.push({ key: '', value: '' })
        }
        if (JSON.stringify(this.object.configs.params) !== '{}' && this.object.configs.params) {
          Object.keys(this.object.configs.params).forEach(key => {
            this.object.paramObj.push({ key, value: this.object.configs.params[key] })
          })
        } else {
          this.object.paramObj.push({ key: '', value: [] })
        }
        this.object.assetName = this.object.asset ? this.object.asset.name : ''
        this.object.projectId = this.object.project.id
        this.object.moduleId = this.object.module.id
        this.object.type = this.object.module.type
        this.rightBox.editShow = true
      })
    },
    closeRightEditBox (refresh) {
      this.rightBox.editShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    }
  }
}
</script>
<style scoped>
  .full-width-height{
    width: 100%;
    height: 100%;
  }
</style>
