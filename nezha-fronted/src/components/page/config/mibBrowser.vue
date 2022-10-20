<template>
  <div class="mib-browser" style="height: 100%">
    <nz-data-list
      ref="dataList"
    >
      <template v-slot:top-tool-right>
        <el-autocomplete
          id="mib-browser-host"
          v-model="searchParam.host"
          :fetch-suggestions="assetSuggestion"
          class="margin-r-20"
          placeholder="IP"
          size="small"
          popper-class="mib-browser-right-box-dropdown right-box-select-top right-public-box-dropdown-top"
          style="width: 100%;"
          value-key="manageIp"
          @input="assetChange"
        >
          <template slot-scope="{ item }">
            <div>{{ item.manageIp }}</div>
          </template>
        </el-autocomplete>
        <el-input id="mib-browser-oid" v-model="searchParam.oid" class="margin-r-20" placeholder="OID" size="small"></el-input>
        <div class="margin-r-10" style="width: 50%">
          <el-select id="mib-browser-host" v-model="searchParam.operation" size="small" popper-class="right-box-select-top right-public-box-dropdown-top">
            <el-option v-for="item in operationData" :key="item" :value="item"></el-option>
          </el-select>
        </div>
        <div class="top-tool-btn-group">
          <el-popover :offset="-143" placement="bottom" trigger="click" popper-class="right-box-select-top right-public-box-dropdown-top" width="300">
            <div class="mib-browser-ad-search">
              <el-select v-model="searchParam.snmpCredentialId" placeholder="Select credential" size="mini" style="width: 300px" value-key="id">
                <el-option v-for="(item, index) in credentialData" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <button id="browser-advanced" slot="reference" class="top-tool-btn" style="border-right: none;"  :title="$t('overall.more')">
              <i class="el-icon-more"></i>
            </button>
          </el-popover>
          <button id="browser-go" :class="{'nz-btn-disabled': loading}" class="top-tool-btn" @click="search(false)">Go</button>
        </div>
      </template>
      <template v-slot>
        <div class="mib-browser-box">
          <!--左半部分-->
          <div class="mib-browser-left">
            <div class="mib-browser-tree-title">
              <span>SNMP MIBs</span>
              <el-dropdown ref="modelDropdown" :hide-on-click="false" trigger="click" @command="selectModel">
                <span class="mib-browser-table-op">{{$t("config.model.model") + " "}}<i class="nz-icon nz-icon-funnel" :title="$t('dashboard.panel.chartForm.filter')"></i></span>
                <el-dropdown-menu slot="dropdown" class="mib-browser-model-dropdown el-dropdown-multi right-box-select-top">
                  <el-dropdown-item v-for="(item, index) in modelData" :key="index" :class="{'dropdown-item-active': walkParam.models.indexOf(item.id) > -1}" :command="item">{{item.name}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <!--tree-->
            <div ref="treeScrollbar" class="mib-browser-tree">
              <el-tree
                ref="walkTree"
                v-my-loading="treeLoading"
                :data="walkData"
                :expand-on-click-node="false"
                :props="{label: 'name', children: 'subTree'}"
                check-on-click-node
                check-strictly
                highlight-current
                node-key="objectID"
                @node-click="showDetail"
              >
                <div slot-scope="{node, data}" class="walk-tree-item">
                  <span v-if="!data.type"><i class="nz-icon nz-icon-reading"></i></span>
                  <span v-else>
                    <i v-if="data.type.toUpperCase() == 'IDENTIFIER'" class="el-icon-folder-opened"></i>
                    <i v-if="data.type.toUpperCase() == 'OBJECT' && data.subTree.length > 0" class="el-icon-folder-opened"></i>
                    <i v-if="data.type.toUpperCase() == 'OBJECT' && data.subTree.length == 0" class="nz-icon nz-icon-leaf"></i>
                    <i v-if="data.type.toUpperCase() == 'ENTRY'" class="nz-icon nz-icon-table-edit"></i>
                    <i v-if="data.type.toUpperCase() == 'TABLE'" class="nz-icon nz-icon-table"></i>
                  </span>
                  {{data.name}}
                </div>
              </el-tree>
            </div>
            <!--拖拽区-->
            <div class="tree-detail-resize" @mousedown="treeDetailResize"></div>
            <!--detail-->
            <div ref="detailScrollbar" class="mib-browser-detail">
              <div class="mib-browser-detail-row">
                <div>Name</div>
                    <copy :copyData='currentWalk.name' :showInfo='currentWalk.name'>
                      <template slot="copy-text">
                         {{currentWalk.name}}
                      </template>
                    </copy>
              </div>
              <div class="mib-browser-detail-row">
                <div>OID</div>
                <copy :copyData='currentWalk.objectID' :showInfo='currentWalk.objectID'>
                  <template slot="copy-text">
                     {{currentWalk.objectID}}
                  </template>
                </copy>
              </div>
              <div class="mib-browser-detail-row">
                <div>MIB</div>
                <copy :copyData='mibName(currentWalk.objectID)' :showInfo='mibName(currentWalk.objectID)'>
                  <template slot="copy-text">
                     {{mibName(currentWalk.objectID)}}
                  </template>
                </copy>
              </div>
              <div class="mib-browser-detail-row">
                <div>Syntax</div>
                <div>{{currentWalk.syntax}}</div>
              </div>
              <div class="mib-browser-detail-row">
                <div>Access</div>
                <div>{{currentWalk.access}}</div>
              </div>
              <div class="mib-browser-detail-row">
                <div>Status</div>
                <div>{{currentWalk.status}}</div>
              </div>
              <div class="mib-browser-detail-row">
                <div>Indexes</div>
                <div>{{currentWalk.index && currentWalk.index.length > 0 ? currentWalk.index : ""}}</div>
              </div>
              <div class="mib-browser-detail-row">
                <div>Description</div>
                <div>{{currentWalk.description}}</div>
              </div>
            </div>
          </div>
          <!--拖拽区-->
          <div class="left-right-resize" @mousedown="leftRightResize"></div>
          <!--右半部分-->
          <div class="mib-browser-right">
            <div class="mib-browser-table-title">
              <span>Result table</span>
              <span>
                <span id="mib-browser-export" v-has="'snmp_browser_export'" :class="{'mib-browser-table-op-light': resultData.length == 0}" :title="$t('overall.exportExcel')" class="mib-browser-table-op" @click="exportXlsx"><i class="nz-icon nz-icon-download1"></i></span>
                <span id="mib-browser-clear" :title="$t('overall.clear')" class="mib-browser-table-op" @click="clearResult"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
              </span>
            </div>
            <pl-table v-if="showTable" ref="resultTable" v-my-loading="loading" :datas="resultData" :empty-text="$t('overall.noData')" :pagination-show="false" :row-height="28"
                      border class="mib-browser-table" size="small" style="width: 100%; height: 100%" use-virtual>
              <pl-table-column v-slot="{row}" label="Name/OID">
                <copy :copyData='row.name ? row.name : row.oid' :showInfo='true'>
                  <template slot="copy-text">
                     <div class="too-long-split" @click="searchParam.oid = row.oid">{{row.name ? row.name : row.oid}}</div>
                  </template>
                </copy>
              </pl-table-column>
              <pl-table-column v-slot="{row}" label="Value">
                <copy :copyData='row.value' :showInfo='row.value'>
                  <template slot="copy-text">
                     <div @click="searchParam.oid = row.oid">{{row.value}}</div>
                  </template>
                </copy>
              </pl-table-column>
              <pl-table-column v-slot="{row}" label="Type">
                <template><div @click="searchParam.oid = row.oid">{{row.type}}</div></template>
              </pl-table-column>
              <pl-table-column v-slot="{row}" label="IP:Port">
                <template><div @click="searchParam.oid = row.oid">{{row.ip + (row.port ? ":" + row.port : "")}}</div></template>
              </pl-table-column>
            </pl-table>
          </div>
        </div>
      </template>
    </nz-data-list>
  </div>
</template>

<script>
import fileSaver from 'file-saver'
import nzDataList from '@/components/common/table/nzDataList'
import xlsx from 'xlsx'
import copy from '@/components/common/copy'

export default {
  name: 'mibBrowser',
  props: {
    switchTab: String
  },
  components: {
    nzDataList,
    copy
  },
  data () {
    return {
      loading: false,
      treeLoading: false,
      snmpSetFormVisible: false, // snmp set表单
      searchParam: {
        host: '',
        oid: '',
        port: 161,
        operation: 'get',
        version: 2,
        community: 'public',
        snmpCredentialId: null
      },
      /* searchParam: {
        manageIp: '',
        port: 161,
        oid: '',
        operation: 'get',
        version: 2,
        community: 'public',
        auth: {
          username: '',
          pin: '',
          securityLevel: '',
          authProtocol: '',
          privProtocol: '',
          privPin: ''
        },
        type: '',
        value: ''
      },
      searchParamPop: {
        manageIp: '',
        port: 161,
        oid: '',
        operation: 'get',
        version: 2,
        community: 'public',
        auth: {
          username: '',
          pin: '',
          securityLevel: '',
          authProtocol: '',
          privProtocol: '',
          privPin: ''
        }
      }, */
      operationData: ['get', 'walk', 'getnext', 'set'],
      // advancedShow: false,

      walkParam: { models: [] },
      walkData: [],
      currentWalk: { name: '', objectID: '', syntax: '', access: '', status: '', index: '', description: '' },
      resultData: [],
      modelData: [],
      assetData: [],
      showTable: true,
      typeData: ['OctetString', 'Integer', 'OID', 'Gauge', 'Counter32', 'IpAddress', 'TimeTicks', 'Counter64', 'UnsignedInteger', 'BITS', 'Float', 'DateAndTime'],
      assetInputTimer: null,

      credentialData: []
    }
  },
  computed: {
    mibName () {
      return (value) => {
        return value ? this.getMibName(value) : ''
      }
    }
  },
  methods: {
    toFileTab () {
      this.$emit('toFileTab')
    },
    toCredentialTab () {
      this.$emit('toCredentialTab')
    },
    showDetail (data, node) {
      this.currentWalk = data
      this.searchParam.oid = data.objectID
    },

    /* 根据oid获取对应的根mib名称 */
    getMibName (oid) {
      const node = this.$refs.walkTree.getNode(oid)
      const mibName = getMibName(node)
      function getMibName (n) {
        if (n.parent && n.parent.parent) {
          return getMibName(n.parent)
        } else if (n.parent) {
          return n.data.name
        } else {
          return ''
        }
      }
      return mibName || ''
    },

    /* 获取右上角筛选数据 */
    getCredentialData () {
      this.$get('snmp/credential', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.credentialData = response.data.list
        }
      })
    },
    /* 获取tree的数据 */
    getWalkData () {
      this.treeLoading = true
      this.$get('mib/tree', { models: this.walkParam.models.join(',') }).then(response => {
        this.treeLoading = false
        if (response.code === 200) {
          const obj = JSON.parse(response.data)
          this.walkData = []
          for (const item in obj) {
            this.walkData.push({ name: item, subTree: obj[item] })
          }
        }
      })
    },
    getModelData () {
      this.$get('asset/model', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.modelData = response.data.list
        }
      })
    },
    selectModel (model) {
      const index = this.walkParam.models.indexOf(parseInt(model.id))
      if (index == -1) {
        this.walkParam.models.push(parseInt(model.id))
      } else {
        this.walkParam.models.splice(index, 1)
      }
      this.getWalkData()
    },
    search (set) {
      /* if (this.loading) {
        return
      } */

      // this.popShow(); this.popHide() // 再调用一次，对数据赋值

      /* 处理snmpset */
      /* if (!set) {
        if (this.searchParam.operation == 'set') {
          this.snmpSetFormVisible = true
          return
        }
      }
      if (this.snmpSetFormVisible) {
        if (!this.searchParam.oid || !this.searchParam.type || !this.searchParam.value) {
          this.$message.error(this.$t('validate.required'))
          return
        }
        this.snmpSetFormVisible = false
      } */
      this.loading = true
      setTimeout(() => {
        this.$post('mib/browser', this.searchParam).then(response => {
          this.loading = false
          if (response.code === 200) {
            this.resultData = this.resultData.concat(response.data.list)
            if (this.searchParam.operation === 'set') {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.success') })
            }
            this.showTable = false
            this.$nextTick(() => {
              this.showTable = true
            })
          } else {
            this.$message.error(response.msg)
          }
        })
      }, 300)
    },

    /* popShow () {
      this.searchParamPop.host = this.searchParam.host
      this.searchParamPop.oid = this.searchParam.oid
      this.searchParamPop.operation = this.searchParam.operation
    },
    popHide () {
      this.searchParam = JSON.parse(JSON.stringify(this.searchParamPop))
    }, */
    /* 清空result table */
    clearResult () {
      this.resultData = []
    },
    resetSearchParam: function () {
      this.searchParamPop = {
        host: '',
        port: 161,
        oid: '',
        operation: 'get',
        version: 2,
        community: 'public',
        auth: {
          username: '',
          pin: '',
          securityLevel: '',
          authProtocol: '',
          privProtocol: '',
          privPin: ''
        }
      }
    },
    clickTab (showTabInfo, showTab) {
      this.$emit('changeShowTab', showTab)
    },
    assetChange: function (value) {
      clearTimeout(this.assetInputTimer)
      this.assetInputTimer = setTimeout(() => {
        this.resetSearchParam()
        const asset = this.assetData.find(item => {
          return item.host == value
        })

        if (asset && asset.accounts && asset.accounts.length > 0) {
          const snmpAccount = asset.accounts.find(item => {
            return item.protocol == 'SNMP'
          })

          if (snmpAccount) {
            this.searchParamPop.port = snmpAccount.port
            this.searchParamPop.community = snmpAccount.params.community
            this.searchParamPop.version = snmpAccount.params.version
            if (this.searchParamPop.version == 3) {
              this.searchParamPop.auth.username = snmpAccount.params.username
              this.searchParamPop.auth.securityLevel = snmpAccount.params.securityLevel
              this.searchParamPop.auth.pin = snmpAccount.params.pin
              this.searchParamPop.auth.authProtocol = snmpAccount.params.authProtocol
              if (this.searchParamPop.auth.securityLevel == 'authPriv') { this.searchParamPop.auth.privProtocol = snmpAccount.params.privProtocol }
              this.searchParamPop.auth.privPin = snmpAccount.params.privPin
            }
          }
        }
      }, 200)
    },
    assetSuggestion (queryString, callback) {
      let data = []
      if (!queryString) {
        data = this.assetData
      } else {
        for (let i = 0; i < this.assetData.length; i++) {
          if (this.assetData[i].manageIp.indexOf(queryString) != -1) {
            data.push(this.assetData[i])
          }
        }
      }
      callback(data)
    },
    getAssetData () {
      this.$get('asset/asset', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.assetData = response.data.list
        }
      })
    },
    /* 左侧上下拖动 */
    treeDetailResize (e) {
      const treeDom = document.querySelector('.mib-browser-tree') // tree
      const detailDom = document.querySelector('.mib-browser-detail') // detail
      // 得到点击时dom的初始高度：
      const leftTotalHeight = document.querySelector('.mib-browser-left').offsetHeight
      const treeInitialHeight = treeDom.offsetHeight
      const detailInitialHeight = detailDom.offsetHeight
      // 点击时鼠标的Y轴位置
      const mouseInitialY = e.clientY

      document.onmousemove = (e) => {
        e.preventDefault()
        // 得到鼠标拖动的距离
        const mouseMoveY = Math.abs(e.clientY - mouseInitialY)

        // 往上方拖动：
        if (e.clientY < mouseInitialY) {
          treeDom.style.height = treeInitialHeight - mouseMoveY - 5 + 'px'
          detailDom.style.height = detailInitialHeight + mouseMoveY + 'px'
        }
        // 往下方拖动：
        if (e.clientY > mouseInitialY) {
          treeDom.style.height = treeInitialHeight + mouseMoveY - 5 + 'px'
          detailDom.style.height = detailInitialHeight - mouseMoveY + 'px'
        }

        // 主、副列表最小高度限制为55px
        if (parseInt(treeDom.style.height) >= leftTotalHeight - 95) {
          treeDom.style.height = leftTotalHeight - 95 + 'px'
        }
        if (parseInt(treeDom.style.height) <= 55) {
          treeDom.style.height = 55 + 'px'
        }
        if (parseInt(detailDom.style.height) >= leftTotalHeight - 95) {
          detailDom.style.height = leftTotalHeight - 95 + 'px'
        }
        if (parseInt(detailDom.style.height) <= 55) {
          detailDom.style.height = 55 + 'px'
        }
      }
      document.onmouseup = () => {
        document.onmousemove = null
      }
    },
    /* 中间左右拖动 */
    leftRightResize (e) {
      const leftDom = document.querySelector('.mib-browser-left') // tree
      const rightDom = document.querySelector('.mib-browser-right') // detail
      // 得到点击时dom的初始宽度：
      const totalWidth = document.querySelector('.mib-browser-box').offsetWidth
      const leftInitialWidth = leftDom.offsetWidth
      const rightInitialWidth = rightDom.offsetWidth
      // 点击时鼠标的Y轴位置
      const mouseInitialX = e.clientX

      document.onmousemove = (e) => {
        e.preventDefault()
        // 得到鼠标拖动的距离
        const mouseMoveX = Math.abs(e.clientX - mouseInitialX)

        // 往上方拖动：
        if (e.clientX < mouseInitialX) {
          leftDom.style.width = leftInitialWidth - mouseMoveX + 'px'
          rightDom.style.width = rightInitialWidth + mouseMoveX + 'px'
        }
        // 往下方拖动：
        if (e.clientX > mouseInitialX) {
          leftDom.style.width = leftInitialWidth + mouseMoveX + 'px'
          rightDom.style.width = rightInitialWidth - mouseMoveX + 'px'
        }

        // 主、副列表最小宽度限制
        if (parseInt(leftDom.style.width) >= totalWidth - 400) {
          leftDom.style.width = totalWidth - 400 + 'px'
        }
        if (parseInt(leftDom.style.width) <= 200) {
          leftDom.style.width = 200 + 'px'
        }
        if (parseInt(rightDom.style.width) >= totalWidth - 200) {
          rightDom.style.width = totalWidth - 200 + 'px'
        }
        if (parseInt(rightDom.style.width) <= 400) {
          rightDom.style.width = 400 + 'px'
        }
      }
      document.onmouseup = () => {
        document.onmousemove = null
      }
    },
    domResize () {
      const scrollTop = this.$refs.resultTable.$el.querySelector('.el-table__body-wrapper').scrollTop
      this.showTable = false
      this.$nextTick(() => {
        this.showTable = true
        this.$nextTick(() => {
          this.$refs.resultTable.$el.querySelector('.el-table__body-wrapper').scrollTop = scrollTop
        })
      })
    },
    exportXlsx () {
      if (this.resultData.length == 0) {
        return
      }
      const book = xlsx.utils.book_new()
      const sheet = xlsx.utils.json_to_sheet(this.resultData, { header: ['name', 'oid', 'value', 'type', 'ip', 'port'] })
      xlsx.utils.book_append_sheet(book, sheet, 'result')
      const out = xlsx.write(book, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      try {
        fileSaver.saveAs(
          new Blob([out], {
            type: 'application/octet-stream'
          }),
          'result_' + this.searchParam.host + '.xlsx'
        )
      } catch (e) {}
      return out
    }
  },
  mounted () {
    this.getWalkData()
    this.getModelData()
    this.getAssetData()
    this.getCredentialData()
    window.addEventListener('resize', this.domResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.domResize)
  }
}
</script>
<style scoped>

.document-copy-text{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
