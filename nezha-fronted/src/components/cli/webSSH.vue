<style lang="scss">
  @import './webSSH.scss';
</style>
<template>
  <!--  <div id="shell-service" data-yunlog-scope="popup" :class="{'shell-service-max': isFullScreen,'shell-service':true}" v-show="consoleShow">
      <div class="resize-modal">
        <div class="sub-list-resize-copy">一</div>
      </div>
      <div id="shell-split" class="shell-split shell-iconfont" @mousedown="dragEagle" v-show="!isFullScreen">一</div>-->
  <div :class="{'shell-service-max': isFullScreen,'shell-service':true}" class="sub-box ani-webSHH-height cli" data-yunlog-scope="popup" id="shell-service" ref="webSShBox" style="height: 0;background: #000">
    <div class="resize-modal">
      <div class="sub-list-resize-copy" style="width: 100%">一</div>
    </div>
    <div @mousedown="dragEagle" class="sub-list-resize" id="shell-split" v-show="!isFullScreen">一</div>
    <div class="sub-list-resize" v-show="isFullScreen"></div>
    <div class="sub-list" style='position: relative;'>
      <!--el-drawer 打开后会对第一个未隐藏的元素聚焦 所以添加一隐藏的input 防止聚焦-->
      <input style='width: 0;height: 0;opacity: 0;display: inherit;' />
    <!--  <el-menu  @select="handleSelect" mode="horizontal" style='position: absolute;left:0px;top:0px;border-top: 1px solid #DCDFE6;' class="horizontal">
        <el-submenu index="1"  popper-class="horizontal" style="width:40px;">
          <template slot="title" ><i class="nz-icon nz-icon-728bianjiqi_zitidaxiao" style="position: absolute;left: 10px;top: 4px;"></i></template>
          &lt;!&ndash;<el-submenu index="1-1">&ndash;&gt;
          &lt;!&ndash;<template slot="title">文字大小</template>&ndash;&gt;
          <el-menu-item @click="changeFontSize(12)" :class="{fontSet:true,menuActive:fontSize==12, smallFont:true}" index="1-1">A</el-menu-item>
          <el-menu-item @click="changeFontSize(15)" :class="{fontSet:true,menuActive:fontSize==15, middleFont:true}" index="1-2">A</el-menu-item>
          <el-menu-item @click="changeFontSize(20)" :class="{fontSet:true,menuActive:fontSize==20, bigFont:true}" index="1-3">A</el-menu-item>
          &lt;!&ndash;<el-menu-item class="fontSet" index="1-4">大</el-menu-item>&ndash;&gt;
          &lt;!&ndash;</el-submenu>&ndash;&gt;
          &lt;!&ndash;<el-submenu index="1-2" >&ndash;&gt;
          &lt;!&ndash;<template slot="title">字体</template>&ndash;&gt;
          &lt;!&ndash;<el-menu-item index="1-2-1">Monosapace</el-menu-item>&ndash;&gt;
          &lt;!&ndash;<el-menu-item index="1-2-2">Courier New</el-menu-item>&ndash;&gt;
          &lt;!&ndash;</el-submenu>&ndash;&gt;
        </el-submenu>
&lt;!&ndash;        <el-submenu index="2" style="width:50px;" popper-class="horizontal">&ndash;&gt;
&lt;!&ndash;          <template slot="title" ><i class="nz-icon nz-icon-upload console-title-icon" style="position: absolute;left: 10px;top: 4px;"></i></template>&ndash;&gt;
&lt;!&ndash;          <el-menu-item @click="showUploadBox" index="2-1">&ndash;&gt;
&lt;!&ndash;            <div>{{$t('webshell.upload')}}</div>&ndash;&gt;
&lt;!&ndash;          </el-menu-item>&ndash;&gt;
&lt;!&ndash;          <el-menu-item @click="showDownloadBox" index="2-2">&ndash;&gt;
&lt;!&ndash;            <div>{{$t('webshell.download')}}</div>&ndash;&gt;
&lt;!&ndash;          </el-menu-item>&ndash;&gt;
&lt;!&ndash;        </el-submenu>&ndash;&gt;
      </el-menu>-->

      <el-tabs :before-leave="beforeLeave"
               @tab-click="handleClick"
               @tab-remove="removeTab"
               style='width:100%; margin-left:0px;border-left:solid 1px black;border-bottom: 1px solid black;margin-top: -4px'
               type="border-card"
               v-model="editableTabsValue" >
        <el-tab-pane :key="item.name"
                     :label="item.title"
                     :name="item.name"
                     closable
                     v-for="(item, index) in editableTabs"
        >
          <!-- tab显示的内容 1 grey,2 green, 3 red-->
          <span slot="label" style="">
            <el-popover
              slot="label"
              placement="top"
              width="150"
              trigger="hover"
              :popper-class="'popover-webshell'"
            >
            <div>
             Session ID : {{item.uuid.slice(0,7).toLocaleUpperCase()}}
            </div>
            <span slot="reference"> <i class="nz-icon nz-icon-about" /></span>
          </el-popover>
            <div :class="{'active-icon grey':item.circleColor == 1,'active-icon green':item.circleColor == 2,'active-icon red':item.circleColor == 3}"
                 style="margin-top: 0px;"></div>{{item.title}}
          </span>

          <my-console :fontSize="fontSize"    :idIndex="index" :isFullScreen="isFullScreen"    :ref="'console'+index" :terminal="item.terminal" @closeConsole="removeTab" @refreshConsoleTitle="refreshTabTitle"></my-console>

        </el-tab-pane>
        <el-tab-pane key="add" name="addConsole" style="width: 20px">
          <el-popover
            slot="label"
            placement="bottom-start"
            width="150"
            trigger="hover"
            :popper-class="'popover-webshell'"
          >
            <div>
              <div class="popover-webshell-item"  @click="assetShowChange"><i class="nz-icon nz-icon-menu-assets" />Select asset</div>
              <div  class="popover-webshell-item"  @click="customShow=true"><i class="nz-icon nz-icon-edit" />Custom connect</div>
            </div>
            <span slot="reference" style="padding:8px;font-size:20px;font-weight:bold;">+</span>
          </el-popover>
        </el-tab-pane>
      </el-tabs>
      <i @click="minScreen" class="nz-icon nz-icon-minus console-title-icon" style='right:70px;'></i>
      <i @click="fullScreen" class="el-icon-full-screen console-title-icon" style='right:38px;' v-if="!isFullScreen"></i>
      <i @click="exitFullScreen" class="nz-icon nz-icon-exit-full-screen console-title-icon" style='right:38px;' v-else></i>
      <i @click="closeConsole" class="nz-icon nz-icon-close console-title-icon" style='right:8px;'></i>
      <!--
      <i style='right:103px;' @click="minScreen" class="nz-icon nz-icon-minus console-title-icon"></i>
      <i style='right:70px;;' @click="fullScreen" class="el-icon-full-screen console-title-icon"></i>
      <i style='right:38px;' class="el-icon-copy-document console-title-icon" ></i>
      <i style='right:8px;' @click="closeConsole" class="nz-icon nz-icon-close console-title-icon"></i>
      -->
      <!--nz-icon-setting  nz-icon nz-icon-minus  el-icon-full-screen  el-icon-copy-document-->
    </div>

    <div >
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="uploadBox.title" :visible.sync="uploadBox.showUpload" @close="closeDialog" class="nz-dialog" width="500px" >
        <div >
          <div class="upload-body">

            <el-row >
              <el-col :span="24">
                <el-upload :auto-upload="false" :file-list="uploadFileList"
                           :on-change="handleChange" action=""
                           class="upload-demo"
                           drag
                           ref="uploadFile" >
                  <i class="nz-icon nz-icon-upload"></i>
                  <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
                  <!--<button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                    <span class="top-tool-btn-txt" >{{$t('webshell.fileSelect')}}</span>
                  </button>-->
                </el-upload>
              </el-col>
            </el-row>
            <el-row style="margin-top: 20px;">
              <el-col :span="3" style="text-align:center;line-height: 24px;">
                <label>{{$t('webshell.filePath')}}</label>
              </el-col>
              <el-col :span="21">
                <el-input size="mini" v-model="uploadFile.path"></el-input>
              </el-col>
            </el-row>
          </div>
          <div class="footer" slot="footer">
            <div class="el-message-box__btns" style="text-align: right;margin-top: 20px;">
              <button  @click="upload"  class="el-button el-button--default el-button--small">
                <span>{{$t('webshell.uploadButtonTitle')}}</span>
              </button>
              <button @click="closeDialog"  class="el-button el-button--default el-button--small" >
                <span>{{$t('overall.cancel')}}</span>
              </button>
            </div>
          </div>
        </div>
      </el-dialog>
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="downloadBox.title" :visible.sync="downloadBox.showDownload" @close="closeDownloadDialog" class="nz-dialog" width="500px" >
        <div>
          <div class="upload-body">
            <el-row style="margin-top: 20px;">
              <el-col :span="3" style="text-align:center;line-height: 24px;">
                <label>{{$t('webshell.filePath')}}</label>
              </el-col>
              <el-col :span="21">
                <el-input size="mini" v-model="downloadFile.path"></el-input>
              </el-col>
            </el-row>
          </div>
          <div class="footer" slot="footer">
            <div class="el-message-box__btns" style="text-align: right;margin-top: 20px;">
              <button @click="download"  class="el-button el-button--default el-button--small">
                <span>{{$t('webshell.downloadButtonTitle')}}</span>
              </button>
              <button  @click="closeDownloadDialog"  class="el-button el-button--default el-button--small">
                <span>{{$t('overall.cancel')}}</span>
              </button>
            </div>
          </div>
        </div>
      </el-dialog>
      <el-dialog :modal-append-to-body='false'  :show-close="true" :visible.sync="closeConfirmShow" @close="cancleConfirm" class="nz-dialog" width="500px" >
        <div >
          <div class="el-message-box__content">
            <div class="el-message-box__container">
              <div class="el-message-box__status el-icon-warning">
              </div>
              <div class="el-message-box__message">
                <p>{{$t('webshell.closeTip')}}</p>
              </div>
            </div>
          </div>
          <div class="footer" slot="footer">
            <div class="el-message-box__btns" style="text-align: unset; padding-left: 50px;">
              <el-checkbox v-model="closeRemember">{{$t('webshell.remember')}}</el-checkbox>
              <button @click="closeShellWindow" class="el-button el-button--default el-button--small el-button--primary float-right" type="button">
                <span>{{$t('tip.yes')}}</span>
              </button>
              <button @click="cancleConfirm" class="el-button el-button--default el-button--small float-right" type="button">
                <span>{{$t('tip.no')}}</span>
              </button>
            </div>
          </div>
        </div>
      </el-dialog>
      <el-dialog :modal-append-to-body='false'  :show-close="true" :visible.sync="assetShow" @close="closeAssetCustom" class="nz-dialog" width="620px" destroy-on-close>
        <div slot="title">Connect</div>
        <div >
          <el-form label-width="120px" size="small" :model="assetContent" label-position = "top" :rules="rules" ref="assetConnect" v-loading="assetLoading" >
            <el-form-item :label='$t("overall.asset")' prop="assetId" class="flex">
              <v-selectpage
                style="flex: 1"
                data="asset/asset"
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
              <button @click.prevent="connect" type="button" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">Connect</button>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
      <el-dialog :modal-append-to-body='false'  :show-close="true" :visible.sync="customShow" @close="closeAssetCustom" class="nz-dialog" width="620px"destroy-on-close >
        <div slot="title">Connect</div>
        <div >
          <el-form label-width="120px" size="small" :model="customConnect" label-position = "top" :rules=" customConnect.authProtocol ===2 ? rulesCustom2: rulesCustom" ref="customConnect" v-loading="assetLoading" class="custom">
            <el-form-item :label='$t("webshell.protocol")' prop="authProtocol">
              <el-select  @change="protocolChange" value-key="id" popper-class="config-dropdown" v-model="customConnect.authProtocol" placeholder="" size="small" id="webshell-box-input-protocol">
                <el-option v-for="item in authProtocol" :id="'dc-principal-op-'+item.value" :key="item.value" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label='$t("webshell.authType")' prop="authType"  @change="authTypeChange" :disabled="customConnect.authProtocol === 2 ">
              <el-select value-key="id" popper-class="config-dropdown" v-model="customConnect.authType" placeholder="" size="small" id="webshell-box-input-protocol">
                <el-option v-for="item in authType" :id="'dc-principal-op-'+item.value" :key="item.value" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label='$t("webshell.host")' prop="host">
              <el-input v-model="customConnect.host" size="small"/>
            </el-form-item>
            <el-form-item :label='$t("webshell.port")' prop="port">
              <el-input v-model="customConnect.port" size="small"/>
            </el-form-item>
            <el-form-item :label='$t("webshell.authUsername")' prop="authUsername">
              <el-input v-model="customConnect.authUsername" size="small" autocomplete="new-password"/>
            </el-form-item>
            <el-form-item
              v-if="customConnect.authType === 2"
              :label='$t("webshell.authPriKey")'
              prop="authPriKey"
            >
              <el-input v-model="customConnect.authPriKey" size="small" autocomplete="new-password"/>
            </el-form-item>
            <el-form-item :label='$t("webshell.authPin")' prop="authPin"
                          :rules="[
                  { required: customConnect.authType ===1, message:$t('validate.required'), trigger: 'change'},
                ]">
              <el-input v-model="customConnect.authPin" size="small" type="password" autocomplete="new-password"/>
            </el-form-item>
            <el-form-item
              v-if="customConnect.authProtocol === 2"
              :label='$t("webshell.authUserTip")'
              prop="authUserTip">
              <el-input v-model="customConnect.authUserTip" size="small"/>
            </el-form-item>
            <el-form-item
              v-if="customConnect.authProtocol === 2"
              :label='$t("webshell.authPinTip")'
              prop="authPinTip"
            >
              <el-input v-model="customConnect.authPinTip" size="small"/>
            </el-form-item>
            <div class="right-box__footer custom-footer">
              <button id="asset-edit-cancel" @click="customShow=false" class="footer__btn footer__btn--light" type="button">
                <span>{{$t('overall.cancel')}}</span>
              </button>
              <button id="asset-edit-save" :disabled="prevent_opt.save" class="footer__btn" @click.prevent="connect" type="button">
                <span>Connect</span>
              </button>
            </div>
          </el-form>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Console from './console'
import uuidv1 from 'uuid/v1'
import axios from 'axios'
import { SelectPage } from 'v-selectpage'
import { host, port } from '@/components/common/js/validate'
export default {
  name: 'webSSH',
  components: {
    'my-console': Console,
    'v-selectpage': SelectPage
  },

  data () {
    const termFontSize = parseInt(localStorage.getItem('termFontSize'))
    return {
      language: localStorage.getItem('nz-language'),
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
      isFullScreen: false,
      closeConfirmShow: false,
      closeRemember: false,
      initConsoleHeight: 300, // 只读,初始化高度
      consoleHeight: 250, // console高度
      resizeConsoleHeight: 250, // resize后的高度，用于记录最大化、最小化前的高度
      currentTransform: 0,
      editableTabsValue: '-1', // 当前显示的console
      currentIndex: '-1',
      editableTabs: [],
      tabIndex: -1, // 添加tab的时候使用
      // upoload-download

      currentUuid: '',
      uploadBox: { showUpload: false, title: this.$t('webshell.uploadTitle') },
      uploadFile: { file: '', path: '', uuid: '' },
      uploadFileList: [],
      uploadResult: null,
      downloadBox: { showDownload: false, title: this.$t('webshell.downloadTitle') },
      downloadFile: { path: '', uuid: '' },
      downloadFileList: [],
      downloadResult: null,
      // 字体大小
      fontSize: termFontSize || 15,
      webSSHHeight: '', // 最小化之前的高度
      assetShow: false,
      customShow: false,
      assetContent: {
        assetId: ''
      },
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
        { title: 'id', data: 'id' },
        { title: 'name', data: 'name' },
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
      assetLoading: false
    }
  },
  methods: {
    getUuid () {
      let uuid = uuidv1()
      const now = new Date().getTime()
      uuid = uuid + '-' + now + '-' + now
      this.currentUuid = uuid
      return uuid
    },
    addConsole (id, host, accountId, port, type) {
      if (!id) { id = '' }
      if (!host) { host = '' }
      if (!accountId) { accountId = '' }
      if (!port) { port = '' }
      const uuid = this.getUuid()
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
        terminal: {
          name: newTabName,
          cols: 225,
          rows: 200,
          width: width,
          height: this.consoleHeight,
          assetId: id,
          accountId: accountId,
          uuid: uuid,
          type: type
        }
      }
      if (type === 'custom') {
        console.terminal.custom = { ...this.customConnect, authPin: this.encode(this.customConnect.authPin) }
      }
      this.editableTabsValue = newTabName
      this.editableTabs.push(console)

      setTimeout(function () {
        const tabScroll = document.getElementsByClassName('el-tabs__nav is-top')
        const tabViewWidth = document.getElementsByClassName('el-tabs__nav-scroll')
        const scrollWidth = tabScroll[0].clientWidth
        const viewWidth = tabViewWidth[0].clientWidth// 可视宽度

        if (viewWidth < scrollWidth) {
          tabScroll[0].style.transform = 'translateX(' + (viewWidth - scrollWidth) + 'px) '// 71(
        }
      }, 10)

      // this.$store.commit('addConsole');
    },
    show (id, host, accountId, port) {
      this.addConsole(id, host, accountId, port,'asset')
      this.consoleShow = true
    },
    initDialog () {

    },

    // 可以做最小化的处理，点击窗口外的空白处会调用此方法
    closeConsole () {
      // 弹窗询问是否关闭所有链接，关闭窗口？复选框：记住我的选择（用户勾选且选择yes 后，保存到localstorage，之后关闭不再提醒）
      if (this.editableTabs.length <= 1) {
        this.closeShellWindow()
      } else {
        const remember = localStorage.getItem('close-shell-remember') ? localStorage.getItem('close-shell-remember') : false
        if (remember) {
          this.closeShellWindow()
        } else {
          this.closeConfirmShow = true
        }
      }
      document.querySelector('.sub-list').style.height = ''
    },
    cancleConfirm () {
      this.closeConfirmShow = false
    },
    closeShellWindow () {
      if (this.closeRemember) { // remember me
        localStorage.setItem('close-shell-remember', this.closeRemember)
      }
      // 关闭所有连接
      this.editableTabs.forEach((tab, index) => {
        this.$refs['console' + index][0].closeSocket()
      })
      this.editableTabs = []
      this.editableTabsValue = '-1' // 当前显示的consol
      this.tabIndex = -1

      this.consoleShow = false
      this.isFullScreen = false

      const targetDiv = document.getElementById('shell-service')
      targetDiv.style.height = 0 + 'px'
      this.consoleHeight = this.initConsoleHeight - 50

      this.$store.commit('closeConsole')

      window.removeEventListener('resize', this.windowChange)
      this.closeConfirmShow = false
      const subListDom = document.querySelector('#shell-service .sub-list') // 副列表
      subListDom.style.height = '250px'
    },
    handleClick () {

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
      this.$store.commit('removeConsole')

      if (this.editableTabs.length <= 0) {
        this.closeConsole()
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
    addTab (targetName) {
      this.$store.commit('addConsoleNum')
      this.addConsole()
    },
    handleSelect (key, keyPath) {
      // alert(keyPath);
    },

    /* upload--download  start */
    closeDialog: function () {
      this.uploadBox.showUpload = false
      this.uploadResult = null
      this.uploadFileList = []
      this.uploadFile = { file: '', path: '', uuid: '' }
    },
    closeDownloadDialog () {
      this.downloadBox.showDownload = false
      this.downloadResult = null
      this.downloadFileList = []
      this.downloadFile = { path: '', uuid: '' }
    },
    showUploadBox () {
      this.uploadBox.showUpload = true
    },
    handleChange: function (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = [fileList[fileList.length - 1]]
      }
      this.uploadFile.file = this.uploadFileList[0]
    },
    upload () {
      const form = new FormData()
      form.append('uuid', this.currentUuid)
      form.append('file', this.uploadFile.file.raw)
      form.append('path', this.uploadFile.path)
      this.$post('terminal/upload', form, { 'Content-Type': 'multipart/form-data' }).then(res => {
        if (res.code == 200) {
          this.closeDialog()
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    showDownloadBox () {
      this.downloadBox.showDownload = true
    },
    download () {
      this.downloadFile.uuid = this.currentUuid
      axios.post('terminal/download', this.downloadFile, { responseType: 'blob' }).then(res => {
        const fileName = this.downloadFile.path.substring(this.downloadFile.path.lastIndexOf('/') + 1)
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = fileName
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
        this.closeDownloadDialog()
      })
    },
    /* upload--download  end */
    minScreen () {
      this.consoleShow = false
      this.$store.commit('minConsole')
      const targetDiv = document.getElementById('shell-service')
      this.webSSHHeight = targetDiv.style.height
      targetDiv.style.height = 0 + 'px'
    },
    fullScreen (isChange) {
      this.resizeConsoleHeight = document.querySelector('#shell-service').offsetHeight // 记录全屏前主列表的高度
      // dialog全屏
      this.isFullScreen = !this.isFullScreen

      // 所有的console全屏
      this.editableTabs.forEach((tab, index) => {
        this.$refs['console' + index][0].fullScreenConsole(this.isFullScreen)
      })

      if (!this.isFullScreen) {
        const targetDiv = document.getElementById('shell-service')
        targetDiv.style.height = this.initConsoleHeight + 'px'
        this.consoleHeight = this.initConsoleHeight
      } else {
        const targetDiv = document.getElementById('shell-service')
        targetDiv.style.height = `${100}%`
        const height = document.body.clientHeight// 可视高度
        this.consoleHeight = height
      }

      if (this.editableTabs && this.editableTabs.length > 0) {
        this.editableTabs.forEach((tab, index) => {
          if (tab.name === this.editableTabsValue) {
            this.$refs['console' + index][0].focusConsole()
          }
        })
      }
    },
    exitFullScreen () {
      this.isFullScreen = !this.isFullScreen
      // 所有的console全屏
      this.editableTabs.forEach((tab, index) => {
        this.$refs['console' + index][0].fullScreenConsole(this.isFullScreen, this.resizeConsoleHeight - 30)
      })

      if (!this.isFullScreen) {
        const targetDiv = document.getElementById('shell-service')
        targetDiv.style.height = this.resizeConsoleHeight + 'px'
        this.consoleHeight = this.resizeConsoleHeight
      } else {
        const targetDiv = document.getElementById('shell-service')
        targetDiv.style.height = `${100}%`
        const height = document.body.clientHeight// 可视高度
        this.consoleHeight = height
      }

      if (this.editableTabs && this.editableTabs.length > 0) {
        this.editableTabs.forEach((tab, index) => {
          if (tab.name === this.editableTabsValue) {
            this.$refs['console' + index][0].focusConsole()
          }
        })
      }
    },
    dragEagle (e) {
      // let mainListDom = document.querySelector(".main-list"); //主列表
      const subBoxDom = document.querySelector('#shell-service.sub-box') // 副列表
      const subListDom = document.querySelector('#shell-service .sub-list') // 副列表
      const contentRightDom = document.querySelector('.list-page') // 右侧内容区
      const resizeBarHeight = 9 // resize横条高度
      const minHeight = 15 // terminal最小高度限制为15
      // let contentHideHeight = 100; //主、副列表高度低于100时隐藏内容
      // let mainModalDom = document.querySelector(".main-modal"); //主列表遮罩
      const resizeModalDom = document.querySelector('#shell-service .resize-modal') // 副列表遮罩
      const resizeBarDom = document.querySelector('#shell-service .sub-list-resize') // 拖动条

      const contentRightHeight = contentRightDom.offsetHeight// 可视高度
      // 点击时俩dom的初始高度：
      const subInitialHeight = subListDom.offsetHeight + resizeBarHeight
      // mainModalDom.style.display = "block";
      resizeModalDom.style.cssText = `height: ${subInitialHeight}px; display: block;`
      resizeBarDom.style.display = 'none'
      let resizeModalEndHeight
      // 点击时鼠标的Y轴位置
      const mouseInitialY = e.clientY

      document.onmousemove = (e) => {
        window.resizing = true
        e.preventDefault()
        // 得到鼠标拖动的距离
        const mouseMoveY = e.clientY - mouseInitialY
        resizeModalEndHeight = subInitialHeight - mouseMoveY
        resizeModalDom.style.height = `${resizeModalEndHeight}px`

        // 主、副列表最大、最小高度限制
        if (resizeModalEndHeight > contentRightHeight - minHeight) {
          resizeModalEndHeight = contentRightHeight - minHeight
        }
        if (resizeModalEndHeight < minHeight) {
          resizeModalEndHeight = minHeight
        }
        resizeModalDom.style.height = `${resizeModalEndHeight}px`
      }
      const vm = this
      document.onmouseup = () => {
        window.resizing = false
        // mainListDom.style.height = `${contentRightHeight-resizeModalEndHeight}px`;
        subBoxDom.style.height = `${resizeModalEndHeight}px`
        subListDom.style.height = `${resizeModalEndHeight - resizeBarHeight}px`
        resizeModalDom.style.display = 'none'
        // mainModalDom.style.display = "none";
        resizeBarDom.style.display = ''

        vm.consoleHeight = resizeModalEndHeight
        vm.editableTabs.forEach((tab, index) => {
          vm.$refs['console' + index][0].resizeConsole(resizeModalEndHeight)
          vm.$refs['console' + index][0].resizeServiceConsole(resizeModalEndHeight)
        })

        document.onmousemove = null
        document.onmouseup = null
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
    windowChange () {
      // alert('winChange');
      if (this.editableTabs && this.editableTabs.length > 0) {
        const width = document.body.clientWidth// 可视宽度
        const targetDiv = document.getElementById('shell-service') // e.target.parentNode.parentNode;.children[0]
        const targetDivHeight = targetDiv.offsetHeight
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console' + index][0].resize(targetDivHeight, width)
        })
      }
    },
    // 改变黑窗口字体大小
    changeFontSize (fontSize) {
      // this.$refs['console'+this.index].setFontSize(fontSize);
      this.fontSize = fontSize
      localStorage.setItem('termFontSize', fontSize)
      this.editableTabs.forEach((tab, index) => {
        this.$refs['console' + index][0].setFontSize(fontSize)
      })
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    assetShowChange () {
      this.assetShow = true
      // this.getAssetData()
    },
    getAssetData () {
      this.assetLoading = true
      this.$get('asset/asset', { pageSize: -1 }).then(res => {
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
      }
     setTimeout(()=>{
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
      const base64 = btoa(str)
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
    }
  },
  watch: {
    '$store.state.consoleShow': function (val) {
      if (val) {
        if (this.$store.state.isAddConsole) {
          const id = this.$store.state.consoleParam.id
          const host = this.$store.state.consoleParam.host
          const accountId = this.$store.state.consoleParam.accountId
          const port = this.$store.state.consoleParam.port
          const targetDiv = document.getElementById('shell-service')
          targetDiv.style.height = this.initConsoleHeight + 'px'
          this.show(id, host, accountId, port)
        } else {
          this.consoleShow = true
          // min后，从header区域打开，获得焦点
          this.$nextTick(() => {
            if (this.editableTabs && this.editableTabs.length > 0) {
              this.editableTabs.forEach((tab, index) => {
                if (tab.name === this.editableTabsValue) {
                  this.$refs['console' + index][0].focusConsole()
                }
              })
            }
          })
          const targetDiv = document.getElementById('shell-service')
          targetDiv.style.height = this.webSSHHeight
        }
        this.$store.state.consoleShow = false
      }
    }
  },
  created () {
    // window.addEventListener('resize',this.windowChange);
    window.addEventListener('resize', this.debounce(this.windowChange, 1000), false)
  },
  mounted () {

  },
  beforeDestroy () {
    window.removeEventListener('resize', this.debounce(this.windowChange, 1000), false)
  }
}
</script>
<style scoped>
  .ani-webSHH-height{
    transition: height .25s ease-in;
  }
  .sub-list{
    background: #E4E7ED;
  }
  .flex /deep/ .el-form-item__content{
    display: flex;
  }
  .nz-btn-style-normal-new{
    margin-left: 10px;
    margin-top: 2px;
  }
  /deep/ .custom .el-form-item {
    width: calc(50% - 30px);
    display: inline-block;
  }
  /deep/ .custom .el-form-item:nth-child(even) {
    margin-left: 10px;
  }
  /deep/ .el-select--small{
    width: 100%;
  }
  .custom-footer{
    box-shadow: none;
  }
</style>
<style lang="scss">
  .popover-webshell{
    margin-top: 0 !important;
   .popover-webshell-item{
     padding: 5px;
     font-family: Roboto-Regular;
     font-size: 14px;
     color: #666666;
     font-weight: 400;
     .nz-icon{
       margin-right: 5px;
       font-size: 16px;
     }
   }
    .popover-webshell-item:hover{
      background: #F6F6F6;
      font-family: Roboto-Regular;
      font-size: 14px;
      color: #FA901C;
      font-weight: 400;
    }
    .popper__arrow{
      display: none;
    }
  }
  div.sp-header{
    display: none;
  }
  /deep/ .horizontal .el-menu--horizontal>.el-submenu.is-active .el-submenu__title{
    border: none;
  }
  /deep/ .horizontal .el-menu--popup .el-menu-item.is-active{
    background: #fff;
  }
</style>
