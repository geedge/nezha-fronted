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
                    <i class="nz-icon nz-icon-close"/>
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
          width="150"
          trigger="hover"
          :popper-class="'popover-webshell'"
        >
          <div>
            <div class="popover-webshell-item"  @click="assetShowChange"><i class="nz-icon nz-icon-menu-assets" />{{$t('webshell.selAsset')}}</div>
            <div class="popover-webshell-item"  @click="customShow=true"><i class="nz-icon nz-icon-edit" />{{$t('webshell.custom')}}</div>
          </div>
          <span slot="reference" style="padding:8px;font-size:20px;font-weight:bold;">+</span>
        </el-popover>
      </el-tab-pane>
    </el-tabs>
    <!--弹窗-->
    <el-dialog :modal-append-to-body='false'  :show-close="true" :visible.sync="assetShow" @close="closeAssetCustom" class="nz-dialog" width="620px">
      <div slot="title">{{$t('webshell.connect')}}</div>
      <div >
        <el-form label-width="120px" size="small" :model="assetContent" label-position = "top" :rules="rules" ref="assetConnect" v-my-loading="assetLoading" >
          <el-form-item :label='$t("overall.asset")' prop="assetId" class="flex">
            <el-dropdown trigger="click" class="header-el-dropdown">
              <span class="el-dropdown-link">
                <span>{{selectValue}}</span>
                <span><i class="el-icon-arrow-down el-icon--right"></i></span>
              </span>
              <el-dropdown-menu style="width: 118px" class="el-dropdown__width right-box-select-top right-public-box-dropdown-top" placement="bottom-end" slot="dropdown">
                <el-dropdown-item
                  @click.native="selectAssetAuth(item.label, item.value)"
                  v-for="item in searchMetrics"
                  :key="item.value"><i class="nz-icon" :class="item.icon" style="margin-right: 5px"/>{{item.label}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <v-selectpage
              ref="selectPage"
              style="flex: 1"
              data="asset/asset"
              :params="selectPageParams"
              :tb-columns="columns"
              key-field="id"
              show-field="manageIp"
              search-field="manageIp"
              v-model="assetContent.assetId"
              size="small"
              :language="language"
              :placeholder="$t('dashboard.panel.chartForm.selectAsset')"
              id="box-input-asset-id"
              :result-format="resultFormat"></v-selectpage>
            <button :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click.prevent="connect">Connect</button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog :modal-append-to-body='false'  :show-close="true" :visible.sync="customShow" @close="closeAssetCustom" class="nz-dialog" width="620px" destroy-on-close>
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
            <el-input v-model="customConnect.authPin" size="small" type="password" autocomplete="new-password"/>
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
            <button id="asset-edit-save" :disabled="prevent_opt.save" class="footer__btn" @click.prevent="connect" type="button">
              <span>{{$t('webshell.connect')}}</span>
            </button>
          </div>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import terminal from './consoleNew'
import { host, port } from '@/components/common/js/validate'
export default {
  name: 'webSSH',
  components: {
    terminal
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
          value: 'Telnet',
          label: 'Telnet'
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
        { title: 'ID', data: 'id' },
        {
          title: 'Name',
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        { title: 'Manage Ip', data: 'manageIp' },
        {
          title: 'Type',
          data: (row) => {
            return row.type ? row.type.name : ''
          }
        },
        {
          title: 'Model',
          data: (row) => {
            return row.model ? row.model.name : ''
          }
        },
        {
          title: 'Datacenter',
          data: (row) => {
            return row.dc ? row.dc.name : ''
          }
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
      customShow: false
    }
  },
  methods: {
    selectAssetAuth (val, label) {
      this.$refs.selectPage.remove()
      if (val) {
        this.selectValue = val
        if (val === 'SSH') {
          this.selectPageParams = { authProtocol: 1, pageNumber: 1 }
        } else {
          this.selectPageParams = { authProtocol: 2, pageNumber: 1 }
        }
      } else {
        label = 'SSH'
        this.selectPageParams = { authProtocol: 1, pageNumber: 1 }
      }
      setTimeout(() => {
        this.$refs.selectPage.pageChange()
      }, 100)
    },
    assetShowChange () {
      this.assetShow = true
      this.selectValue = 'SSH'
      this.selectPageParams = { authProtocol: 1, pageNumber: 1 }
      if (this.$refs.selectPage) {
        this.$refs.selectPage.remove()
        this.$refs.selectPage.pageChange()
      }
      // this.getAssetData()
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
          this.$refs['console' + el.index][0].term.resize(225, 200)
          this.$refs['console' + el.index][0].term.fit()
          this.$refs['console' + el.index][0].term.scrollToBottom()
          this.$refs['console' + el.index][0].focusConsole()
        })
      }
    },
    windowChange () { // 窗口大小改变
      // alert('winChange');
      if (this.editableTabs && this.editableTabs.length > 0) {
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console' + index][0].resize()
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
        this.$refs.assetConnect.validate((valid) => {
          if (valid) {
            this.$get('asset/asset/' + this.assetContent.assetId).then(res => {
              const asset = res.data
              this.addConsole(asset.id, asset.manageIp, '', '', 'asset')
              this.assetShow = false
              this.prevent_opt.save = false
            })
          } else {
            this.prevent_opt.save = false
          }
        })
      } else {
        this.$refs.customConnect.validate((valid) => {
          if (valid) {
            this.addConsole('', this.customConnect.host, '', this.customConnect.port, 'custom')
            this.customShow = false
            this.prevent_opt.save = false
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
    },
    addConsole (id, host, accountId, port, type) {
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
          isLogin: false
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
      if (id) {
        this.$get('/asset/asset/' + id).then(res => {
          console.terminal.terminalType = res.data.type.authProtocol
          console.terminal.username = ''
          this.editableTabsValue = newTabName
          this.editableTabs.push(console)
        })
      } else {
        console.terminal.username = ''
        console.terminal.terminalType = this.customConnect.authProtocol
        this.editableTabsValue = newTabName
        this.editableTabs.push(console)
      }
    },
    duplicate (item, index) {
      if (item.terminal.assetId) {
        const newTabName = ++this.tabIndex + ''
        this.editableTabsValue = newTabName
        const console = JSON.parse(JSON.stringify(item))
        console.name = newTabName
        console.terminal.name = newTabName
        console.terminal.isLogin = false
        this.editableTabs.push(console)
      } else {
        this.customConnect = {
          ...item.terminal.custom,
          authType: Number(item.terminal.custom.authType),
          authPin: atob(decodeURIComponent(item.terminal.custom.authPin))
        }
        this.customShow = true
      }
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
      this.$refs['console' + index][0].reconnect()
      if (this.$refs['popover' + index] && this.$refs['popover' + index][0]) {
        this.$refs['popover' + index][0].doClose()
      }
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

<style scoped lang="scss">

</style>
