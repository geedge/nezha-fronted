<template>
  <div class="export-xlsx">
    <div class="top-tool-btn-group">
      <slot name="optionZone"></slot>
      <button id="browser-go" v-has="[permissions.import, permissions.export]" class="top-tool-btn top-tool-btn--dropdown" @mouseenter="exportMenuHandler(true)" @mouseleave="exportMenuHandler(false)">
        <i class="nz-icon nz-icon-arrow-down" style="font-size: 12px;"></i>
        <transition name="el-zoom-in-top">
          <ul v-show="exportShow" class="el-dropdown-menu el-popper el-dropdown-menu--mini nz-dropdown">
            <li @click="showImportBox(1)" class="el-dropdown-menu__item dropdown-content" v-has="permissions.import" :id="id+'-xlsx-import'"><i class="nz-icon nz-icon-upload"></i>{{$t('overall.importExcel')}}</li>
            <li @click="showImportBox(2)" class="el-dropdown-menu__item dropdown-content" v-has="permissions.export" :id="id+'-xlsx-export'"><i class="nz-icon nz-icon-download1"></i>{{$t('overall.exportExcel')}}</li>
          </ul>
        </transition>
      </button>
    </div>

    <el-dialog :close-on-click-modal="importBox.type!=3" :show-close="true" :title="importBox.title" :visible.sync="importBox.show" :width="importBox.width" append-to-body class="nz-dialog" @close="closeDialog">
      <div v-if="importBox.type == 1">
        <div class="upload-body">
          <el-upload drag class="upload-demo" ref="uploadExcel"  action="" :file-list="importFileList" :on-change="importChange"  :auto-upload="false" accept=".xlsx,.xls" :id="id+'-xlsx-input-file'">
            <div slot="tip" class="el-upload__tip" >{{$t('overall.importTip')}}</div>
            <i class="nz-icon nz-icon-upload"></i>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            <!--<button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
              <span class="top-tool-btn-txt" >{{$t('overall.upload')}}</span>
            </button>-->
          </el-upload>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns" style="text-align: right;">
            <button :id="id+'-xlsx-import-template'" class="el-button el-button--default el-button--small" @click="downloadTemplate">
              <span>{{$t('upload.template')}}</span>
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
          <button @click="exportCur"  class="el-button el-button--default el-button--small" :id="id+'-xlsx-export-current'">
            <span>{{$t('overall.current')}}</span>
          </button>
          <button  @click="exportAll"  class="el-button el-button--default el-button--small" :id="id+'-xlsx-export-all'">
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
                <div class="result-detail" v-if="importResult&&importResult.failDetail">
                  <div style="height: 100%; overflow: auto;">
                   <!-- <ul>
                      <li v-for="(item,index) in importResult.failDetail"><span>{{item.lineNo}}</span>:<span>{{item.errorMsg}}</span> </li>
                    </ul>-->
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
              <button :id="id+'-xlsx-import-rollback'"  class="nz-btn nz-btn-size-normal nz-btn-style-error" @click="rollbackImport">
                <span>{{$t('overall.rollbackImport')}}</span>
              </button>
            </div>
          </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
let timeout
export default {
  name: 'exportXLSX',
  props: {
    exportUrl: { type: String, required: true },
    params: { type: Object },
    exportFileName: { type: String },
    importUrl: { type: String, required: true },
    link: { type: Object },
    permissions: { type: Object },
    showCur: { type: Boolean, default: true },
    id: { type: String, default: 'export' }
  },
  data () {
    return {
      importBox: { show: false, title: this.$t('overall.importExcel'), type: 1 },
      importFile: null,
      importFileList: [],
      importResult: null,
      exportShow: false,
      paramsType: ''
    }
  },
  created () {
  },
  mounted () {
    this.getParamsType()
  },
  /* watch: {
      permissions: {
        immediate: true,
        deep: true,
        handler(n) {
          this.permission = Object(n);
        }
      }
    }, */
  methods: {
    importChange (file, fileList) {
      if (fileList.length > 0) {
        this.importFileList = [fileList[fileList.length - 1]]
      }
      this.importFile = this.importFileList[0]
      this.validateFile()
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
        url = '/panel/cancelImport'
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
      if (this.importUrl.indexOf('asset') > -1) {
        url = '/asset/asset/template'
      } else if (this.importUrl.indexOf('rule') > -1) {
        url = '/alert/rule/template'
      } else if (this.importUrl.indexOf('panel') > -1) {
        url = '/panel/template'
      } else if (this.importUrl.indexOf('endpoint') > -1) {
        url = '/monitor/endpoint/template'
      } else if (this.importUrl.indexOf('tmpl') > -1) {
        url = '/expression/tmpl/template'
      }

      const param = { language: language }
      if (!url) {
        console.error('no interface support')
      }
      this.exportExcel(url, param, fileName)
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    exportCur () {
      const params = Object.assign({}, this.params)
      params.language = localStorage.getItem('nz-language') || 'en'
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.xlsx')
      this.closeDialog()
    },
    exportAll () {
      const params = JSON.parse(JSON.stringify(this.params))
      params.pageSize = -1
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
  }
}
</script>

<style scoped>
  /*去除上传文件动画start*/
  /*.upload-demo {*/
  /*  display: flex;*/
  /*}*/
  /deep/ .el-list-enter-active,
  /deep/ .el-list-leave-active {
    transition: none;
  }
  .nz-tab {
    margin-bottom: 22px;
    margin-left: 13px;
  }
  /deep/ .el-list-enter,
  /deep/ .el-list-leave-active {
    opacity: 0;
  }
  /deep/ .el-upload-list {
    height: 40px;
  }
  /*去除上传文件动画end*/
</style>

<style>
  .result-detail .import-result-block{
  }
  .result-detail .import-result-block .import-result-item{
    display: flex;
  }
  .import-result-item .line-num{
    /*width: 55px;*/
  }

  .endpoint-query-dropdown {
    position: absolute;
    right: 0;
    top: 31px;
  }
  .nz-dropdown {
    width: 90px;
    right: 0;
    left: unset !important;
    top: 35px;
  }
  .endpoint-query-dropdown::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 5px;
    border-style: dashed dashed solid dashed;
    border-color: transparent transparent #fff transparent;
    position: absolute;
    right: 3px;
    bottom: 0;
  }
  .endpoint-query-dropdown::after {
    transform: translate(-50%, -45px);
  }
  .export-xlsx .el-dialog__body{
    padding: 10px 20px 20px 20px;
  }
  .export-xlsx .el-button:focus, .export-xlsx .el-button:hover {
    color: unset;
    border-color: unset;
    background-color:unset;
  }
  .dropdownBtn .el-button--primary{
    top:2px;
    padding: 0 8px;
    background-image: linear-gradient(180deg, #fff 0%, #E0E0E0 100%);
    border: 0;
    color: #666;
    -webkit-box-shadow: 0 0 1px 1px rgba(162,162,162,0.5);
    box-shadow: 0 0 1px 1px rgba(162,162,162,0.5);
    letter-spacing: 0;
    background-color: unset;
  }
  .dropdownBtn .el-button--primary:hover{
    background-image: linear-gradient(180deg, #F0F0F0 0%, #D8D8D8 99%) !important;
  }
  .dropdownBtn .el-button--mini{
    font-size: 12px;
    height: 24px;
  }
  .dropdownBtn .el-button--mini:first-of-type {
    right: 3px;
  }
  .el-dropdown .el-button-group{
    display: block;
    position: relative;
    top:-2px;
  }
  .export-xlsx .el-dropdown .el-dropdown__caret-button {
    padding-left: 5px;
    padding-right: 5px;
    border-left: none;
    top: 0;
    left: -1px;
  }
</style>
