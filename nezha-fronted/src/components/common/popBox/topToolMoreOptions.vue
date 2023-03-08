<template>
  <div>
    <el-dropdown trigger="click" :size="size" class="nz-el-dropdown" v-if="type!=='integration'">
      <button id="more" :class="triggerButtonClass" :title="$t('overall.more')">
        <i class="nz-icon nz-icon-more2"></i>
      </button>
      <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top nz-el-dropdown-menu">
        <el-dropdown-item  v-if="showLock" v-has="'main_edit'">
          <div @click="editPanel" id="edit-bottom-panel"><i class="nz-icon nz-icon-edit"></i>{{$t('dashboard.panel.editPanelTitle')}}</div>
        </el-dropdown-item>
        <el-dropdown-item  v-if="showLock" v-has="'main_edit'">
          <div @click="panelLock=!panelLock" id="panel-lock"><i :class="{'nz-icon nz-icon-lock':!panelLock,'nz-icon nz-icon-unlock':panelLock}"></i>{{!panelLock ? $t("overall.locked") : $t("overall.unlocked")}}</div>
        </el-dropdown-item>
        <!-- import、export之前的内容 -->
        <template>
          <slot name="before"></slot>
        </template>
        <el-dropdown-item v-has="permissions.import" v-if="importUrl">
          <div id="chart-import" @click="showImportBox(1)"><i class="nz-icon nz-icon-upload"></i>{{$t('overall.importExcel')}}</div>
        </el-dropdown-item>
        <el-dropdown-item v-has="permissions.export" v-if="exportUrl">
          <div id="chart-export" @click="showImportBox(2)"><i class="nz-icon nz-icon-download1"></i>{{$t('overall.exportExcel')}}</div>
        </el-dropdown-item>
        <!-- import、export之后的内容 -->
        <template>
          <slot name="after"></slot>
        </template>
      </el-dropdown-menu>
    </el-dropdown>

    <slot v-else></slot>

    <el-dialog
      :close-on-click-modal="importBox.type!=3"
      destroy-on-close
      :show-close="true"
      :title="importBox.title"
      :visible.sync="importBox.show"
      width="580px"
      :append-to-body="true"
      @close="closeDialog"
      :class="{'import-failContent-dialog':importBox.type==3}"
      class="nz-dialog">

      <!-- 新版导入 -->
      <div v-if="importBox.type == 1">
        <div class="upload-body">
          <el-upload :id="id+'-xlsx-input-file'" ref="uploadExcel" :auto-upload="false" :file-list="importFileList" :on-change="importChange" :accept="!isDashboard?'.xlsx,.xls,.csv,.json':'.json'" action="" class="import-upload" drag>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            <div class="el-upload__tip" >{{!isDashboard?$t('overall.importSupport'):$t('overall.supportJson')}}</div>
          </el-upload>
        </div>
        <div class="import-select">
          <div class="exists">
            <span>{{$t('overall.existed')}}</span>
            <el-select v-model="importBox.existed" :popper-append-to-body="false" style="flex:1" size="medium" popper-class="select-auto">
              <el-option
                v-for="item in existedArr"
                :key="item.value"
                :label="item.name"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <ul class="import-select-list">
            <li class="import-select-item">
              <el-checkbox v-model="importBox.ignoreError">{{$t('overall.ignoreError')}}</el-checkbox>
            </li>
            <li v-if="showSyncDashboard" class="import-select-item">
              <el-checkbox v-model="importBox.syncDashboard">{{$t('overall.syncDashboard')}}</el-checkbox>
            </li>
            <li v-if="showSyncEndpoint" class="import-select-item">
              <el-checkbox v-model="importBox.syncEndpoint">{{$t('overall.syncEndpoint')}}</el-checkbox>
            </li>
          </ul>
        </div>
        <div class="footer">
          <div class="el-message-box__btns" style="text-align: right;">
            <el-popover
              v-if="!isDashboard"
              placement="bottom-start"
              trigger="click">
              <div class="template-pop">
                <p style="margin-bottom:8px">{{$t('overall.selectTemplate')}}</p>
                <el-radio-group v-model="importBox.templateFormat" size="small">
                  <el-radio-button :label="item.value" v-for="(item,index) in formatArr" :key="index" @click.native="downloadTemplate(item.value)">{{item.name}}</el-radio-button>
                </el-radio-group>
              </div>
              <button slot="reference" :id="id+'-xlsx-import-template'" class="nz-btn el-button el-button--default el-button--small">
                <span>{{$t('upload.template')}}</span>
                <i class="el-icon-arrow-down el-icon--right"></i>
              </button>
            </el-popover>
            <button :id="id+'-xlsx-import-add'" :class="{'nz-btn-disabled':prevent_opt.import}" :disabled="prevent_opt.import" class="nz-btn el-button el-button--default el-button--small" @click="importExcel">
              <span>{{$t('overall.importExcel')}}</span>
            </button>
            <button :id="id+'-xlsx-import-esc'" class="nz-btn el-button el-button--default el-button--small" @click="closeDialog">
              <span>{{$t('overall.cancel')}}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 导出 -->
      <div v-else-if="importBox.type == 2">
        <div class="upload-body" style="height: 200px">
          <div class="export-box">
            <span class="export-title">{{$t('export.records')}}</span>
            <el-radio-group v-model="importBox.record"  size="small">
              <el-radio-button :label="item.value" v-for="(item,index) in recordArr" :key="index" :disabled="(item.value==='records'&&!deleteObjs.length) || (item.value==='all'&&assetOrEndpoint)">
                {{item.name}}
                <span v-if="item.value==='records'&&deleteObjs.length">({{deleteObjs.length}})</span>
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="export-box">
            <span class="export-title">{{$t('export.fileFormat')}}</span>
            <el-radio-group v-model="importBox.format"  size="small">
              <el-radio-button :label="item.value" v-for="(item,index) in formatArr" :key="index" :disabled="isDashboard&&item.name!='JSON'">{{item.name}}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="footer">
          <div class="el-message-box__btns">
            <button :id="id+'-xlsx-import-export'"  class="nz-btn el-button--small nz-btn-style-normal" @click="exportData">
              <span style="text-transform:Capitalize">{{$t('overall.exportExcel')}}</span>
            </button>
            <button :id="id+'-xlsx-import-close'" class="nz-btn el-button el-button--small el-button--default" @click="closeDialog">
              <span>{{$t('overall.close')}}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 导入结果（展示导出失败记录） -->
      <div v-if="importBox.type==3">
        <div class="upload-body result-body">
          <!-- 失败提示 -->
          <div v-if="importResult&&importResult.failNum">
            <!-- success number-->
            <div class="result-title-top">
              <div class="result-number">
                <span>
                  <i class="nz-icon nz-icon-import-success"/>
                  {{$t('overall.result.successful')}}
                </span>
                <span>{{importResult.successNum}}</span>
              </div>
              <div class="result-number" style="padding-left:20px;">
                <span>
                  <i class="nz-icon nz-icon-New"/>
                  {{$t('overall.result.newQuantity')}}
                </span>
                <span>{{importResult.addNum}}</span>
              </div>
              <div class="result-number" style="padding-left:20px;">
                <span>
                  <i class="nz-icon nz-icon-Update"/>
                  {{$t('overall.result.updates')}}
                </span>
                <span>{{importResult.updateNum}}</span>
              </div>
              <!-- fail number-->
              <div class="result-number fail">
                <span>
                  <i class="nz-icon nz-icon-import-failed"/>
                  {{$t('overall.result.fail')}}
                </span>
                <span>{{importResult.failNum}}</span>
              </div>
            </div>
            <div>
              <div v-if="importResult&&importResult.failDetail" class="result-detail">
                <div style="height: 100%; overflow: auto">
                  <template v-for="(item, index) in importResult.failDetail">
                    <div :key="index" class="import-result-block">
                      <div class="import-result-item">
                        <span class="import-result-item-left">•</span>
                        <div class="import-result-item-right">
                          <span class="line-num">{{$t('overall.result.line',[item.lineNo])}}</span>
                          <span class="line-content" :title="item.errorMsg">{{item.errorMsg}}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <i class="nz-icon nz-icon-override" @click="copyFailDetail(importResult.failDetail)"></i>
              </div>
            </div>
          </div>
          <!-- 成功提示 -->
          <div v-else class="result-success-box">
            <div style="height:80px;line-height:80px;">
              <i class="nz-icon nz-icon-import-success" style="margin-right:0" />
            </div>
            <div style="margin-top:30px">
              <div class="success-number">
                <span>
                  {{$t('overall.result.importedRecords')}}
                </span>
                <span>{{importResult.successNum}}</span>
              </div>
              <div class="success-number" style="margin-top:8px">
                <span>
                  <i class="nz-icon nz-icon-New"/>
                  {{$t('overall.result.newRecords')}}
                </span>
                <span>{{importResult.addNum}}</span>
              </div>
              <div class="success-number" style="margin-top:4px">
                <span>
                  <i class="nz-icon nz-icon-Update"/>
                  {{$t('overall.result.updatedRecords')}}
                </span>
                <span>{{importResult.updateNum}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="el-message-box__btns">
            <button v-if="importResult&&importResult.failNum" :id="id+'-xlsx-import-downloadFail'" class="nz-btn el-button el-button--small nz-btn-style-error" @click="downloadFail">
              <span>{{$t('overall.result.downloadFail')}}</span>
            </button>
            <button :id="id+'-xlsx-import-close'" class="nz-btn el-button el-button--small el-button--default" @click="closeDialog">
              <span>{{$t('overall.close')}}</span>
            </button>
          </div>
        </div>
      </div>

    </el-dialog>
    <transition name="right-box">
      <panel-box v-if="rightBox.panel.show" ref="panelBox" :obj="panel" @close="closePanelBox" :isBottom="true" :panelType="params.from"></panel-box>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
import panelBox from '@/components/common/rightBox/panelBox'
import bus from '@/libs/bus'
let timeout
export default {
  name: 'topToolMoreOptions',
  components: {
    panelBox
  },
  props: {
    size: {
      type: String,
      default: 'medium'
    },
    exportUrl: { type: String, default: '' },
    params: { type: Object },
    params2: { type: Object },
    exportFileName: { type: String },
    importUrl: { type: String, default: '' }, // 为空时不显示导入按钮
    link: { type: Object }, // 为空时不显示导出按钮
    permissions: { type: Object },
    showCur: { type: Boolean, default: true },
    id: { type: String, default: 'export' },
    triggerButtonClass: { // 触发下拉事件的按钮的class
      type: String,
      default: 'top-tool-btn'
    },
    showLock: {
      type: Boolean, default: false
    },
    paramsType: {
      type: String,
      default: ''
    },
    deleteObjs: Array,
    exportBoxShow: {
      type: Boolean, default: false
    },
    type: String
  },
  computed: {
    language () { return this.$store.getters.getLanguage },
    // 判断是否是dashboard
    isDashboard () {
      return this.importUrl === '/visual/panel/import'
    },
    // asset，endpoint dashboard导出选项不支持 all data
    assetOrEndpoint () {
      return this.paramsType === 'asset' || this.paramsType === 'endpoint'
    },
    // 是否同步更新关联的dashboard
    showSyncDashboard () {
      // asset endpoint model
      const arr = ['/asset/asset/import', '/monitor/endpoint/import', '/asset/model/import']
      return arr.some(item => item === this.importUrl)
    },
    // 是否同步更新关联的endpoint
    showSyncEndpoint () {
      // asset module
      const arr = ['/asset/asset/import', '/monitor/module/import']
      return arr.some(item => item === this.importUrl)
    }
  },
  data () {
    return {
      importBox: {
        show: false,
        title: this.$t('overall.importExcel'),
        type: 1,
        record: 'all',
        format: 1,
        templateFormat: 1, // 模板格式
        existed: 0, // 已存在的内容处理方式
        ignoreError: 0, // 遇到错误是否继续导入
        syncDashboard: 0, // 是否同步更新关联的dashboard
        syncEndpoint: 0 // 是否同步更新关联的endpoint
      },
      existedArr: [
        { name: this.$t('overall.error'), value: 0 },
        { name: this.$t('overall.override'), value: 1 },
        { name: this.$t('overall.ignore'), value: 2 }
      ],
      importFile: null,
      importFileList: [],
      importResult: null,
      exportShow: false,
      panelLock: true,
      recordArr: [
        { name: this.$t('overall.allData'), value: 'all' },
        { name: this.$t('overall.selectRecords'), value: 'records' },
        { name: this.$t('overall.current'), value: 'current' }
      ],
      formatArr: [
        { name: 'XLSX', value: 1 },
        { name: 'CSV', value: 2 },
        { name: 'JSON', value: 3 }
      ],
      suffix: '.xlsx',
      faildSuffix: '.xlsx',
      panel: {},
      rightBox: { // 面板弹出框相关
        panel: { show: false },
        loading: false
      }
    }
  },
  mounted () {
    // this.getParamsType()
  },
  methods: {
    // 复制失败记录
    copyFailDetail (data) {
      let txt = ''
      data.forEach((item, index) => {
        txt += '• ' + this.$t('overall.result.line', [item.lineNo]) + ' ' + item.errorMsg + (index + 1 < data.length ? '\n' : '')
      })
      this.$copyText(txt).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    importChange (file, fileList) {
      if (fileList.length > 0) {
        this.importFileList = [fileList[fileList.length - 1]]
      }
      this.importFile = this.importFileList[0]
      const arr = this.importFile.name.split('.')
      this.faildSuffix = '.' + arr[arr.length - 1] // 获取文件后缀名
      this.validateFile()
    },
    validateFile () {

    },
    rollbackImport () {
      let url
      if (this.importUrl.indexOf('/asset/model') > -1) {
        url = '/asset/model/cancelImport'
      } else if (this.importUrl.indexOf('asset') > -1) {
        url = '/asset/asset/cancelImport'
      } else if (this.importUrl.indexOf('endpoint') > -1) {
        url = '/monitor/endpoint/cancelImport'
      } else if (this.importUrl.indexOf('module') > -1) {
        url = '/monitor/module/cancelImport'
      } else if (this.importUrl.indexOf('rule') > -1) {
        url = '/alert/rule/cancelImport'
      } else if (this.importUrl.indexOf('panel') > -1) {
        url = 'visual/panel/cancelImport'
      } else if (this.importUrl.indexOf('tmpl') > -1) {
        url = '/expression/tmpl/cancelImport'
      } else if (this.importUrl.indexOf('dc/cabinet') > -1) {
        url = '/dc/cabinet/cancelImport'
      } else if (this.importUrl.indexOf('dc') > -1) {
        url = '/dc/cancelImport'
      } else if (this.importUrl.indexOf('/ipam/subnet') > -1) {
        url = '/ipam/subnet/cancelImport'
      } else if (this.importUrl.indexOf('/ipam/ip') > -1) {
        url = '/ipam/ip/cancelImport'
      }
      this.$delete(url + '?seq=' + this.importResult.seq).then(response => {
        if (response.code == 200) {
          const linkId = this.link ? this.link.id : ''
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.$emit('afterImport', linkId)
        } else {
          this.$message.error(response.msg)
        }
        this.closeDialog()
      })
    },
    importExcel () {
      if (this.importFile && this.importFile.raw) {
        this.prevent_opt.import = true
        const form = new FormData()
        form.append('file', this.importFile.raw)
        form.append('existed', this.importBox.existed)
        form.append('ignoreError', Number(this.importBox.ignoreError))
        if (this.showSyncDashboard) {
          form.append('syncDashboard', Number(this.importBox.syncDashboard))
        }
        if (this.showSyncEndpoint) {
          form.append('syncEndpoint', Number(this.importBox.syncEndpoint))
        }
        if (this.paramsType) {
          form.append('type', this.paramsType)
          if (this.paramsType === 'asset' || this.paramsType === 'endpoint') {
            form.append('linkId', this.link ? this.link.id : '')
          }
        }
        if (this.importUrl.indexOf('dc/cabinet') > -1) {
          form.append('dcIds', this.params.dcIds)
        }
        // form.append('language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
        this.$post(this.importUrl, form, { 'Content-Type': 'multipart/form-data' }).then(response => {
          if (response.code == 200 && response.msg == 'success') {
            this.importBox.type = 3
            this.importBox.title = this.$t('overall.importResult')
            this.importResult = response.data
            const linkId = this.link ? this.link.id : ''
            this.$emit('afterImport', linkId)
          } else {
            this.$message.error(response.msg)
          }
          this.prevent_opt.import = false
        })
      } else {
        this.$message.error(this.$t('tip.noImportFile'))
      }
    },
    exportMenuHandler (show) {
      if (show) {
        clearTimeout(timeout)
        this.exportShow = true
      } else {
        timeout = setTimeout(() => {
          this.exportShow = false
        }, 700)
      }
    },
    closeDialog () {
      this.importBox.show = false
      setTimeout(() => {
        this.$nextTick(() => {
          this.importResult = null
          this.importFileList = []
          this.importFile = null
          this.importBox.type = 1
          this.importBox.record = 'all'
          this.importBox.format = 1
          this.importBox.templateFormat = 1 // 模板格式
          this.importBox.existed = 0 // 已存在的内容处理方式
          this.importBox.ignoreError = 0 // 遇到错误是否继续导入
          this.importBox.syncDashboard = 0 // 是否同步更新关联的dashboard
          this.importBox.syncEndpoint = 0 // 是否同步更新关联的endpoint
        })
      }, 200)
    },
    downloadTemplate: bus.debounce(function (templateFormat) {
      const language = localStorage.getItem('nz-language') || 'en' // 初始未选择默认 en 英文
      // 导出模板后缀
      let suffix = '.xlsx'
      if (templateFormat == 1) {
        suffix = '.xlsx'
      } else if (templateFormat == 2) {
        suffix = '.csv'
      } else if (templateFormat == 3) {
        suffix = '.json'
      }
      const fileName = this.exportFileName + '-' + this.$t('overall.template') + '-' + this.getTimeString() + suffix
      let url = null
      const param = { language: language, format: templateFormat }
      if (this.importUrl.indexOf('/asset/model') > -1) {
        url = '/asset/model/template'
      } else if (this.importUrl.indexOf('asset') > -1) {
        url = '/asset/asset/template'
        param.type = 'asset'
      } else if (this.importUrl.indexOf('panel') > -1) {
        url = 'visual/panel/template'
        param.type = this.paramsType
      } else if (this.importUrl.indexOf('endpoint') > -1) {
        url = '/monitor/endpoint/template'
        param.type = 'endpoint'
      } else if (this.importUrl.indexOf('module') > -1) {
        url = '/monitor/module/template'
        param.type = 'module'
      } else if (this.importUrl.indexOf('tmpl') > -1) {
        url = '/expression/tmpl/template'
      } else if (this.importUrl.indexOf('alert') > -1) {
        url = '/alert/rule/template'
      } else if (this.importUrl.indexOf('dc/cabinet') > -1) {
        url = '/dc/cabinet/template'
      } else if (this.importUrl.indexOf('dc') > -1) {
        url = '/dc/template'
      } else if (this.importUrl.indexOf('ipam/subnet') > -1) {
        url = '/ipam/subnet/template'
      } else if (this.importUrl.indexOf('ipam/ip') > -1) {
        url = '/ipam/ip/template'
      } else if (this.importUrl.indexOf('record/rule') > -1) {
        url = '/record/rule/template'
      }
      if (!url) {
        console.error('no interface support')
      }
      this.exportExcel(url, param, fileName)
    }, 50),
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    exportCur () {
      const params = JSON.parse(JSON.stringify(this.params))
      if (this.params2) {
        Object.keys(this.params2).forEach(key => {
          if (params[key]) {
            if (params[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(params[key], this.params2[key])
            } else if (params[key].prototype.toString.call(val) === '[object Array]') {
              params[key].concat(this.params2[key])
            }
          } else {
            params[key] = this.params2[key]
          }
        })
      }
      if (this.exportUrl.indexOf('panel') > -1) {
        if (this.paramsType !== 'template') {
          params.pageSize = -1
        }
        delete params.start_time
        delete params.end_time
        delete params.id
        delete params.searchName
        delete params.value
        params.ids = params.panelId
        delete params.panelId
      }
      params.language = localStorage.getItem('nz-language') || 'en'
      params.format = this.importBox.format
      delete params.statistics
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + this.suffix)
      this.closeDialog()
    },
    exportAll () {
      const params = JSON.parse(JSON.stringify(this.params))
      if (this.params2) {
        Object.keys(this.params2).forEach(key => {
          if (params[key]) {
            if (params[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(params[key], this.params2[key])
            } else if (params[key].prototype.toString.call(val) === '[object Array]') {
              params[key].concat(this.params2[key])
            }
          } else {
            params[key] = this.params2[key]
          }
        })
      }
      params.pageSize = -1
      if (this.exportUrl.indexOf('panel') > -1) {
        delete params.start_time
        delete params.end_time
        delete params.id
        delete params.searchName
        delete params.value
        delete params.panelId
      }
      // if (this.importUrl.indexOf('endpoint') > -1){
      //   delete params.moduleId
      // }
      params.language = localStorage.getItem('nz-language') || 'en'
      params.format = this.importBox.format
      delete params.statistics
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + this.suffix)
      this.closeDialog()
    },
    exportRecords () {
      const params = JSON.parse(JSON.stringify(this.params))
      if (this.params2) {
        Object.keys(this.params2).forEach(key => {
          if (params[key]) {
            if (params[key].prototype.toString.call(val) === '[object Object]') {
              Object.assign(params[key], this.params2[key])
            } else if (params[key].prototype.toString.call(val) === '[object Array]') {
              params[key].concat(this.params2[key])
            }
          } else {
            params[key] = this.params2[key]
          }
        })
      }
      params.pageSize = -1
      if (this.exportUrl.indexOf('panel') > -1) {
        delete params.start_time
        delete params.end_time
        delete params.id
        delete params.searchName
        delete params.value
        delete params.panelId
      }
      // if (this.importUrl.indexOf('endpoint') > -1){
      //   delete params.moduleId
      // }
      params.language = localStorage.getItem('nz-language') || 'en'
      params.format = this.importBox.format
      params.ids = this.deleteObjs.map(item => item.id).join(',')
      delete params.statistics
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + this.suffix)
      this.closeDialog()
    },
    exportData () {
      if (this.importBox.format == 1) {
        this.suffix = '.xlsx'
      } else if (this.importBox.format == 2) {
        this.suffix = '.csv'
      } else if (this.importBox.format == 3) {
        this.suffix = '.json'
      } else if (this.importBox.format == 4) {
        this.suffix = '.pdf'
        this.$emit('export', 'PDF')
        return
      } else if (this.importBox.format == 5) {
        this.suffix = '.html'
        this.$emit('export', 'Html')
        return
      }
      if (this.importBox.record === 'all') {
        this.exportAll()
      } else if (this.importBox.record === 'current') {
        this.exportCur()
      } else if (this.importBox.record === 'records') {
        this.exportRecords()
      }
    },
    exportExcel (url, params, fileName) {
      if (this.paramsType) {
        params.type = this.paramsType
      }
      if (this.assetOrEndpoint) {
        delete params.type
        delete params.from
      }
      axios.get(url, { responseType: 'blob', params: params }).then(res => {
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
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    // 导出失败记录
    downloadFail () {
      const result = this.importResult.failContent
      const raw = window.atob(result)
      const uInt8Array = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) {
        uInt8Array[i] = raw.charCodeAt(i)
      }
      const link = document.createElement('a')
      const blob = new Blob([uInt8Array])
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'failed_records' + '-' + this.getTimeString() + this.faildSuffix)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    showImportBox (type) {
      this.importBox.show = true
      this.importBox.type = type

      if (this.assetOrEndpoint) {
        this.importBox.record = 'current'
      }
      // isDashboard 只支持JSON
      if (this.isDashboard) {
        this.importBox.format = 3
      }
      if (type == 2 && (!this.showCur)) {
        this.exportCur()
        return
      }
      if (type == 1) { // import
        this.importBox.title = this.$t('overall.importExcel')
      } else if (type == 2) { // export
        this.importBox.title = this.$t('overall.exportExcel')
        // if (this.exportBoxShow) {
        //   this.formatArr = [
        //     { name: 'XLSX', value: 1 },
        //     { name: 'CSV', value: 2 },
        //     { name: 'JSON', value: 3 },
        //     { name: 'PDF', value: 4 },
        //     { name: 'Html', value: 5 }]
        // } else {
        //   this.formatArr = [{ name: 'XLSX', value: 1 },
        //     { name: 'CSV', value: 2 },
        //     { name: 'JSON', value: 3 }]
        // }
      }
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    editPanel () {
      this.$get('visual/panel/' + this.params.panelId).then(res => {
        if (res.code === 200) {
          this.panel = res.data
          if (!this.$loadsh.get(this.panel, 'param.report', '')) {
            this.panel = {
              ...this.panel,
              param: {
                report: {
                  enable: false,
                  range: {
                    unit: 'day'
                  },
                  schedule: {
                    type: '2',
                    repeat: 1,
                    nums: [],
                    stime: '',
                    etime: ''
                  },
                  receivers: []
                },
                chartShare: 'none'
              }
            }
          }
          this.panel.param.report.schedule.type = this.panel.param.report.schedule.type + ''
          const startTime = this.$loadsh.get(this.panel, 'param.report.schedule.stime', '')
          if (startTime !== '') {
            this.panel.param.report.schedule.stime = this.utcTimeToTimezoneStr(this.panel.param.report.schedule.stime, 'YYYY-MM-DD HH:mm:ss')
          } else {
            this.panel.param.report.schedule.stime = ''
          }
          const endTime = this.$loadsh.get(this.panel, 'param.report.schedule.etime', '')
          if (endTime !== '') {
            this.panel.param.report.schedule.etime = this.utcTimeToTimezoneStr(this.panel.param.report.schedule.etime, 'YYYY-MM-DD HH:mm:ss')
          } else {
            this.panel.param.report.schedule.etime = ''
          }
          this.rightBox.panel.show = true
        }
      })
      // this.panel = Object.assign({}, u)panelType
    },
    closePanelBox (refresh) {
      this.rightBox.panel.show = false
      if (refresh) {
        this.$emit('afterImport')
      }
    }
  },
  watch: {
    panelLock: {
      immediate: true,
      handler (n) {
        this.$emit('panelLockChange', n)
      }
    }
  }
}
</script>
