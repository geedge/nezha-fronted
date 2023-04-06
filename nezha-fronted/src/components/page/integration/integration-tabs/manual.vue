<template>
  <div class="integration-manual">
    <!-- New installation -->
    <h3 class="integration-install">{{$t('integration.newInstallation')}}</h3>
    <div class="install-step">
      <div class="step-num">1</div>
      <div class="step-right">
        <h4>{{$t('integration.downloadTalon')}}</h4>
        <div class="talon-select">
          <span>{{$t('config.agent.agent.osType')}}</span>
          <el-select v-model="newDownType" class="right-box-row-with-btn" popper-class="right-box-select-top right-public-box-dropdown-top" placeholder="" :popper-append-to-body="false" size="small">
            <el-option v-for="item in osTypes" :key="item.name" :label="item.label" :value="item.name">
              <span class="panel-dropdown-label-txt" >{{item.label}}</span>
            </el-option>
          </el-select>
          <button :class="{'nz-btn-disabled':newDownloadFlag}" :disabled="newDownloadFlag" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="newDownload">
            <i class="nz-icon nz-icon-download"></i>{{$t('overall.download')}}
          </button>
        </div>
      </div>
    </div>
    <div class="install-step">
      <div class="step-num">2</div>
      <div class="step-right">
        <h4>{{$t('integration.uploadTalon')}}</h4>
        <div class="command-box">
          <el-input :disabled="true" :value="newCommand" size="small">
            <i slot="suffix" class="nz-icon nz-icon-override" @click="copyUrl(newCommand)" :title="$t('overall.copyText')"></i>
          </el-input>
        </div>
        <h4 style="margin-top:20px">{{$t('integration.installed')}}</h4>
        <div class="command-box">
          <el-input :disabled="true" :value="tokenCommand" size="small">
            <i slot="suffix" class="nz-icon nz-icon-override" @click="copyUrl(tokenCommand)" :title="$t('overall.copyText')"></i>
          </el-input>
        </div>
      </div>
    </div>
    <div class="install-step">
      <div class="step-num">3</div>
      <div class="step-right">
        <h4>{{$t('integration.editAsset')}}</h4>
        <p>
          <i class="dot"></i>
          <span>{{$t('integration.enableTalon')}}</span>
        </p>
        <p>
          <i class="dot"></i>
          <span>{{$t('integration.enterToken')}}</span>
        </p>
        <p>
          <i class="dot"></i>
          <span>{{$t('integration.enterPort')}}</span>
        </p>
      </div>
    </div>

    <!-- Upgrade installation -->
    <h3 class="integration-install" style="margin-top:20px;">{{$t('integration.upgradeInstallation')}}</h3>
    <div class="install-step">
      <div class="step-num">1</div>
      <div class="step-right">
        <h4>{{$t('integration.downloadTalon')}}</h4>
        <div class="talon-select">
          <span>{{$t('config.agent.agent.osType')}}</span>
          <el-select v-model="upDownType" class="right-box-row-with-btn" popper-class="right-box-select-top right-public-box-dropdown-top" placeholder="" :popper-append-to-body="false" size="small">
            <el-option v-for="item in osTypes" :key="item.name" :label="item.label" :value="item.name">
              <span class="panel-dropdown-label-txt" >{{item.label}}</span>
            </el-option>
          </el-select>
          <button :class="{'nz-btn-disabled':upDownloadFlag}" :disabled="upDownloadFlag" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="upDownload">
            <i class="nz-icon nz-icon-download"></i>{{$t('overall.download')}}
          </button>
        </div>
      </div>
    </div>
    <div class="install-step">
      <div class="step-num">2</div>
      <div class="step-right">
        <h4>{{$t('integration.uploadTalon')}}</h4>
        <div class="command-box">
          <el-input :disabled="true" :value="upgradeCommand" size="small">
            <i slot="suffix" class="nz-icon nz-icon-override" @click="copyUrl(upgradeCommand)" :title="$t('overall.copyText')"></i>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'integration-manual',
  data () {
    return {
      newDownloadFlag: false,
      newDownType: 'centos',
      upDownloadFlag: false,
      upDownType: 'centos',
      osTypes: [
        {
          label: 'Centos',
          name: 'centos'
        },
        {
          label: 'Red Hat',
          name: 'redHat'
        }
      ],
      newCommand: 'rpm -ivh nz-talon*.rpm',
      upgradeCommand: 'rpm -Uvh nz-talon*.rpm',
      tokenCommand: 'cat /opt/nezha/nz-talon/config/token.auth'

    }
  },
  async created () {
    await axios.get('/healthy')
  },
  methods: {
    copyUrl (txt) {
      this.$copyText(txt).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    newDownload () {
      this.newDownloadFlag = true
      axios.get('asset/talon/download?os=' + this.newDownType, { responseType: 'blob' }).then(data => {
        this.newDownloadFlag = false
        let fileName = 'NZ-TALON'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
      }).catch((error) => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else if (exception.msg) {
            $self.$message.error(exception.msg)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
        this.newDownloadFlag = false
      })
    },
    upDownload () {
      this.upDownloadFlag = true
      axios.get('asset/talon/download?os=' + this.upDownType, { responseType: 'blob' }).then(data => {
        this.upDownloadFlag = false
        let fileName = 'NZ-TALON'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
      }).catch((error) => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else if (exception.msg) {
            $self.$message.error(exception.msg)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
        this.upDownloadFlag = false
      })
    }
  }
}
</script>
