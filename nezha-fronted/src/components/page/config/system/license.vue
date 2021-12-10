<template>
  <div class="license">
    <div class="license-left">
      <div class="license-left-header">
        <div>
         <div class="license-left-header-icon">
           <!-- 上传 -->
           <i v-if="UploadedSuccessfully" class="nz-icon nz-icon-import-success"></i>
           <i v-else-if="uploadFailed" class="nz-icon nz-icon-import-failed1"></i>
           <!-- 导入 -->
           <i v-else-if="downloadSuccessful" class="nz-icon nz-icon-import-success"></i>
           <i v-else-if="downloadFailed" class="nz-icon nz-icon-import-failed1"></i>
         </div>
          <div>{{$t('license.nzTitleValue')}}</div>
        </div>
        <div>{{$t('license.active')}}</div>
      </div>
      <div class="license-left-body">
        <div>
          <div class="license-left-boyd-title" style="margin-top: 25px">{{$t('license.id')}}</div>
          <div class="license-left-boyd-value">{{ licenseList.id }}</div>
        </div>
        <div>
          <div class="license-left-boyd-title">{{$t('license.proDate')}}</div>
          <div class="license-left-boyd-value">{{formatDate(licenseList.production_date)}}</div>
        </div>
        <div>
          <div class="license-left-boyd-title">{{$t('license.expDate')}}</div>
          <div class="license-left-boyd-value" style="margin: 15px" v-for="(item,index) in expData" :key="index">
            <template v-if="item.license.license_type === 'expiration' && item.id === '20001'">{{formatDate(item.license.exp_date)}}</template>
          </div>
        </div>
      </div>
      <div class="license-left-footer">
        <div class="license-left-footer-download">
          <i @click="downloadMib()" class="nz-icon nz-icon-download"></i><span>{{$t('license.downloadID')}}</span>
        </div>
        <el-upload
          ref="upload"
          accept=".xml"
          action=""
          class="license-left-footer-upload"
          :file-list="uploadFileList"
          :auto-upload="false"
          :on-change="handleChange"
        >
          <i class="nz-icon nz-icon-upload"></i><span>{{$t('license.uploadLicense')}}</span>
        </el-upload>
      </div>
    </div>
    <div class="license-right">
      <div class="license-right-header">
        <div class="license-right-header-title">{{$t('license.devices')}}&nbsp;({{tableData.length}})</div>
      </div>
      <div class="license-right-table">
        <el-table :data="tableData">
          <el-table-column v-for="(item, index) in tableTitle" :key="index">
            <template slot="header">
              <span class="data-column__span">{{item.label}} <i class="nz-icon nz-icon-label" v-if="item.type==='label'"/></span>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop === 'devicesName'">
                <span>{{scope.row.host}}</span>
              </template>
              <template v-if="item.prop === 'status'">
                <div v-if="scope.row.status === 0">
                  <div class="active-icon green-bg inline-block"></div> {{ $t('license.active') }}
                </div>
                <div v-else-if="scope.row.status !== 0">
                  <div class="active-icon red-bg inline-block"></div> {{ $t('license.inactive') }}
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import licenseData from '@/components/page/config/system/licenseData'
import statusDate from '@/components/page/config/system/statusDate'

export default {
  name: 'license',
  mixins: [licenseData, statusDate],
  data () {
    return {
      licenseList: {},
      url: '/sys/license/detail',
      tableData: [],
      tableTitle: [
        {
          label: this.$t('license.devicesName'),
          prop: 'devicesName'
        },
        {
          label: this.$t('license.status'),
          prop: 'status'
        }
      ],
      expData: [],
      uploadFileList: [],
      uploadFile: { file: '' },
      UploadedSuccessfully: true, // 上传成功
      uploadFailed: false, // 上传失败
      downloadSuccessful: false, // 下载成功
      downloadFailed: false // 下载失败
    }
  },
  methods: {
    licenseGetData () {
      this.$get('/sys/license/detail').then(res => {
        if (res.code === 200) {
          this.licenseList = res.data.license.hasp
          console.log(res)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    formatDate (date) {
      const dateTime = new Date()
      dateTime.setTime(date * 1000)
      const year = dateTime.getFullYear()
      const month = dateTime.getMonth() + 1 < 10 ? '0' + (dateTime.getMonth() + 1) : dateTime.getMonth() + 1
      const day = dateTime.getDate() < 10 ? '0' + dateTime.getDate() : dateTime.getDate()
      const hour = dateTime.getHours() < 10 ? '0' + dateTime.getHours() : dateTime.getHours()
      const minute = dateTime.getMinutes() < 10 ? '0' + dateTime.getMinutes() : dateTime.getMinutes()
      const second = dateTime.getSeconds() < 10 ? '0' + dateTime.getSeconds() : dateTime.getSeconds()
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    },
    licenseGetStatus () {
      this.$get('/sys/license/status', { scope: 'all' }).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.list
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
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.UploadedSuccessfully = true
        } else {
          this.$message.error(res.msg)
          this.uploadFailed = true
        }
      })
    },
    downloadMib () {
      this.$get('/sys/license/token').then(res => {
        if (res.code === 200) {
          console.log(res)
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.downloadSuccessful = true
        } else {
          this.$message.error(res.msg)
          this.downloadFailed = true
        }
      })
    }
  },
  mounted () {
    this.licenseGetData()
    this.licenseGetStatus()
  }
}
</script>
