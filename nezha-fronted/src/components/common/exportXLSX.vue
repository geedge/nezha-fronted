<template>
  <div class="export-xlsx">
    <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light">
      <slot name="optionZone"></slot><button @mouseenter="exportMenuHandler(true)" @mouseleave="exportMenuHandler(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go" style="padding: 0" v-has="[permissions.import, permissions.export]">
        <i class="nz-icon nz-icon-arrow-down"></i>
        <transition name="el-zoom-in-top">
          <ul class="el-dropdown-menu el-popper el-dropdown-menu--mini export-dropdown" style="z-index: 101" v-show="exportShow">
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
            <button @click="downloadTemplate"  class="el-button el-button--default el-button--small" :id="id+'-xlsx-import-template'">
              <span>{{$t('overall.template')}}</span>
            </button>
            <button  @click="importExcel"  class="nz-btn el-button el-button--default el-button--small" :disabled="prevent_opt.import" :class="{'nz-btn-disabled':prevent_opt.import}" :id="id+'-xlsx-import-add'">
              <span>{{$t('overall.importExcel')}}</span>
            </button>
            <button @click="closeDialog"  class="el-button el-button--default el-button--small" :id="id+'-xlsx-import-esc'">
              <span>{{$t('overall.cancel')}}</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="importBox.type == 2">
        <div class="upload-body">
          <button @click="exportCur"  class="el-button el-button--default el-button--small" :id="id+'-xlsx-export-current'">
            <span>{{$t('overall.exportCur')}}</span>
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
              <button @click="rollbackImport"  class="nz-btn nz-btn-size-normal-new nz-btn-style-error-new" :id="id+'-xlsx-import-rollback'">
                <span>{{$t('overall.rollbackImport')}}</span>
              </button>
              <!--<button  @click="closeDialog"  class="el-button el-button&#45;&#45;default el-button&#45;&#45;small">-->
                <!--<span>{{$t('overall.cancel')}}</span>-->
              <!--</button>-->
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
  data: function () {
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
    importChange: function (file, fileList) {
      if (fileList.length > 0) {
        this.importFileList = [fileList[fileList.length - 1]]
      }
      this.importFile = this.importFileList[0]
      this.validateFile()
    },
    validateFile: function () {

    },
    rollbackImport: function () {
      let url
      if (this.importUrl.indexOf('asset') > -1) {
        url = '/asset/cancelImport'
      } else if (this.importUrl.indexOf('endpoint') > -1) {
        url = '/endpoint/cancelImport'
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
    importExcel: function () {
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
    closeDialog: function () {
      this.importBox.show = false
      this.importResult = null
      this.importFileList = []
      this.importFile = null
    },
    downloadTemplate: function () {
      const language = localStorage.getItem('nz-language') || 'en' // 初始未选择默认 en 英文
      const fileName = this.exportFileName + '-' + this.$t('overall.template') + '-' + this.getTimeString() + '.xlsx'

      let url = null
      if (this.importUrl.indexOf('asset') > -1) {
        url = '/asset/template'
      } else if (this.importUrl.indexOf('rule') > -1) {
        url = '/alert/rule/template'
      } else if (this.importUrl.indexOf('panel') > -1) {
        url = '/panel/template'
      } else if (this.importUrl.indexOf('endpoint') > -1) {
        url = '/endpoint/template'
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
    exportCur: function () {
      const params = Object.assign({}, this.params)
      params.language = localStorage.getItem('nz-language') || 'en'
      this.exportExcel(this.exportUrl, params, this.exportFileName + '-' + this.getTimeString() + '.xlsx')
      this.closeDialog()
    },
    exportAll: function () {
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
    exportExcel: function (url, params, fileName) {
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
    showImportBox: function (type) {
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
    getTimeString: function () {
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
    formatNum: function (num) {
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
    width: 55px;
  }
</style>
