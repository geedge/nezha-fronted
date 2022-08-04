<template>
  <div>
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list'"
      :api="url"
      ref="detailList"
      :layout="dataListLayout"
      :from="fromRoute.asset"
      :search-msg="searchMsg"
      :detailType="detailType"
      :detailViewRightObj="detailViewRightObj"
      :dataLength="tableData.length"
      @search="search"
      @changeDetailType="changeDetailType"
    >
      <template v-slot:top-tool-left>
        <detailViewTopSearch :selectValue.sync="selectValue" :detailSearchList="detailSearchList" @reload="reloadTable" />
      </template>
      <template v-slot:top-tool-right>
        <button id="asset-create-asset" v-has="'asset_add'" :title="$t('asset.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{
                  import: 'asset_add',
                  export: 'asset_edit'
                }"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="asset"
          export-url="/asset/asset/export"
          import-url="/asset/asset/import"
          @afterImport="getTableData"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:nz-detail-view-list>
        <asset-detail
          class="data-detail"
          ref="dataDetail"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :detailViewRightObj="detailViewRightObj"
          :api="url"
          :table-data="tableData"
          @detailViewRightShow = 'detailViewRightShow'
          @orderDetail="orderDetail"
        >
        </asset-detail>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <el-pagination
          @current-change="pageNo"
          :current-page.sync="pageObj.pageNo"
          :page-size="20"
          :total="pageObj.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input-number ref="jumpInput" v-model="pageObj.pageNo" :controls="false" :min="1" :max="pageObj.pages" class="jump-input" @change="getTableData" @keyup.enter.native="getTableData" size="mini"/>
            <span class="jump-pages">/&nbsp{{pageObj.pages}}</span>
          </template>
        </el-pagination>
      </template>
    </nzDetailView>
    <nz-data-list
      v-my-loading="detailViewLoading"
      v-if="detailType === 'list'"
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.asset"
      :layout="dataListLayout"
      :search-msg="searchMsg"
      :nz-table-height-offset="assetNzTableHeightOffset"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="asset-filter" :class="{ 'is-focus': dataListLayout.indexOf('clickSearch') > -1 }" class="top-tool-btn margin-r-10" @click.stop="showClickSearch" :title="$t('dashboard.panel.chartForm.filter')">
          <i class="nz-icon nz-icon-funnel"></i>
        </button>
        <button id="asset-create-asset" v-has="'asset_add'" :title="$t('asset.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{
                  import: 'asset_add',
                  export: 'asset_edit'
                }"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="asset"
          export-url="/asset/asset/export"
          import-url="/asset/asset/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item>
                <div id="asset-batch-asset" v-has="'asset_edit'" @click="batchEdit"><i class="nz-icon nz-icon-batch-edit"></i>{{$t('overall.batchEdit')}}</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <delete-button :type="'link'" :title="$t('overall.batchDel')" id="asset-list-batch-delete" v-has="'asset_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:search >
        <click-search ref="clickSearch" :select-value.sync="selectValue" :title-search-list="titleSearchList" @reload="reloadTable"/>
      </template>
      <template v-slot:default="slotProps">
        <asset-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @cli="cli"
          @del="del"
          @edit="edit"
          @duplicate="duplicate"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @addSilence="addSilence"
          @topology="topology"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></asset-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <asset-box v-if="rightBox.show"
                 ref="assetBox"
                 :dc-data="dcData"
                 :field-group-data="fieldGroupData"
                 :from="fromRoute.asset"
                 :obj="object"
                 :snmp-credential-data="snmpCredentialData"
                 :state-data="stateData"
                 :type-data="typeData"
                 @close="closeRightBox"
                 @refresh="getTableData"></asset-box>
    </transition>
    <transition name="right-box">
      <asset-batch-edit-box v-if="rightBox.batchShow"
                            :field-group-data="fieldGroupData"
                            :snmp-credential-data="snmpCredentialData"
                            :state-data="stateData"
                            @close="closeRightBox"
                            @refresh="getTableData"></asset-batch-edit-box>
    </transition>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import assetBox from '@/components/common/rightBox/asset/assetBox'
import assetBatchEditBox from '@/components/common/rightBox/asset/assetBatchEditBox'
import nzDataList from '@/components/common/table/nzDataList'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import dataListMixin from '@/components/common/mixin/dataList'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import assetTable from '@/components/common/table/asset/assetTable'
import assetDetail from '@/components/common/detailView/list/asset/assetDetail'
import clickSearch from '@/components/common/labelFilter/clickSearch'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import lodash from 'lodash'

export default {
  name: 'asset',
  components: {
    deleteButton,
    assetBox,
    nzDataList,
    assetBatchEditBox,
    assetTable,
    clickSearch,
    topToolMoreOptions,
    alertSilenceBox,
    nzDetailView,
    assetDetail,
    detailViewTopSearch
  },
  mixins: [dataListMixin, detailViewMixin, routerPathParams],
  data () {
    return {
      url: 'asset/asset',
      from: 'asset',
      filter: {},
      // 侧滑
      rightBox: {
        batchShow: false
      },
      silenceBoxShow: false,
      dataListLayout: localStorage.getItem('dataList-layout' + 'assetTable') ? JSON.parse(localStorage.getItem('dataList-layout' + 'assetTable')) : ['searchInput', 'elementSet', 'clickSearch', 'pagination', 'detailViewSet'],
      assetNzTableHeightOffset: 283, // 包含click-search时nz-table的高度
      blankObject: {
        id: '',
        name: '',
        pid: '',
        sn: '',
        manageIp: '',
        stateId: 2,
        purchaseDate: null,
        dcId: '',
        cabinetId: '',
        brandId: '',
        brand: { id: '', name: '' },
        modelId: '',
        model: { id: '', name: '' },
        type: { name: '', id: '' },
        number: '',
        brandAndModel: [],
        typeId: '',
        snmpCredentialId: '',
        clientPort: '10092',
        clientToken: '',
        authProtocolPort: '',
        authType: '',
        authUsername: '',
        authPin: '',
        authPriKey: '',
        authUserTip: '',
        authPinTip: '',
        fields: [],
        accounts: []
      },
      blankSilenceObject: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        type: 'asset',
        linkId: '',
        remark: '',
        time: [],
        matchers: [
          { name: '', value: '', regex: 0 }
        ],
        name: ''
      },
      objectSilence: {},
      tableId: 'assetTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [{
          id: 'ids',
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          id: 'name',
          disabled: false
        }, {
          name: 'SN',
          type: 'input',
          label: 'sn',
          id: 'sn',
          disabled: false
        }, {
          name: 'IP',
          type: 'input',
          label: 'manageIp',
          id: 'manageIp',
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

      modelData: [],
      stateData: [],
      typeData: [],
      dcData: [],
      snmpCredentialData: [],
      fieldGroupData: [],
      titleSearchList: {
        dc: {
          label: this.$t('overall.dc'),
          key: 'dcIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        type: {
          label: this.$t('overall.type'),
          key: 'typeIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        ping: {
          label: 'Ping',
          key: 'ping',
          type: 'checkBox',
          children: [
            { key: 'Down', value: 0, name: 'Down' },
            { key: 'Up', value: 1, name: 'Up' }
          ],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        model: {
          label: this.$t('asset.model'),
          key: 'modelIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        assetLabel: {
          label: this.$t('overall.more'),
          key: 'fields',
          type: 'dropdownCheckBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        }
      },
      selectValue: {
        dcIds: [],
        typeIds: [],
        ping: [],
        modelIds: [],
        fields: '',
        modelIdsDetail: [],
        fieldsDetail: []
      },
      detailSearchList: {
        dc: {
          label: this.$t('overall.dc'),
          key: 'dcIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          dropShow: false,
          width: 0,
          index: -1
        },
        type: {
          label: this.$t('overall.type'),
          key: 'typeIds',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          dropShow: false,
          width: 0,
          index: -1
        },
        ping: {
          label: 'Ping',
          key: 'ping',
          type: 'checkBox',
          children: [
            { key: 'Down', id: 0, name: 'Down' },
            { key: 'Up', id: 1, name: 'Up' }
          ],
          show: false,
          showMore: false,
          dropShow: false,
          width: 0,
          index: -1
        },
        model: {
          label: this.$t('asset.model'),
          key: 'modelIdsDetail',
          type: 'checkBox',
          children: [],
          show: false,
          showMore: false,
          dropShow: false,
          width: 0,
          index: -1
        },
        assetLabel: {
          label: this.$t('overall.more'),
          key: 'fieldsDetail',
          type: 'dropdownCheckBox',
          children: [],
          show: false,
          showMore: false,
          dropShow: false,
          width: 0,
          index: -1
        }
      },
      timer: '',
      needAlertDaysData: true,
      trendKey: 'assetId'
    }
  },
  methods: {
    cli (row) {
      const consoleParam = {
        id: row.id,
        host: row.manageIp,
        port: row.authProtocolPort
      }
      this.$store.commit('addConsole', consoleParam)
    },
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
        this.$get('asset/stateConf?pageSize=-1').then(response => {
          if (response.code === 200) {
            this.stateData = response.data.list
          }
          resolve()
        })
      })
    },
    getTypeData () {
      return new Promise(resolve => {
        this.$get('asset/typeConf?pageSize=-1').then(response => {
          if (response.code === 200) {
            resolve(response.data.list.map(d => { return { ...d, value: d.id } }))
            // this.titleSearchList.type.children = response.data.list.map(d => { return { ...d, value: d.id } })
            // this.detailSearchList.type.children = response.data.list.map(d => { return { ...d, value: d.id } })
          }
          resolve()
        })
      })
    },
    getTypeTreeData () {
      return new Promise(resolve => {
        this.$get('asset/typeConf/tree').then(response => {
          if (response.code === 200) {
            this.typeData = response.data.list
          }
          resolve()
        })
      })
    },
    reloadTable (obj) {
      this.pageObj.pageNo = 1
      const params = JSON.parse(JSON.stringify(obj))
      if (this.detailType === 'view') {
        const obj = {}
        params.modelIds = params.modelIdsDetail
        params.fieldsDetail.forEach(item => {
          const arr = item.split('-')
          if (obj[arr[0]]) {
            obj[arr[0]].push(arr[1])
          } else {
            obj[arr[0]] = [arr[1]]
          }
        })
        params.fields = JSON.stringify(obj)
        if (params.fields === '{}') {
          params.fields = ''
        }
        delete params.modelIdsDetail
        delete params.fieldsDetail
      }
      Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string') {
          this.searchCheckBox[key] = params[key] ? params[key] : null
        } else {
          params[key] && params[key].length > 0 ? this.searchCheckBox[key] = params[key].join(',') : this.searchCheckBox[key] = null
        }
      })
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
          this.scrollbarToTop()
        }, 1000)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.getTableData()
          clearTimeout(this.timer)
          this.timer = ''
          this.scrollbarToTop()
        }, 1000)
      }
    },
    scrollbarToTop () {
      this.$nextTick(() => {
        const wraps = document.querySelectorAll('.el-table__body-wrapper')
        wraps.forEach(wrap => {
          if (wrap) {
            wrap.scrollTop = 0
            wrap.scrollLeft = 0
          }
        })
      })
    },
    getDcData () {
      return new Promise(resolve => {
        this.$get('dc', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list
            resolve(response.data.list.map(d => { return { ...d, value: d.id } }))
            // this.titleSearchList.dc.children = response.data.list.map(d => { return { ...d, value: d.id } })
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
    getSearchableMetaData (metaData) {
      return new Promise(resolve => {
        this.$get('asset/field/meta', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            const data = []
            const searchableData = response.data.list.filter(d => d.search === 1)
            const showData = response.data.list.filter(d => d.display === 1).map(item => {
              return { label: item.name, prop: item.name, show: false, allowed: true, type: 'label' }
            })
            searchableData.forEach(m => {
              if (m.param) {
                const param = JSON.parse(m.param)
                if (param.items) {
                  // param.items.map(p => { return { ...p, id: p.name, metaId: m.id, num: metaData.find(meta => meta.id === m.id && meta.option === p.name).num } })
                  data.push({
                    ...m,
                    children: param.items.map(p => {
                      const metaFind = metaData.find(meta => meta.id === m.id && meta.option === p.name)
                      return {
                        ...p,
                        id: p.name,
                        name: p.name,
                        metaId: m.id,
                        num: metaFind ? metaFind.num : 0
                      }
                    })
                  })
                }
              }
            })
            // this.titleSearchList.assetLabel.children = data
            resolve(data)
            setTimeout(() => {
              const title = this.tools.customTableTitle
              if (!this.$refs.dataTable && !this.$refs.dataDetail) {
                return
              }
              const tableTitle = this.$refs.dataTable ? this.$refs.dataTable.tableTitle : this.$refs.dataDetail.tableTitle
              const originalTitle = title.slice(0, tableTitle.length) // 原title
              const oldLabelTitle = title.slice(tableTitle.length, title.length) // 旧labelTitle

              const newLabel = showData.filter(item => { return !oldLabelTitle.find(t => { return item.label === t.label }) })
              const keepLabel = oldLabelTitle.filter(item => showData.find(t => item.label === t.label))

              let result = originalTitle.concat([{ label: this.$t('overall.labels'), show: false, NotSet: true, type: 'title', prop: 'table-label' }])

              result = result.concat(keepLabel).concat(newLabel)
              this.tools.customTableTitle = JSON.parse(JSON.stringify(result))
            }, 200)
          }
          resolve()
        })
      })
    },
    getModelData (data) {
      return new Promise(resolve => {
        // this.$get('asset/model?pageSize=-1').then(response => {
        if (data) {
          this.modelData = data
          const arr = []
          // const titleSearchData = {}
          this.modelData.forEach(m => {
            m.value = []
            arr.push({ ...m, name: m.brand.name + '/' + m.name, value: m.id, num: m.num })
            // if (titleSearchData[m.brand.name]) {
            //   titleSearchData[m.brand.name].children.push(m)
            // } else {
            //   titleSearchData[m.brand.name] = { ...m.brand, children: [m] }
            // }
          })
          // resolve(Object.keys(titleSearchData).map(b => titleSearchData[b]))
          resolve(arr)
          // this.titleSearchList.model.children = Object.keys(titleSearchData).map(b => titleSearchData[b])
        }
        resolve()
        // })
      })
    },
    showEndpoint (asset) {
      if (!this.hasButton('asset_endpoint_view')) {
        return
      }
      this.bottomBox.asset = Object.assign({}, asset)
      this.bottomBox.targetTab = 'endpoint'
      this.bottomBox.showSubList = true
    },

    batchEdit () {
      this.rightBox.batchShow = true
    },
    closeRightBox (refresh) {
      this.rightBox.show = false
      this.rightBox.batchShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    getPrincipalName (data) {
      for (const item in this.userData) {
        if (this.userData[item].userId === data) {
          return this.userData[item].username
        }
      }
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
      if (this.$route.path === '/asset' && this.titleSearchList) {
        this.$set(this.searchLabel, 'statistics', 1)
      }/* else {
        delete this.searchLabel.statistics
      } */
      this.tools.loading = true
      const assetParam = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      const path = this.fromRoute.asset
      const routePathParams = lodash.cloneDeep(assetParam)
      delete routePathParams.statistics
      this.updatePath(routePathParams, path)
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          if (response.statistics && this.$route.path === '/asset') {
            this.setSearchData(response.statistics)
          }
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
          const globalSearchId = this.$store.getters.getGlobalSearchId
          let detailViewRightObj = ''
          if (globalSearchId) {
            detailViewRightObj = this.tableData.find(item => item.id === globalSearchId)
          } else {
            detailViewRightObj = this.tableData[0]
          }
          this.detailViewRightObj = this.$loadsh.cloneDeep(detailViewRightObj)
          this.pageObj.total = response.data.total
          this.pageObj.pages = response.data.pages
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
          if (this.detailType === 'view') {
            this.$refs.dataDetail.$refs.dataTable.scrollTop = 0
          }
        }
      })
    },
    setSearchData (statistics) {
      Object.keys(this.titleSearchList).forEach(key => {
        const keys = key === 'assetLabel' ? 'meta' : key
        if (key === 'assetLabel') {
          this.getSearchableMetaData(statistics[keys]).then(res => {
            this.titleSearchList.assetLabel.children = res
            this.detailSearchList.assetLabel.children = res
            this.titleSearchList.assetLabel.show = true
            this.detailSearchList.assetLabel.show = true
          })
        } else if (key === 'model') {
          this.getModelData(statistics[keys]).then(res => {
            this.titleSearchList.model.children = res
            this.detailSearchList.model.children = res
            this.titleSearchList.model.show = true
            this.detailSearchList.model.show = true
          })
        } else {
          this.titleSearchList[key].children = statistics[keys].map(d => { return { ...d, value: d.id } })
          this.detailSearchList[key].children = statistics[keys].map(d => { return { ...d, value: d.id } })
        }
        if (this.titleSearchList[key].children.length === 0) {
          // delete this.titleSearchList[key]
          // delete this.detailSearchList[key]
        } else {
          this.titleSearchList[key].show = true
          this.detailSearchList[key].show = true
        }
        this.titleSearchList[key].show = true
        this.detailSearchList[key].show = true
      })
    },
    edit (u) {
      this.$get(`${this.url}/${u.id}`).then(response => {
        if (response.code === 200) {
          if (response.data.purchaseDate) {
            response.data.purchaseDate += ' 00:00:00'
            response.data.purchaseDate = new Date(response.data.purchaseDate)
          }
          this.object = {
            ...response.data,
            brandAndModel: ''
          }
          this.rightBox.show = true
        }
      })
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
        propertyName: 'ids',
        isSearchInput: true,
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
      sn: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'sn',
        type: 'number',
        defaultJson: {
          disabled: false,
          id: 'sn',
          label: 'sn',
          name: 'SN',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      manageIp: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'manageIp',
        type: 'number',
        defaultJson: {
          disabled: false,
          id: 'manageIp',
          label: 'manageIp',
          name: 'IP',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      stateIds: {
        target: this.searchLabel,
        propertyName: 'stateIds',
        type: 'number',
        isSearchInput: true,
        defaultJson: {
          disabled: false,
          id: 'stateIds',
          label: 'assetState',
          name: 'State',
          readonly: true,
          type: 'assetState',
          val: '',
          valnum: '',
          listStr: 'assetStateSelect'
        },
        jsonKey: 'valnum'
      },
      dcIds: { target: this.searchCheckBox, propertyName: 'dcIds', type: 'string', target2: this.selectValue, type2: 'array' },
      fields: { target: this.searchCheckBox, propertyName: 'fields', type: 'json', target2: this.selectValue, type2: 'json' },
      ping: { target: this.searchCheckBox, propertyName: 'ping', type: 'string', target2: this.selectValue, type2: 'array' },
      modelIds: { target: this.searchCheckBox, propertyName: 'modelIds', type: 'string', target2: this.selectValue, type2: 'array' },
      typeIds: { target: this.searchCheckBox, propertyName: 'typeIds', type: 'string', target2: this.selectValue, type2: 'array' }
    }
    this.initQueryFromPath(searchKeys)
  },
  mounted () {
    // 初始化数据
    this.getStateData()
    this.getTypeTreeData()
    this.getSnmpCredentialData()
    this.getFieldGroupData()
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        const importAsset = this.$route.query.importAsset
        if (add) {
          if (add === 'asset') {
            this.add()
          }
        }
        if (importAsset) {
          this.$nextTick(() => {
            this.$refs.export.showImportBox(1)
          })
        }
      }
    }
  }
}
</script>
<style scoped>
  .list-page /deep/ .main-container{
    display: flex;
    flex-direction: column;
  }
  /deep/ .nz-table-list{
    flex: 1;
  }
</style>
