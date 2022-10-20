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
    <el-dialog :modal-append-to-body='false'  :show-close="true" :visible.sync="qrCodeShow" @close="closeQrCode" :title="'QR code'" class="nz-dialog overview" width="650px">
      <el-carousel arrow="never" :autoplay="false" :height="'500px'" ref="carousel">
        <el-carousel-item v-for="(item, index) in qrCodeArr" :key="index" :name="'qr-' + index">
<!--            :logo-src="getSrc(index)"-->
          <vueQr
            :text="item"
            :size="2000"
            :logo-src="getSrc(index)"
            :margin="50"
          />
        </el-carousel-item>
      </el-carousel>
      <div class="nz-license-footer">
        <el-pagination
          @current-change="setActiveItem"
          small
          :page-size="1"
          :current-page.sync="currentPage"
          layout="prev, pager, next"
          :total="qrCodeArr.length">
        </el-pagination>
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
      totalQrCode: 10,
      currentPage: 1
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
      const self = this
      this.$get('/sys/license/token').then(res => {
        this.totalQrCode = Math.ceil(res.data.length / (1024 + 512))
        if (this.totalQrCode < 1) {
          this.totalQrCode = 1
        }
        // let qrstr = '<?xml version="1.0" encoding="UTF-8"?> <license><supportID>GDNT-1000000047392188</supportID><Signature><DigestMethod>sha1</DigestMethod><DigestValue>2fd55f0536bf0fe985ec584b3205796833f9c686</DigestValue></Signature><hasps><hasp_info> <haspscope> <hasp id="876940681788086081"> <vendor id="25743"/> <update_counter>0</update_counter> </hasp> </haspscope> <c2v> YYIcLYADY3R2oQaABGNGigeiCYABAIEBAIIBAKMVgAEAgRAAAAAAAAAAAAAAAAAA AAAApoIb+oAIDCuE52MRV0GjghvsoIIb6ICCAQDFmdf8/XqWoYFME+3f3f1BNBZ3 8NYY7Ww9IKys44YsV3KyiRUU/32EW8Cylg99S7QlTYX56CSfTR2n1iGz+bkD+PsS gMiz4ClAn+niZLxEesZamsrp+SdjAbMS+aKeUoM/yAawPrbfchZoc5dNxipY/gKc qi9qKzX/XK/FIL0FPU8ss4wCnsSMZbR2zFcbBGOqAMSacRScrVnCcjfyvyx6PZAn M9Nlp6yaPfnWuqrP2asQ/0ThoiGzaC1usnUDZxesP1xf8aaZVmTWBhW7x0i1Ah6Q 53T6aRKwtJerOmY/naBBETcNRAbBWpxKfRR+6Cv5Bv+yLnfirV7/oI7i9sYMgYIa 4E4nX5U+8LPBiZtVrmuWy+ZrlTjHSzU25K0nH+D/JPNqjDtNr1cfA9larAFd6Vow uoWQL48K2MsG6D0S8fAm7B1VPSol9uhFZL7H49tB69hqhxxTL8HD8ytOe4qxSbPF k7SdiYsJr3PA+yITJq5vMMY6wREu+yCD/yBe2nhrVN+SnjoXbkoI+PD6hbnRw2+I eGmLDQvr8hz5qloK9Bl2f+TFqFE+0o3UwGzLy9UWRC1O+aoExj6g54FCHQsOyagg Bdnlb6LKnsOgIY5Iq4ZWkdZCvp4LPNlgKopq9qe0qy9MhiobgKjGRzevuOFNlmgn u5ktAVNCkeKHbmCyjQ3asO8eVX4K1fbUTiJK/7EMvf3JclBwqQJzMFOdjbbvo3Lf Tox/8sLNbqNv8wkkweFSmq31WMWn7r5B93KUZaP6SaVTQu5IqNdfW/sbBCGAWWLX zFEJgjN+EQisA0G/7iFR/6gehaHTEjtxElVrGdE7K8dZ0ZRJLPHMq5rllNY4AvPu 9BSdN5rn95DV26RrYTwjYOcirLAKZ2G59H41LmhnEzk4txulqSCQkCkUthgFwgpA IulXP0E28caYqTDbe7OTGWQfAZyXnn5txtUcGNUdvzJT4L9/441uS2l1zUygmeFL GVkodECzntiYA0UN5UIEygI06cABLbKRjAaEP1MBLSKz6UVMIZWoPHA7FXwE6+/S pdfPyT5DmP+nXjITq63IRT+reX9J361pB8wRtEEU1YeQ+3tyYxsK9Wgew1uGTXnk oTJb4Ensd72PgSl6xck97xMwEr38j7TVVscO0kbA3+njMSbstpmf7U8aSmMiDUk+ jNBVIbvURobMNUgC96FJjmtVc6EsbQ/Kssa4C68kcwnUXU9o3qKyJOnhXW0DgOlj OlNcYcfhK3zS1pKEDwxD7H688aib1M2dKEd0QbYDYDkcyivWp/YQVAZpHBLn2OFo 8tLD4/Zv7SX5jvTjyigOUF4mXcFiPi4bVhDX0Qi1+NU0nzwkj9BXpQWlg3UJaWyp 1XMWRNo7PkupW2Rq0vLcr2gu4lrGNa5kgVpoeJNH9XOzvz5lyXlZBxtK8CYbZ4XG BDZrEpZJm4jHtpVCP3fQRjEhlO7VDW/aqyxYyB7/tttfNGgW2CdJFRfuBCQqvkAu'
        // console.log(JSON.parse(qrstr))
        // console.log(SparkMD5.hashBinary(qrstr).slice(0, 8))
        const total = this.totalQrCode < 10 ? ('0' + this.totalQrCode) : this.totalQrCode
        const totalMD5 = SparkMD5.hashBinary(res.data).slice(0, 8)
        for (let i = 0; i < this.totalQrCode; i++) {
          const num = (1024 + 512)
          let str1 = res.data.slice(num * i, num * (i + 1))
          const index = i < 10 ? ('0' + (i + 1)) : (i + 1)
          const md5 = SparkMD5.hashBinary(str1).slice(0, 8)
          str1 = total + '' + index + totalMD5 + md5 + '' + str1
          self.qrCodeArr.push(str1)
        }
        this.qrCodeShow = true
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
      console.log()
      this.$refs.carousel.setActiveItem('qr-' + (currentPage - 1))
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

</style>
