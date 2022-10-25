<template>
  <div class="license">
    <div class="license-left">
      <div class="license-left-header" :class="{'license-left-header-red':active !== 0}">
        <div>
         <div class="license-left-header-icon">
           <!-- 是否激活 -->
           <i v-if="active === 0" class="nz-icon nz-icon-import-success"></i>
           <i v-else class="nz-icon nz-icon-import-failed1"></i>
         </div>
          <div>{{$t('license.nzTitleValue')}}</div>
        </div>
        <div v-if="active === 0">{{$t('overall.active')}}</div>
        <div v-else>{{$t('license.inactive')}}</div>
      </div>
      <div class="license-left-body">
        <div>
          <div class="license-left-boyd-title" style="margin-top: 25px">{{$t('overall.type')}}</div>
          <div class="license-left-boyd-value">{{ licenseMark.type ? licenseMark.type : '-'}}</div>
        </div>
        <div>
          <div class="license-left-boyd-title">{{$t('license.organization')}}</div>
          <div class="license-left-boyd-value">{{ licenseMark.organization ? licenseMark.organization : '-'}}</div>
        </div>
        <div>
          <div class="license-left-boyd-title">{{$t('license.id')}}</div>
          <div class="license-left-boyd-value">{{ licenseMark.supportID ? licenseMark.supportID : '-'}}</div>
        </div>
        <div>
          <div class="license-left-boyd-title">{{$t('license.proDate')}}</div>
          <div class="license-left-boyd-value">
            <span v-if="licenseList.production_date">{{licenseList.production_date}}</span>
            <span v-else>-</span>
          </div>
        </div>
        <div>
          <div class="license-left-boyd-title">{{$t('license.expDate')}}</div>
          <div class="license-left-boyd-value">
            <span v-if="expData.id === '20001' && expData.license.license_type === 'expiration'">{{expData.license.exp_date}}</span>
            <span v-else-if="expData.id === '20001' && expData.license.license_type === 'perpetual'">{{$t('license.permanent')}}</span>
            <span v-else-if="expData.id === '20001' && expData.license.license_type === 'trial'">{{stateItem}} ~ {{endItem}}</span>
            <span v-else>-</span>
          </div>
        </div>
      </div>
      <div class="license-left-footer">
        <div class="license-left-footer-download" @click="downloadLicense">
          <i class="nz-icon nz-icon-download"></i><span>{{$t('license.downloadID')}}</span>
        </div>
        <div class="license-left-footer-download" @click="openQrcode" style="margin-left: 5px">
          <i class="nz-icon nz-icon-erweima"></i>
        </div>
        <el-upload
          ref="upload"
          accept=".xml"
          action=""
          v-has="'system_license_edit'"
          class="license-left-footer-upload"
          :file-list="uploadFileList"
          :auto-upload="false"
          :on-change="handleChange"
        >
          <i class="nz-icon nz-icon-Upload1"></i><span>{{$t('license.uploadLicense')}}</span>
        </el-upload>
      </div>
    </div>
    <div class="license-right">
      <div class="license-right-header">
        <div class="license-right-header-title">{{$t('license.devices')}}&nbsp;({{tableData ? tableData.length : 0}})</div>
      </div>
      <div class="license-right-table">
        <el-table :data="tableData" v-my-loading="loading">
          <el-table-column v-for="(item, index) in tableTitle" :key="index">
            <template slot="header">
              <span class="data-column__span">{{item.label}} <i class="nz-icon nz-icon-label" v-if="item.type==='label'"/></span>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop === 'devicesName'">
                <span>{{getLicense(scope.row)}}</span>
              </template>
              <template v-else-if="item.prop === 'status'">
                <div v-if="scope.row.status === 0">
                  <div class="active-icon green-bg inline-block"></div> {{ $t('overall.active') }}
                </div>
                <div v-else-if="scope.row.status !== 0">
                  <div class="active-icon red-bg inline-block"></div> {{ $t('license.inactive') }}
                </div>
              </template>
              <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog :modal-append-to-body='false' :fullscreen="dialogQrType === 'all'" :show-close="true" :visible.sync="qrCodeShow" @close="closeQrCode" :title="'QR code'" class="nz-dialog overview" width="650px">
      <div slot="title">
        <span class="el-dialog__header-title">
           QR code
        </span>
        <div style="float: right; margin-right: 25px">
          <el-button-group>
            <el-button class="top-tool-btn" :class="{active: dialogQrType == 'item' }" size="small" @click="dialogQrType = 'item'"><i class="nz-icon nz-icon-dangemoshi"/></el-button>
            <el-button class="top-tool-btn" :class="{active: dialogQrType == 'all' }" size="small" @click="dialogQrType = 'all'"><i class="nz-icon nz-icon-duogemoshi"/></el-button>
          </el-button-group>
        </div>
      </div>
      <div v-show="dialogQrType === 'item'">
        <el-carousel arrow="never" :autoplay="false" :height="'500px'" ref="carousel" v-my-loading="qrloading">
          <el-carousel-item v-for="(item, index) in qrCodeNum" :key="index" :name="'qr-' + index"  style="width: 100%;height: 100%">
            <!--            :logo-src="getSrc(index)"-->
            <div  v-my-loading="item">
              <vueQr
                style="width: 500px;height: 500px"
                :text="qrCodeArr[index] || index"
                :size="2000"
                :margin="50"
              />
            </div>
          </el-carousel-item>
        </el-carousel>
        <div class="nz-license-footer">
          <el-pagination
            @current-change="setActiveItem"
            small
            :page-size="1"
            :current-page.sync="currentPage"
            layout="prev, pager, next"
            :total="qrCodeNum.length">
          </el-pagination>
        </div>
      </div>
      <div v-show="dialogQrType === 'all'" style="display: flex;flex-wrap: wrap;justify-content: center" v-my-loading="qrloading">
        <div v-for="(item, index) in qrCodeNum" :key="index" :name="'qr-' + index" :style="{
          width: qrWidth + 'px',
          height: qrWidth + 'px'
        }"
             v-my-loading="item"
        >
          <!--            :logo-src="getSrc(index)"-->
          <vueQr
            :style="{
              width: qrWidth - 32 + 'px',
              height: qrWidth - 32 + 'px'
            }"
            :text="qrCodeArr[index] || index"
            :size="2000"
            :margin="10"
          />
          <div style="text-align: center"> {{index+1}} / {{qrCodeNum.length}}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import VueQr from '@/components/common/vueQR/packages/vue-qr'
import SparkMD5 from 'spark-md5'
// import VueQr from 'vue-qr'
// import { AwesomeQR } from 'awesome-qr'
export default {
  name: 'license',
  components: {
    vueQr: VueQr
  },
  data () {
    return {
      licenseList: {},
      licenseMark: {},
      tableData: [],
      tableTitle: [
        {
          label: this.$t('asset.server'),
          prop: 'devicesName'
        },
        {
          label: this.$t('overall.state'),
          prop: 'status'
        }
      ],
      expData: {},
      uploadFileList: [],
      uploadFile: { file: '' },
      active: 0,
      loading: true,
      stateItem: '',
      endItem: '',
      qrCodeShow: false,
      qrCodeArr: [],
      qrCodeNum: [], // 逐个加载 qr
      totalQrCode: 10,
      currentPage: 1,
      qrloading: false,
      dialogQrType: 'item',
      boxWidth: '',
      boxHeight: '',
      qrWidth: 10
    }
  },
  methods: {
    licenseGetData () {
      this.$get('/sys/license/detail').then(res => {
        if (res.code === 200) {
          this.licenseMark = res.data.license
          this.licenseList = res.data.license.hasp
          this.licenseList.production_date = bus.timeFormate(bus.computeTimezone(this.licenseList.production_date * 1000))
          this.licenseList.feature.map(e => {
            if (e.id === '20001') {
              this.expData = e
              this.expData.license.exp_date = bus.timeFormate(bus.computeTimezone(this.expData.license.exp_date * 1000))
              this.stateItem = bus.timeFormate(bus.computeTimezone(e.license.time_start * 1000))
              this.endItem = bus.timeFormate(bus.computeTimezone(e.license.time_start * 1000)) + bus.timeFormate(bus.computeTimezone(e.license.end_time * 1000))
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
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
    licenseGetStatus () {
      this.$get('/sys/license/status').then(res => {
        if (res.code === 200) {
          if (res.data) {
            this.active = res.data.status
          }
        } else {
          this.$message.error(res.msg)
        }
      })
      this.$get('/sys/license/status', { scope: 'all' }).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.list
          this.loading = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleChange (file, fileList) {
      if (fileList.length > 0) {
        this.uploadFileList = [fileList[fileList.length - 1]]
      }
      this.uploadFile.file = this.uploadFileList[0]
      this.upload()
    },
    upload () {
      const form = new FormData()
      form.append('file', this.uploadFile.file.raw)
      this.$post('/sys/license/upload', form).then(res => {
        if (res.code == 200) {
          this.licenseGetStatus()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    downloadLicense () {
      this.$get('/sys/license/token').then(res => {
        let fileName = ''
        const resFileName = res.headers['content-disposition'].split('=')[1]
        if (resFileName) {
          fileName = resFileName
        }
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
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
    closeQrCode () {
      this.qrCodeShow = false
    },
    openQrcode () {
      this.qrCodeArr = []
      this.qrCodeNum = []
      this.qrCodeShow = true
      this.qrloading = true
      setTimeout(() => {
        this.$get('/sys/license/token').then(res => {
          this.totalQrCode = Math.ceil(res.data.length / (1024 + 512))
          if (this.totalQrCode < 1) {
            this.totalQrCode = 1
          }
          const total = this.totalQrCode < 10 ? ('0' + this.totalQrCode) : this.totalQrCode
          const totalMD5 = SparkMD5.hashBinary(res.data).slice(0, 8)
          const arr = []
          for (let i = 0; i < this.totalQrCode; i++) {
            const num = (1024 + 512)
            let str1 = res.data.slice(num * i, num * (i + 1))
            const index = i < 10 ? ('0' + (i + 1)) : (i + 1)
            const md5 = SparkMD5.hashBinary(str1).slice(0, 8)
            str1 = total + '' + index + totalMD5 + md5 + '' + str1
            arr.push(str1)
          }
          this.qrCodeArr = []
          this.qrCodeNum = arr.map(() => {
            return true
          })
          arr.forEach((item, index) => {
            setTimeout(() => {
              this.qrCodeArr.push(item)
              this.qrCodeNum[index] = false
            }, index * 100)
          })
          this.getLayout(arr)
          this.qrloading = false
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
      }, 100)
    },
    getSrc (index) {
      const cas = document.createElement('canvas')
      const ctx = cas.getContext('2d')

      cas.width = 100
      cas.height = 100
      ctx.font = 'normal bold 40px Roboto-Regular'
      let text = index + 1 + ''
      if (text.length < 2) {
        text = '0' + text
      }
      ctx.fillText(text, 25, 65)
      // 把画布的内容转换为base64编码格式的图片
      const data = cas.toDataURL('image/png', 1)
      return data
    },
    setActiveItem (currentPage) {
      this.$refs.carousel.setActiveItem('qr-' + (currentPage - 1))
    },
    getLayout () {
      try {
        this.boxWidth = document.body.offsetWidth - 30 - 40
        this.boxHeight = document.body.offsetHeight - 104 - 50
      } catch (error) {}
      return new Promise(resolve => {
        let rateMax = 0
        let col = 0
        let row = 0
        for (let i = 1; i <= this.qrCodeNum.length; i++) {
          const cols = Math.ceil(this.qrCodeNum.length / i)
          const w = this.boxWidth / i
          const h = this.boxHeight / cols
          const rate = w > h ? h / w : w / h
          if (rate > rateMax) {
            rateMax = rate
            col = cols
            row = i
          }
        }
        if (this.qrCodeNum.length) {
          while (col * row >= this.qrCodeNum.length) { // 避免出现空白
            row--
          }
        }
        row++
        if (col === 1 || row === 1) { // 行 或 列有一个为1时 需要调换位置
          const temp = col
          col = row
          row = temp
        }
        this.qrWidth = 10
        if (this.boxHeight / col < this.boxWidth / row) {
          this.qrWidth = this.boxHeight / col
        } else {
          this.qrWidth = this.boxWidth / row
        }
        resolve({ col, row })
      })
    }
  },
  computed: {
    getLicense () {
      return function (data) {
        return `${data.host}:${data.port}`
      }
    }
  },
  mounted () {
    this.licenseGetData()
    this.licenseGetStatus()
  }
}
</script>
<style scoped lang="scss">
  /deep/ .el-dialog__body{
    padding: 20px !important;
    height: calc(100% - 40px);
    width: calc(100% - 40px);
  }
</style>
