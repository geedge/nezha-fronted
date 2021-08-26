<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.asset"
      :layout="dataListLayout"
      :search-msg="searchMsg"
      :table-box-height="assetTableHeight"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="asset-filter" :class="{ 'is-focus': dataListLayout.indexOf('clickSearch') > -1 }" class="top-tool-btn margin-r-10" @click.stop="showClickSearch">
          <i class="nz-icon nz-icon-funnel"></i>
        </button>
        <button id="asset-create-asset" v-has="'asset_add'" :title="$t('overall.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <top-tool-more-options
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{
                  import: 'asset_add',
                  export: 'asset_view'
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
                <div id="asset-batch-asset" v-has="'asset_edit'" @click.stop="batchEdit"><i class="nz-icon nz-icon-batch-edit"></i>{{$t('overall.batchEdit')}}</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <delete-button :type="'link'" :title="$t('overall.batchDel')" id="asset-list-batch-delete" v-has="'asset_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:search>
        <click-search ref="clickSearch" :select-value.sync="selectValue" :title-search-list="titleSearchList" @reload="reloadTable"/>
      </template>
      <template v-slot:default="slotProps">
        <asset-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="dataListLayout.indexOf('clickSearch') > -1? 'calc(100% - 40px)' : mainTableHeight"
          :table-data="tableData"
          @cli="cli"
          @del="del"
          @edit="edit"
          @duplicate="duplicate"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @addSilence="addSilence"
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
import dataListMixin from '@/components/common/mixin/dataList'
import assetTable from '@/components/common/table/asset/assetTable'
import clickSearch from '@/components/common/labelFilter/clickSearch'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'

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
    alertSilenceBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'asset/asset',
      filter: {},
      // 侧滑
      rightBox: {
        batchShow: false
      },
      silenceBoxShow: false,
      dataListLayout: ['searchInput', 'elementSet', 'clickSearch', 'pagination'],
      assetTableHeight: `calc(100% - ${48 + 201 + 40}px)`,
      blankObject: {
        id: '',
        name: '',
        pid: '',
        sn: '',
        manageIp: '',
        stateId: '',
        purchaseDate: null,
        dcId: '',
        cabinetId: '',
        brandId: '',
        brand: { id: '', name: '' },
        modelId: '',
        model: { id: '', name: '' },
        type: { name: '', id: '' },
        brandAndModel: [],
        typeId: '',
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
          name: this.$t('asset.state'),
          type: 'assetState',
          label: 'stateIds',
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
          label: 'ping',
          key: 'ping',
          type: 'checkBox',
          children: [
            { key: 'Down', value: 0, name: 'Down' },
            { key: 'Up', value: 1, name: 'Up' }
          ],
          show: true,
          showMore: false,
          width: 0,
          index: -1
        },
        model: {
          label: this.$t('asset.model'),
          key: 'modelIds',
          type: 'dropdownCheckBox',
          children: [],
          show: false,
          showMore: false,
          width: 0,
          index: -1
        },
        assetLabel: {
          label: 'More',
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
        fields: ''
      }
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
      this.object = { ...row, id: '', name: `${row.name}-copy` }
      this.rightBox.show = true
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
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          this.searchCheckBox[key] = obj[key] ? obj[key] : null
        } else {
          obj[key] && obj[key].length > 0 ? this.searchCheckBox[key] = obj[key].join(',') : this.searchCheckBox[key] = null
        }
      })
      this.getTableData()
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
    getSearchableMetaData () {
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
                  data.push({ ...m, children: param.items.map(p => { return { ...p, id: p.name, metaId: m.id } }) })
                }
              }
            })
            // this.titleSearchList.assetLabel.children = data
            resolve(data)
            setTimeout(() => {
              const title = this.tools.customTableTitle
              const originalTitle = title.slice(0, this.$refs.dataTable.tableTitle.length) // 原title
              const oldLabelTitle = title.slice(this.$refs.dataTable.tableTitle.length, title.length) // 旧labelTitle

              const newLabel = showData.filter(item => { return !oldLabelTitle.find(t => { return item.label === t.label }) })
              const keepLabel = oldLabelTitle.filter(item => showData.find(t => item.label === t.label))

              let result = originalTitle.concat([{ label: 'Label', show: false, NotSet: true, type: 'title', prop: 'table-label' }])

              result = result.concat(keepLabel).concat(newLabel)
              this.tools.customTableTitle = JSON.parse(JSON.stringify(result))
            }, 200)
          }
          resolve()
        })
      })
    },
    getModelData () {
      return new Promise(resolve => {
        this.$get('asset/model?pageSize=-1').then(response => {
          if (response.code === 200) {
            this.modelData = response.data.list
            const titleSearchData = {}
            this.modelData.forEach(m => {
              if (titleSearchData[m.brand.name]) {
                titleSearchData[m.brand.name].children.push(m)
              } else {
                titleSearchData[m.brand.name] = { ...m.brand, children: [m] }
              }
            })
            resolve(Object.keys(titleSearchData).map(b => titleSearchData[b]))
            // this.titleSearchList.model.children = Object.keys(titleSearchData).map(b => titleSearchData[b])
          }
          resolve()
        })
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
    }
  },
  mounted () {
    // 初始化数据
    this.getModelData().then(res => {
      this.titleSearchList.model.children = res
      this.titleSearchList.model.show = true
    })
    this.getTypeData().then(res => {
      this.titleSearchList.type.children = res
      this.titleSearchList.type.show = true
    })
    this.getDcData().then(res => {
      this.titleSearchList.dc.children = res
      this.titleSearchList.dc.show = true
    })
    this.getSearchableMetaData().then(res => {
      this.titleSearchList.assetLabel.children = res
      this.titleSearchList.assetLabel.show = true
    })
    this.getStateData()
    this.getTypeTreeData()
    this.getSnmpCredentialData()
    this.getFieldGroupData()
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
