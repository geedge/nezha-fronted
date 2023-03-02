<template>
  <div class="integration-automatic">
    <!-- New installation -->
    <h3 class="integration-install">{{$t('integration.newUpgrade')}}</h3>
    <div class="install-step">
      <div class="step-num">1</div>
      <div class="step-right">
        <h4>{{$t('integration.selectAsset')}}</h4>
        <div class="talon-select">
          <span>{{$t('asset.asset')}}</span>
          <el-select v-model="assetId" class="right-box-row-with-btn" popper-class="right-box-select-top right-public-box-dropdown-top" placeholder="" :popper-append-to-body="false" size="small">
            <el-option v-for="item in assetList" :key="item.name" :label="item.name" :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div class="install-step" v-if="loadFinish">
      <div class="step-num">2</div>
      <div class="step-right">
        <h4>{{$t('integration.loginAsset')}}</h4>
        <div class="command-box">
          <el-input :disabled="true" :value="curlUrl" size="small">
            <i slot="suffix" class="nz-icon nz-icon-override" @click="copyUrl(curlUrl)" :title="$t('overall.copyText')"></i>
          </el-input>
        </div>
        <h4 style="margin-top:15px">{{$t('integration.autoRemark')}}</h4>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'integration-automatic',
  data () {
    return {
      loadFinish: false,
      assetId: '',
      assetList: []
    }
  },
  created () {
    this.getAssetList()
    this.token = localStorage.getItem('nz-token')
    axios.get('/healthy').then(response => {
      const url = response.request.responseURL
      this.ipAddr = url.split('/healthy')[0]
    })
  },
  computed: {
    curlUrl () {
      return 'curl -o- -k -H "Authorization:' + this.token + '" ' + this.ipAddr + '/asset/talon/' + this.assetId + '/install.sh | sudo -E bash'
    }
  },
  methods: {
    getAssetList () {
      const params = {
        pageSize: -1
      }
      this.$get('asset/asset', params).then(response => {
        if (response.code === 200) {
          this.assetList = response.data.list
          if (this.assetList && this.assetList.length > 0) {
            this.assetId = this.assetList[0].id
            this.loadFinish = true
          }
        }
      })
    },
    copyUrl (txt) {
      this.$copyText(txt).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  }
}
</script>
