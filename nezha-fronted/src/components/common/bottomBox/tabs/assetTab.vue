<template>
  <div>
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :targetTab.sync="targetTab"
      :api="url"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tableId="tableId"
      :tabs="tabs"
      @search="search"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
        <asset-table
          ref="dataTable"
          :api="url"
          :orderByFa="'id'"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :table-data="tableData"
          :assetTab="true"
          @del="del"
          @edit="edit"
          @cli="cli"
          @duplicate="duplicate"
          @addSilence="addSilence"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @topology="topology"
          @selectionChange="selectionChange"
          ></asset-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <transition name="right-box">
      <asset-box v-if="rightBox.show"
                 ref="assetBox"
                 :brand-data="brandData"
                 :dc-data="obj"
                 :field-group-data="fieldGroupData"
                 :from="fromRoute.asset"
                 :obj="object"
                 :snmp-credential-data="snmpCredentialData"
                 :state-data="stateData"
                 :type-data="typeData"
                 @close="closeRightBox"
                 @refresh="getTableData"></asset-box>
    </transition>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box></transition>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import assetTable from '@/components/common/table/asset/assetTable'
import assetBox from '@/components/common/rightBox/asset/assetBox'
import { fromRoute } from '@/components/common/js/constants'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'assetTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    assetTable,
    assetBox,
    alertSilenceBox
  },
  data () {
    return {
      url: '/asset/asset',
      tableId: 'assetTabTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
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
          name: 'SN',
          type: 'input',
          label: 'sn',
          disabled: false
        }, {
          name: 'IP',
          type: 'input',
          label: 'manageIp',
          disabled: false
        }, {
          name: this.$t('overall.state'),
          type: 'assetState',
          label: 'assetState',
          id: 'stateIds',
          readonly: true,
          disabled: false
        }]
      },
      blankSilenceObject: {
        startAt: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      searchLabel: { dcIds: this.obj.id },
      brandData: [],
      modelData: [],
      stateData: [],
      typeData: [],
      dcData: [],
      snmpCredentialData: [],
      fieldGroupData: [],
      needAlertDaysData: true,
      trendKey: 'assetId'
    }
  },
  methods: {
    duplicate (row) {
      this.$get(`${this.url}/${row.id}`).then(response => {
        if (response.code === 200) {
          this.object = { ...response.data, id: '', name: `${row.name}-copy` }
          if (this.object.name.length > 64) {
            const length = this.object.name.length - 64
            this.object.name = row.name.substring(0, row.name.length - length) + '-copy'
          }
          this.rightBox.show = true
        }
      })
    },
    getStateData () {
      return new Promise(resolve => {
        this.$get('asset/stateConf').then(response => {
          if (response.code === 200) {
            this.stateData = response.data.list
          }
          resolve()
        })
      })
    },
    getTypeData () {
      return new Promise(resolve => {
        this.$get('asset/typeConf/tree').then(response => {
          if (response.code === 200) {
            this.typeData = response.data.list
          }
          resolve()
        })
      })
    },
    getDcData () {
      return new Promise(resolve => {
        this.$get('dc', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list
          }
          resolve()
        })
      })
    },
    getSnmpCredentialData () {
      return new Promise(resolve => {
        this.$get('snmp/credential', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.snmpCredentialData = response.data.list
          }
          resolve()
        })
      })
    },
    getFieldGroupData () {
      return new Promise(resolve => {
        this.$get('asset/field/group', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.fieldGroupData = response.data.list
          }
          resolve()
        })
      })
    },
    getBrandData () {
      return new Promise(resolve => {
        this.$get('asset/brand').then(response => {
          if (response.code === 200) {
            this.brandData = response.data.list
          }
          resolve()
        })
      })
    },
    getModelData (brandId) {
      return new Promise(resolve => {
        this.$get('asset/model').then(response => {
          if (response.code === 200) {
            this.modelData = response.data.list
          }
          resolve()
        })
      })
    },
    cli (row) {
      const consoleParam = {
        id: row.id,
        host: row.manageIp,
        port: row.authProtocolPort
      }
      this.$store.commit('addConsole', consoleParam)
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
      if (this.from === fromRoute.model) {
        this.$set(this.searchLabel, 'modelIds', this.obj.id)
      } else if (this.from === fromRoute.dc) {
        this.$set(this.searchLabel, 'dcIds', this.obj.id)
      }
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
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
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.searchLabel = {}
        this.searchLabel.dcIds = n.id
        if (this.from === fromRoute.model) {
          delete this.searchLabel.dcIds
          this.searchLabel.modelIds = n.id
        }
        if (this.from === fromRoute.asset) {
          delete this.searchLabel.dcIds
          this.searchLabel.pids = n.id
        }
        this.getTableData()
      }
    }
  },
  mounted () {
    this.getBrandData()
    this.getStateData()
    this.getTypeData()
    this.getDcData()
    this.getSnmpCredentialData()
    this.getFieldGroupData()
  }
}
</script>
