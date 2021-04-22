<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.asset"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <export-excel
          id="asset-list"
          :params="searchLabel"
          :permissions="{import: 'asset_add', export: 'asset_view'}"
          class="top-tool-export margin-r-10"
          export-file-name="asset"
          export-url="/asset/export"
          import-url="/asset/import"
          @afterImport="getTableData"
        >
          <template slot="optionZone">
            <button id="asset-create-asset" v-has="'asset_add'" :title="$t('overall.createAsset')" class="top-tool-btn" @click.stop="add">
              <i class="nz-icon nz-icon-create-square"></i></button>
          </template>
        </export-excel>
        <button id="asset-batch-asset" v-has="'asset_edit'" :title="$t('overall.batchEdit')" class="top-tool-btn margin-r-10" @click.stop="batchEdit">
          <i class="nz-icon nz-icon-batch-edit"></i>
        </button>
        <delete-button id="asset-list-batch-delete" v-has="'asset_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <asset-table
          ref="dataTable"
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @cli="cli"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
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
                 :brand-data="brandData"
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
  </div>
</template>

<script>
import bus from '@/libs/bus'
import exportXLSX from '@/components/common/exportXLSX'
import deleteButton from '@/components/common/deleteButton'
import assetBox from '@/components/common/rightBox/asset/assetBox'
import assetBatchEditBox from '@/components/common/rightBox/asset/assetBatchEditBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import assetTable from '@/components/common/table/asset/assetTable'
import { showTableTooltip, hideTableTooltip } from '@/components/common/js/tools'

export default {
  name: 'asset',
  components: {
    deleteButton,
    assetBox,
    nzDataList,
    assetBatchEditBox,
    assetTable,
    'export-excel': exportXLSX
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'asset/asset',
      // 侧滑
      rightBox: {
        batchShow: false
      },
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
      tableId: 'assetTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }, {
          id: 20,
          name: 'SN',
          type: 'input',
          label: 'sn',
          disabled: false
        }, {
          id: 21,
          name: 'Host',
          type: 'input',
          label: 'host',
          disabled: false
        }, {
          id: 22,
          name: this.$t('asset.state'),
          type: 'select',
          label: 'assetState',
          disabled: false
        }, {
          id: 23,
          name: 'pingStatus',
          type: 'select',
          label: 'pingStatus',
          disabled: false
        }, {
          id: 23,
          name: this.$t('asset.tableTitle.cabinet'),
          type: 'input',
          label: 'cabinetName',
          disabled: false
        }]
      },

      brandData: [],
      modelData: [],
      stateData: [],
      typeData: [],
      dcData: [],
      snmpCredentialData: [],
      fieldGroupData: []
    }
  },
  /* computed: {
    headerCurrentDc () {
      return this.$store.state.currentDc
    }
  }, */
  methods: {
    showTableTooltip,
    hideTableTooltip,
    cli ([id, host, account]) {
      const consoleParam = {
        id: id,
        host: host,
        accountId: account.id,
        port: account.port
      }
      this.$store.commit('addConsole', consoleParam)
    },
    getUserData () {
      return new Promise(resolve => {
        this.$get('sys/user').then(response => {
          if (response.code === 200) {
            this.userData = response.data.list
          }
          resolve()
        })
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
        // this.loadKeys()
      }
    },
    getPrincipalName (data) {
      for (const item in this.userData) {
        if (this.userData[item].userId === data) {
          return this.userData[item].username
        }
      }
    },
    /* formatPingTime (str) {
      if (!str) {
        return this.$t('asset.assetStatPre') + this.$t('asset.assetStatDown')
      }
      const ds = '-'
      const ts = ':'
      const time = new Date(bus.UTCTimeToConfigTimezone(str))
      const year = time.getFullYear()
      const month = time.getMonth() + 1 > 9 ? time.getMonth() + 1 : ('0' + (time.getMonth() + 1))
      const day = time.getDate() > 9 ? time.getDate() : ('0' + time.getDate())
      const hours = time.getHours() > 9 ? time.getHours() : ('0' + time.getHours())
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : ('0' + time.getMinutes())
      const seconds = time.getSeconds() > 9 ? time.getSeconds() : ('0' + time.getSeconds())
      return this.$t('asset.assetStatPre') + year + ds + month + ds + day + ' ' + hours + ts + minutes + ts + seconds
    }, */
    // 数据排序
    initEvent () {
      bus.$on('asset-filter-change', (column, content) => {
        this.pageObj.pageNo = 1
        if (column == 'multiParam') {
          const $self = this
          if (content instanceof Array && content.length > 0) {
            content.forEach(item => {
              $self.pageObj[item.key] = item.value
            })
          }
        } else {
          this.pageObj[column] = content
        }
        // let isSame = this.checkSearchLabel(JSON.parse(JSON.stringify(this.pageObj)), oldPageObj);
        // isSame && this.getTableData();
        this.getTableData()
      })
      bus.$on('alert-message-change', () => {
        this.getTableData()
      })
    },
    dispatchEvent (event, param) {
      this.$nextTick(() => {
        bus.$emit(event, param)
      })
    },
    loadKeys () {
      this.$get('/asset/tagKey').then(res => {
        if (res.code == 200) {
          this.tagKeys = res.data.list.map(item => {
            return { label: item, prop: 'tags', show: false, allowed: true, type: 'tag' }
          })
          this.resetTableTitle()
        }
      })
    }
  },
  mounted () {
    // this.loadKeys()
    // 初始化数据
    // this.getUserData()
    this.initEvent()
    this.getBrandData()
    this.getStateData()
    this.getTypeData()
    this.getDcData()
    this.getSnmpCredentialData()
    this.getFieldGroupData()
  },
  beforeDestroy () {
    bus.$off('asset-filter-change')
    bus.$off('alert-message-change')
  }
}
</script>
