<template>
  <el-dropdown :size="size">
    <button id="more" :class="triggerButtonClass" title="more...">
      <i class="nz-icon nz-icon-arrow-down" style="font-size: 12px;"></i>
    </button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-if="showLock">
        <div @click="panelLock=!panelLock" id="panel-lock"><i :class="{'nz-icon nz-icon-lock':panelLock,'nz-icon nz-icon-unlock':!panelLock}"></i>{{panelLock ? $t("overall.locked") : $t("overall.unlocked")}}</div>
      </el-dropdown-item>
      <!-- import、export之前的内容 -->
      <slot name="before"></slot>
      <el-dropdown-item v-if="importUrl">
        <div id="chart-import" @click="showImportBox(1)"><i class="nz-icon nz-icon-upload"></i>{{$t('overall.importExcel')}}</div>
      </el-dropdown-item>
      <el-dropdown-item v-if="exportUrl">
        <div id="chart-export"@click="showImportBox(2)"><i class="nz-icon nz-icon-download1"></i>{{$t('overall.exportExcel')}}</div>
      </el-dropdown-item>
      <!-- import、export之后的内容 -->
      <slot name="after"></slot>
    </el-dropdown-menu>

    <el-dialog :close-on-click-modal="importBox.type!=3" :show-close="true" :title="importBox.title" :visible.sync="importBox.show" :width="importBox.width" append-to-body class="nz-dialog" @close="closeDialog">
      <div v-if="importBox.type == 1">
        <div class="upload-body">
          <el-upload :id="id+'-xlsx-input-file'" ref="uploadExcel" :auto-upload="false"  :file-list="importFileList" :on-change="importChange" accept=".xlsx,.xls"  action="" class="upload-demo" drag>
            <div slot="tip" class="el-upload__tip" >{{$t('overall.importTip')}}</div>
            <i class="nz-icon nz-icon-upload"></i>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
          </el-upload>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns" style="text-align: right;">
            <button :id="id+'-xlsx-import-template'" class="el-button el-button--default el-button--small" @click="downloadTemplate">
              <span>{{$t('overall.template')}}</span>
            </button>
            <button  :id="id+'-xlsx-import-add'" :class="{'nz-btn-disabled':prevent_opt.import}" :disabled="prevent_opt.import" class="nz-btn el-button el-button--default el-button--small" @click="importExcel">
              <span>{{$t('overall.importExcel')}}</span>
            </button>
            <button :id="id+'-xlsx-import-esc'" class="el-button el-button--default el-button--small" @click="closeDialog">
              <span>{{$t('overall.cancel')}}</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="importBox.type == 2">
        <div class="upload-body">
          <button :id="id+'-xlsx-export-current'"  class="el-button el-button--default el-button--small" @click="exportCur">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button  :id="id+'-xlsx-export-all'"  class="el-button el-button--default el-button--small" @click="exportAll">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
        <div slot="footer" class="footer">
        </div>
      </div>
      <div v-if="importBox.type==3">
        <div class="upload-body result-body">
          <div>
            <span class="result-title">{{$t('overall.result.total')}}:</span>
            <span>{{importResult&&importResult.totalNum?importResult.totalNum:0}}</span>
          </div>
          <div>
            <span class="result-title">{{$t('overall.result.failed')}}:</span>
            <span>{{importResult&&importResult.failNum?importResult.failNum:0}}</span>
            <span class="result-title">{{$t('overall.result.success')}}:</span>
            <span>{{importResult&&importResult.successNum?importResult.successNum:0}}</span>
          </div>
          <div>
            <div class="result-title">{{$t('overall.result.failedDetail')}}:</div>
            <div v-if="importResult&&importResult.failDetail" class="result-detail">
              <div style="height: 100%; overflow: auto;">
                <template v-for="(item, index) in importResult.failDetail">
                  <div :key="index" class="import-result-block">
                    <div class="import-result-item">
                      <div class="line-num">{{$t('overall.result.line',[item.lineNo])}}</div>
                      <div>{{item.errorMsg}}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns">
            <button :id="id+'-xlsx-import-rollback'"  class="nz-btn nz-btn-size-normal-new nz-btn-style-error-new" @click="rollbackImport">
              <span>{{$t('overall.rollbackImport')}}</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-dropdown>
</template>

<script>
import axios from 'axios'
let timeout
export default {
  name: 'topToolMoreOptions',
  props: {
    size: {
      type: String,
      default: 'small'
    },
    exportUrl: { type: String, default: '' },
    params: { type: Object },
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
    }
  },
  data () {
    return {
      importBox: { show: false, title: this.$t('overall.importExcel'), type: 1 },
      importFile: null,
      importFileList: [],
      importResult: null,
      exportShow: false,
      paramsType: '',
      panelLock: true
    }
  },
  mounted () {
    this.getParamsType()
  },
  methods: {
    importChange (file, fileList) {
      if (fileList.length > 0) {
        this.importFileList = [fileList[fileList.length - 1]]
      }
      this.importFile = this.importFileList[0]
      this.validateFile()
    },
    validateFile () {

    },
    rollbackImport () {
      let url
      if (this.importUrl.indexOf('asset') > -1) {
        url = '/asset/asset/cancelImport'
      } else if (this.importUrl.indexOf('endpoint') > -1) {
        url = '/monitor/endpoint/cancelImport'
      } else if (this.importUrl.indexOf('rule') > -1) {
        url = '/alert/rule/cancelImport'
      } else if (this.importUrl.indexOf('panel') > -1) {
        url = 'visual/panel/cancelImport'
      } else if (this.importUrl.indexOf('tmpl') > -1) {
        url = '/expression/tmpl/cancelImport'
      }
      this.$delete(url + '?seq=' + this.importResult.seq).then(response => {
        if (response.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.$emit('afterImport')
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
        form.append('excelFile', this.importFile.raw)
        if (this.paramsType) {
          form.append('type', this.paramsType)
          if (this.paramsType === 'asset' || this.paramsType === 'model') {
            form.append('linkId', this.link ? this.link.id : '')
          }
        }
        form.append('language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
        this.$post(this.importUrl, form, { 'Content-Type': 'multipart/form-data' }).then(response => {
          if (response.code == 200 && response.msg == 'success') {
            this.importResult = response.data
            this.$emit('afterImport')
            this.importBox.type = 3
            this.importBox.width = '600px'
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
      this.importResult = null
      this.importFileList = []
      this.importFile = null
    },
    downloadTemplate () {
      const language = localStorage.getItem('nz-language') || 'en' // 初始未选择默认 en 英文
      const fileName = this.exportFileName + '-' + this.$t('overall.template') + '-' + this.getTimeString() + '.xlsx'

      let url = null
      const param = { language: language }
      if (this.exportFileName.indexOf('asset') > -1) {
        url = '/asset/asset/template'
        param.type = 'asset'
      } else if (this.exportFileName.indexOf('dashboard') > -1) {
        url = 'visual/panel/template'
      } else if (this.exportFileName.indexOf('endpoint') > -1) {
        url = '/monitor/endpoint/template'
        param.type = 'endpoint'
      } else if (this.importUrl.indexOf('tmpl') > -1) {
        url = '/expression/tmpl/template'
      }

      if (!url) {
        console.error('no interface support')
      }
      this.exportExcel(url, param, fileName)
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    exportCur () {
      const params = JSON.parse(JSON.stringify(this.params))
      if (this.exportUrl.indexOf('panel') > -1) {
        params.pageSize = -1
        delete params.start_time
        delete params.end_time
        delete params.id
        delete params.searchName
      }
      params.language = localStorage.getItem('nz-language') || 'en'
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.xlsx')
      this.closeDialog()
    },
    exportAll () {
      const params = JSON.parse(JSON.stringify(this.params))
      params.pageSize = -1
      if (this.exportUrl.indexOf('panel') > -1) {
        delete params.start_time
        delete params.end_time
        delete params.id
        delete params.searchName
      }
      if (this.importUrl.indexOf('panel') > -1) {
        delete params.panelId
      }
      // if (this.importUrl.indexOf('endpoint') > -1){
      //   delete params.moduleId
      // }
      params.language = localStorage.getItem('nz-language') || 'en'

      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.xlsx')
      this.closeDialog()
    },
    exportExcel (url, params, fileName) {
      if (this.paramsType) {
        params.type = this.paramsType
      }
      if (params.from == 'asset') {
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
    showImportBox (type) {
      this.importBox.show = true
      this.importBox.type = type
      if (type == 2 && (!this.showCur)) {
        this.exportCur()
        return
      }
      if (type == 1) { // import
        this.importBox.title = this.$t('overall.importExcel')
        this.importBox.width = '600px'
      } else if (type == 2) { // export
        this.importBox.title = this.$t('overall.exportExcel')
        this.importBox.width = '300px'
      }
    },
    getTimeString () {
      const split = '-'
      const date = new Date()
      const year = date.getFullYear()
      const month = this.formatNum(date.getMonth() + 1)
      const day = this.formatNum(date.getDate())
      const hours = this.formatNum(date.getHours())
      const minutes = this.formatNum(date.getMinutes())
      const seconds = this.formatNum(date.getSeconds())
      return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds
    },
    formatNum (num) {
      return num > 9 ? num : '0' + num
    },
    getParamsType () {
      const path = this.$route.path
      switch (path) {
        case '/panel': this.paramsType = 'dashboard'; break
        case '/asset': this.paramsType = 'asset'; break
        case '/model': this.paramsType = 'model'; break
        default: this.paramsType = ''; break
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

<style scoped>

</style>
