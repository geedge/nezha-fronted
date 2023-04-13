<template>
  <div class="ani-webSHH-height web-terminal-new" id="web-terminal-new">
    <el-tabs
      :before-leave="beforeLeave"
      @tab-click="handleClick"
      @tab-remove="removeTab"
      type="border-card"
      v-model="editableTabsValue"
    >
      <el-tab-pane
        :key="item.name"
        :label="item.title"
        :name="item.name"
        closable
        v-for="(item, index) in editableTabs"
      >
        <!-- tab显示的内容 1 grey,2 green, 3 red-->
        <span slot="label" class="el-tabs__item-label">
          <div class="active-icon" :class="item.terminal.isLogin ? 'green-bg': 'red-bg'"></div>
          <div class="el-tabs__item-label-name text-ellipsis" :title="item.terminal.userName">
            {{item.terminal.userName}}
          </div>
            <el-popover
              slot="label"
              placement="bottom"
              :ref="'popover' + index"
              width="180"
              trigger="click"
              :popper-class="'popover-webshell popover-webshell-new'"
            >
              <div class="popover-webshell-box">
                <div class="webshell-box-top">
                   Session ID : {{item.terminal.uuid.slice(0,7).toLocaleUpperCase()}}
                </div>
                <div class="webshell-box-middle" v-show="item.terminal.userName">
                  <div @click="duplicate(item, index)" class="webshell-box-item">
                    <i class="nz-icon nz-icon-override"/>
                    {{$t('overall.duplicate')}}
                  </div>
                  <div  @click="reconnect(item, index)" v-show="item.terminal.userName"  class="webshell-box-item">
                    <i class="nz-icon nz-icon-reconnect"></i>
                    {{$t('terminal.reconnect')}}
                  </div>
                  <div @click="showFileDir(item, index)"  class="webshell-box-item"  v-if="item.terminal.isLogin && item.terminal.terminalType == '1'">
                    <i class="nz-icon nz-icon-SFTP"></i>
                    {{$t('terminal.sftp')}}
                  </div>
                </div>
                <div class="webshell-box-item webshell-box-bottom" @click="closeShell(item,index)">
                  <div >
                    <i class="nz-icon nz-icon-guanbi2"/>
                    {{$t('overall.close')}}
                  </div>
                </div>

              </div>
            <span slot="reference" class="icon-reference"> <i class="nz-icon nz-icon-more1" /></span>
          </el-popover>
          </span>

        <terminal
          :fontSize="fontSize"
          :terminalType="item.terminal.terminalType"
          :idIndex="index"
          :ref="'console'+index"
          :terminal="item.terminal"
          @loginFail="loginFail"
          @closeConsole="removeTab"
          @refreshConsoleTitle="refreshTabTitle"
          @historyChange="(message)=>{$parent.historyChange(message)}"
        ></terminal>

      </el-tab-pane>
      <el-tab-pane key="add" name="addConsole" class="add-console" style="width: 20px">
        <el-popover
          slot="label"
          placement="bottom-start"
          ref="tabPaneAdd"
          width="150"
          trigger="hover"
          :popper-class="'popover-webshell'"
        >
          <div>
            <div class="popover-webshell-item"  @click="assetShowChange"><i class="nz-icon nz-icon-menu-assets" />{{$t('webshell.selAsset')}}</div>
            <div class="popover-webshell-item"  @click="customShowChange"><i class="nz-icon nz-icon-edit" />{{$t('webshell.custom')}}</div>
          </div>
          <span slot="reference" style="padding:8px;font-size:20px;font-weight:bold;">+</span>
        </el-popover>
      </el-tab-pane>
    </el-tabs>
    <!--弹窗-->
    <el-dialog :modal-append-to-body='false' :z-index="1000" :show-close="true" :visible.sync="assetShow" @close="closeAssetCustom" class="nz-dialog webshell-selectAsset" width="620px">
      <div slot="title">{{$t('webshell.selAsset')}}</div>
      <selectTable ref="selectTable" v-model="assetContent.assetId" :params="selectPageParams" :columns="columns" :tableFormat="tableFormat" api="asset/asset" value-key="id" search-key="manageIp">
        <template v-slot:searchLeft>
          <el-dropdown trigger="click" class="header-el-dropdown">
            <span class="el-dropdown-link">
              <span>{{selectValue}}</span>
              <span><i class="el-icon-arrow-down el-icon--right"></i></span>
            </span>
            <el-dropdown-menu style="width: 80px" class="el-dropdown__width right-box-select-top right-public-box-dropdown-top" placement="bottom-end" slot="dropdown">
              <el-dropdown-item
                @click.native="selectAssetAuth(item.label, item.value)"
                v-for="item in searchMetrics"
                :key="item.value"
                style="padding:0px 10px"
                >
                <i class="nz-icon" :class="item.icon" style="margin-right: 5px"/>{{item.label}}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </selectTable>
      <div slot="footer">
        <button class="footer__btn footer__btn--light" @click="assetShow=false">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button class="footer__btn" :class="{'webshell-btn-disable': !assetContent.assetId}" v-my-loading:circleMin="prevent_opt.save" :disabled="prevent_opt.save||!assetContent.assetId" @click.prevent="connect">
          <span>{{$t('webshell.connect')}}</span>
        </button>
      </div>
    </el-dialog>
    <!-- 自定义连接 start -->
    <el-dialog :modal-append-to-body='false' :show-close="true" :z-index="1000" :visible.sync="customShow" @close="closeAssetCustom" class="nz-dialog" width="620px" destroy-on-close>
      <div slot="title">{{$t('webshell.connect')}}</div>
      <div >
        <el-form label-width="120px" size="small" :model="customConnect" label-position = "top" :rules=" customConnect.authProtocol ===2 ? rulesCustom2: rulesCustom" ref="customConnect" v-my-loading="assetLoading" class="custom">
          <el-form-item :label='$t("webshell.protocol")' prop="authProtocol">
            <el-select  @change="protocolChange" value-key="id" popper-class="config-dropdown w260 right-box-select-top right-public-box-dropdown-top" v-model="customConnect.authProtocol" placeholder="" size="small" id="webshell-box-input-protocol">
              <el-option v-for="item in authProtocol" :id="'dc-principal-op-'+item.value" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label='$t("asset.authType")' prop="authType"  @change="authTypeChange" >
            <el-select value-key="id" popper-class="config-dropdown w260 right-box-select-top right-public-box-dropdown-top" v-model="customConnect.authType" :disabled="customConnect.authProtocol === 2" placeholder="" size="small" id="webshell-box-input-protocol">
              <el-option v-for="item in authType" :id="'dc-principal-op-'+item.value" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label='$t("asset.host")' prop="host">
            <el-input v-model="customConnect.host" size="small"/>
          </el-form-item>
          <el-form-item :label='$t("asset.port")' prop="port">
            <el-input v-model="customConnect.port" size="small"/>
          </el-form-item>
          <el-form-item :label='$t("profile.username")' prop="authUsername">
            <el-input v-model="customConnect.authUsername" size="small" autocomplete="new-password"/>
          </el-form-item>
          <el-form-item
            v-if="customConnect.authType === 2"
            :label='$t("asset.talon.token")'
            prop="authPriKey"
          >
            <el-input v-model="customConnect.authPriKey" size="small" autocomplete="new-password"/>
          </el-form-item>
          <el-form-item
            :label='$t("login.pin")' prop="authPin"
            :rules="[{ required: customConnect.authType ===1, message:$t('validate.required'), trigger: 'change'},]"
            >
            <el-input v-model="customConnect.authPin" size="small" type="password" auto-complete="new-password"  autocomplete="new-password"/>
          </el-form-item>
          <el-form-item
            v-if="customConnect.authProtocol === 2"
            :label='$t("asset.usernamePrompt")'
            prop="authUserTip">
            <el-input v-model="customConnect.authUserTip" size="small"/>
          </el-form-item>
          <el-form-item
            v-if="customConnect.authProtocol === 2"
            :label='$t("asset.pinPrompt")'
            prop="authPinTip"
          >
            <el-input v-model="customConnect.authPinTip" size="small"/>
          </el-form-item>
          <div class="right-box__footer custom-footer">
            <button id="asset-edit-cancel" @click="customShow=false" class="footer__btn footer__btn--light" type="button">
              <span>{{$t('overall.cancel')}}</span>
            </button>
            <button id="asset-edit-save" v-my-loading:circleMin="prevent_opt.save" :disabled="prevent_opt.save" class="footer__btn" @click.prevent="connect" type="button">
              <span>{{$t('webshell.connect')}}</span>
            </button>
          </div>
        </el-form>
      </div>
    </el-dialog>
    <!-- 自定义连接 end -->
  </div>
</template>

<script>
import terminal from './consoleNew'
import selectTable from '@/components/common/selectTable'
import { host, port } from '@/components/common/js/validate'
import { requestsArr } from '@/http'
export default {
  name: 'webSSH',
  components: {
    terminal,
    selectTable
  },
  computed: {
    language () { return this.$store.getters.getLanguage },
    fileList () {
      return this.$store.getters.getFileList
    }
  },
  data () {
    return {
      tabIndex: 0,
      editableTabs: [],
      editableTabsValue: '',
      fontSize: 16,
      assetShow: false,
      selectValue: 'SSH',
      fileListStateType: 'down',
      searchMetrics: [
        {
          value: 'SSH',
          label: 'SSH'
        },
        {
          value: 'TELNET',
          label: 'TELNET'
        }
      ],
      selectPageParams: {
        authProtocol: 1
      },
      authProtocol: [
        {
          value: 1,
          name: 'SSH'
        },
        {
          value: 2,
          name: 'TELNET'
        }
      ],
      authType: [
        {
          value: 1,
          name: 'Password'
        },
        {
          value: 2,
          name: 'Key'
        }
      ],
      consoleShow: false,
      closeConfirmShow: false,
      customConnect: {
        host: '',
        port: 22,
        authType: 1,
        authUsername: '',
        authPin: '',
        authPriKey: '',
        authUserTip: '',
        authPinTip: '',
        authProtocolPort: '',
        authProtocol: 1
      },
      columns: [
        {
          label: 'ID',
          prop: 'id',
          minWidth: 48
        }, {
          label: 'Name',
          prop: 'name',
          minWidth: 100
        }, {
          label: 'Manage Ip',
          prop: 'manageIp',
          minWidth: 132
        }, {
          label: 'Type',
          prop: 'type',
          minWidth: 86
        }, {
          label: 'Model',
          prop: 'model',
          minWidth: 106
        }, {
          label: 'Datacenter',
          prop: 'dc',
          minWidth: 94
        }
      ],
      rules: {
        assetId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      rulesCustom: {
        authProtocol: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authType: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        host: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: host, trigger: 'change' }
        ],
        port: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: port, trigger: 'change' }
        ],
        authUsername: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authPin: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
        // authUserTip: [
        //   { validator: this.authUserTipValid, trigger: 'change' }
        // ],
        // authPinTip: [
        //   { validator: this.authPinTipValid, trigger: 'change' }
        // ],
        // authPriKey: [
        //   { validator: this.authPriKeyValid, trigger: 'change' }
        // ]
      },
      rulesCustom2: {
        authProtocol: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authType: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        host: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: host, trigger: 'change' }
        ],
        port: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: port, trigger: 'change' }
        ],
        authUsername: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authPin: [
          { required: false, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authUserTip: [
          { required: false, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authPinTip: [
          { required: false, message: this.$t('validate.required'), trigger: 'change' }
        ],
        authPriKey: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      assetData: [],
      assetLoading: false,
      assetContent: {
        assetId: ''
      },
      customShow: false,
      connectLoading: false
    }
  },
  methods: {
    tableFormat (row, column, cellValue) {
      let str
      switch (column.property) {
        case 'type':
          str = row.type.name || '-'
          break
        case 'model':
          str = row.model.name || '-'
          break
        case 'dc':
          str = row.dc.name || '-'
          break
        default:
          str = cellValue || '-'
          break
      }
      return str
    },
    selectAssetAuth (val, label) {
      this.assetContent.assetId = ''
      if (val) {
        this.selectValue = val
        if (val === 'SSH') {
          this.selectPageParams = { authProtocol: 1 }
        } else {
          this.selectPageParams = { authProtocol: 2 }
        }
      } else {
        label = 'SSH'
        this.selectPageParams = { authProtocol: 1 }
      }
      this.$nextTick(() => {
        this.$refs.selectTable.pageChange(1)
      })
    },
    assetShowChange () {
      this.assetShow = true
      this.selectValue = 'SSH'
      this.selectPageParams = { authProtocol: 1 }
      this.$nextTick(() => {
        this.$refs.selectTable.filter = ''
        this.$refs.selectTable.pageChange(1)
      })
      if (this.$refs.tabPaneAdd) {
        this.$refs.tabPaneAdd.doClose()
      }
      // this.getAssetData()
    },
    customShowChange () {
      this.customShow = true
      if (this.$refs.tabPaneAdd) {
        this.$refs.tabPaneAdd.doClose()
      }
    },
    /* 活动标签切换时触发 */
    beforeLeave (currentName, oldName) {
      // 重点，如果name是add，则什么都不触发
      if (currentName === 'add') {
        this.addTab()
        return false
      } else {
        // 切换tab
        this.$nextTick(() => {
          if (this.editableTabs && this.editableTabs.length > 0) {
            this.editableTabs.forEach((tab, index) => {
              if (tab.name === currentName) {
                this.$refs['console' + index][0].focusConsole()
                this.currentUuid = tab.terminal.uuid
              }
            })
          }
        })
        this.currentIndex = currentName
      }
    },
    handleClick (el) {
      // this.$refs['console' + el.index][0].focusConsole()
      if (this.$refs['console' + el.index] && this.$refs['console' + el.index][0]) {
        setTimeout(() => {
          this.$refs['console' + el.index][0].resize()
          this.$refs['console' + el.index][0].term.scrollToBottom()
          this.$refs['console' + el.index][0].focusConsole()
        })
      }
    },
    windowChange () { // 窗口大小改变
      // alert('winChange');
      if (this.editableTabs && this.editableTabs.length > 0) {
        this.editableTabs.forEach((tab, index) => {
          if (tab.name === this.editableTabsValue) {
            this.$refs['console' + index][0].resize()
          }
        })
      }
    },
    removeTab (targetName) {
      const tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter(tab => tab.name !== targetName)

      if (this.editableTabs.length <= 0) {
        // this.closeConsole()
      }
    },
    loginFail (params) {
      this.removeTab(params.name)
      setTimeout(() => {
        if (params.assetId) {
          this.assetShowChange()
        } else {
          this.customConnect = {
            ...params,
            authType: Number(params.authType),
            authPin: atob(decodeURIComponent(params.authPin))
          }
          this.customShow = true
        }
      })
    },
    refreshTabTitle (connectResult) {
      if (this.editableTabs && this.editableTabs.length > 0) {
        this.editableTabs.forEach((tab, index) => {
          if (tab.name === this.editableTabsValue) {
            if (connectResult.title && connectResult.title != '') {
              tab.title = connectResult.title
            }
            tab.circleColor = connectResult.color
          }
        })
      }
    },
    cancleConfirm () {
      this.closeConfirmShow = false
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    getAssetData () {
      this.assetLoading = true
      this.$get('asset/asset', { pageSize: -1, typeIds: '1,2' }).then(res => {
        this.assetLoading = false
        this.assetData = res.data.list
      })
    },
    connect () {
      this.prevent_opt.save = true
      if (this.assetShow) {
        this.$get('asset/asset/' + this.assetContent.assetId).then(res => {
          const asset = res.data
          this.addConsole(asset.id, asset.manageIp, '', '', 'asset', asset)
        })
      } else {
        this.$refs.customConnect.validate((valid) => {
          if (valid) {
            this.addConsole('', this.customConnect.host, '', this.customConnect.port, 'custom')
          } else {
            this.prevent_opt.save = false
          }
        })
      }
    },
    protocolChange () {
      if (this.customConnect.authProtocol === 1) {
        this.customConnect.authUserTip = ''
        this.customConnect.authPinTip = ''
        this.customConnect.port = 22
      } else {
        this.customConnect.authPriKey = ''
        this.customConnect.port = 23
        this.customConnect.authType = 1
      }
      setTimeout(() => {
        this.$refs.customConnect.clearValidate()
      })
    },
    authTypeChange () {
      if (this.customConnect.authType === 1) {
        this.customConnect.authPriKey = ''
      }
    },
    encode (str) {
      // 对编码的字符串转化base64
      const base64 = encodeURIComponent(btoa(str))
      return base64
    },
    closeAssetCustom () {
      this.assetShow = false
      this.customShow = false
      this.assetContent.assetId = ''
      this.customConnect = {
        host: '',
        port: 22,
        authType: 1,
        authUsername: '',
        authPin: '',
        authPriKey: '',
        authUserTip: '',
        authPinTip: '',
        authProtocolPort: '',
        authProtocol: 1
      }
      this.prevent_opt.save = false
      requestsArr.forEach(xhr => {
        if (!xhr.parentWindow) {
          xhr.cancel('cancel')
        }
      })
    },
    addConsole (id, host, accountId, port, type, asset, father) {
      if (!id) { id = '' }
      if (!host) { host = '' }
      if (!accountId) { accountId = '' }
      if (!port) { port = '' }
      const uuid = ''
      const newTabName = ++this.tabIndex + ''
      let title = host
      if (port) {
        title = title + ':' + port
      }
      if (!title) {
        title = this.$t('webshell.shellTitle')
      }
      const width = document.body.clientWidth// 可视宽度
      const console = {
        title: title,
        name: newTabName,
        circleColor: 1, // 1 grey,2 green, 3 red
        uuid: uuid,
        showTooltip: false,
        terminal: {
          name: newTabName,
          cols: 225,
          rows: 200,
          width: width,
          height: document.body.clientHeight - 100,
          assetId: id,
          accountId: accountId,
          uuid: uuid,
          type: type,
          username: '',
          isLogin: false,
          host: ''
        }
      }
      if (type === 'custom') {
        console.terminal.custom = {
          host: this.customConnect.host,
          port: this.customConnect.port,
          authType: this.customConnect.authType,
          terminalType: this.customConnect.authProtocol,
          authUsername: encodeURIComponent(this.customConnect.authUsername),
          authPin: this.encode(this.customConnect.authPin),
          authPriKey: encodeURIComponent(this.customConnect.authPriKey),
          authUserTip: encodeURIComponent(this.customConnect.authUserTip),
          authPinTip: encodeURIComponent(this.customConnect.authPinTip),
          authProtocolPort: encodeURIComponent(this.customConnect.authProtocolPort),
          authProtocol: encodeURIComponent(this.customConnect.authProtocol)
        }
      }
      const terminal = console.terminal
      const params = {
        width: terminal.width,
        height: terminal.height,
        cols: terminal.cols,
        rows: terminal.rows,
        host: this.$loadsh.get(terminal, 'custom.host', ''),
        port: this.$loadsh.get(terminal, 'custom.port', ''),
        assetId: this.$loadsh.get(terminal, 'assetId', ''),
        accountId: this.$loadsh.get(terminal, 'accountId', ''),
        authProtocol: this.$loadsh.get(terminal, 'custom.authProtocol', ''),
        authProtocolPort: this.$loadsh.get(terminal, 'custom.authProtocolPort', ''),
        authType: this.$loadsh.get(terminal, 'custom.authType', ''),
        authUsername: this.$loadsh.get(terminal, 'custom.authUsername', ''),
        authPin: this.$loadsh.get(terminal, 'custom.authPin', ''),
        authPriKey: this.$loadsh.get(terminal, 'custom.authPriKey', ''),
        authUserTip: this.$loadsh.get(terminal, 'custom.authUserTip', ''),
        authPinTip: this.$loadsh.get(terminal, 'custom.authPinTip', ''),
        parentWindow: !!father
      }
      this.$post('/terminal/login', params).then(res => {
        if (res.code == 200) {
          terminal.uuid = res.data.uuid
          this.$forceUpdate()
          terminal.userName = res.data.authUsername + '@' + res.data.host
          terminal.host = res.data.host
          if (id) {
            console.terminal.terminalType = asset ? asset.type.authProtocol : console.terminal.terminalType
            console.terminal.username = ''
            this.editableTabsValue = newTabName
            this.editableTabs.push(console)
            this.assetShow = false
          } else {
            console.terminal.username = ''
            console.terminal.terminalType = this.customConnect.authProtocol
            this.editableTabsValue = newTabName
            this.editableTabs.push(console)
            this.customShow = false
          }
          this.prevent_opt.save = false
        } else {
          this.prevent_opt.save = false
          if (res === 'cancel') return
          if (res.data) {
            terminal.uuid = res.data.uuid
            terminal.userName = res.data.authUsername + '@' + res.data.host
            this.host = res.data.host
          }
          params.name = terminal.name
          // this.$emit('loginFail', params)
          this.$message.error(res.msg)
        }
      })
    },
    duplicate (item, index) {
      const params = {
        uuid: item.terminal.uuid,
        ...item.terminal
      }
      this.$post('/terminal/login/duplicate', params).then(res => {
        if (res.code == 200) {
          const newTabName = ++this.tabIndex + ''
          const obj = JSON.parse(JSON.stringify(item))
          obj.terminal.uuid = res.data.uuid
          obj.name = newTabName
          this.editableTabsValue = newTabName
          this.editableTabs.push(obj)
        } else {
          this.$message.error(res.msg)
        }
      })
      if (this.$refs['popover' + index] && this.$refs['popover' + index][0]) {
        this.$refs['popover' + index][0].doClose()
      }
    },
    debounce (operate, delay) {
      let time = null
      let timer = null
      let newTime = null
      function task () {
        newTime = +new Date()
        if (newTime - time < delay) {
          timer = setTimeout(task, delay)
        } else {
          operate()
          timer = null
        }
        time = newTime
      }
      return function () {
        // 更新时间戳
        time = +new Date()
        if (!timer) {
          timer = setTimeout(task, delay)
        }
      }
    },
    reconnect (item, index) {
      if (this.$refs['popover' + index] && this.$refs['popover' + index][0]) {
        this.$refs['popover' + index][0].doClose()
      }
      const terminal = item.terminal
      const params = {
        width: terminal.width,
        height: terminal.height,
        cols: terminal.cols,
        rows: terminal.rows,
        host: this.$loadsh.get(terminal, 'custom.host', ''),
        port: this.$loadsh.get(terminal, 'custom.port', ''),
        assetId: this.$loadsh.get(terminal, 'assetId', ''),
        accountId: this.$loadsh.get(terminal, 'accountId', ''),
        authProtocol: this.$loadsh.get(terminal, 'custom.authProtocol', ''),
        authProtocolPort: this.$loadsh.get(terminal, 'custom.authProtocolPort', ''),
        authType: this.$loadsh.get(terminal, 'custom.authType', ''),
        authUsername: this.$loadsh.get(terminal, 'custom.authUsername', ''),
        authPin: this.$loadsh.get(terminal, 'custom.authPin', ''),
        authPriKey: this.$loadsh.get(terminal, 'custom.authPriKey', ''),
        authUserTip: this.$loadsh.get(terminal, 'custom.authUserTip', ''),
        authPinTip: this.$loadsh.get(terminal, 'custom.authPinTip', '')
      }
      this.$post('/terminal/login', params).then(res => {
        if (res.code == 200) {
          terminal.uuid = res.data.uuid
          this.$forceUpdate()
          terminal.userName = res.data.authUsername + '@' + res.data.host
          terminal.host = res.data.host
          this.prevent_opt.save = false
          this.$refs['console' + index][0].reconnect()
        } else {
          this.prevent_opt.save = false
          if (res === 'cancel') return
          if (res.data) {
            terminal.uuid = res.data.uuid
            terminal.userName = res.data.authUsername + '@' + res.data.host
            this.host = res.data.host
          }
          params.name = terminal.name
          // this.$emit('loginFail', params)
          this.$message.error(res.msg)
        }
      })
    },
    showFileDir (item, index) {
      this.$refs['console' + index][0].showFileDir(true)
      if (this.$refs['popover' + index] && this.$refs['popover' + index][0]) {
        this.$refs['popover' + index][0].doClose()
      }
    },
    closeShell (item, index) {
      this.removeTab(item.name)
      if (this.$refs['popover' + index] && this.$refs['popover' + index][0]) {
        this.$refs['popover' + index][0].doClose()
      }
    },
    sendMessage (message) {
      this.editableTabs.forEach((item, index) => {
        this.$refs['console' + index][0].enterStr(message)
      })
    }
  },
  watch: {
  },
  created () {
  },
  mounted () {
    window.addEventListener('resize', this.debounce(this.windowChange, 1000), false)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.debounce(this.windowChange, 1000), false)
  }
}
</script>
