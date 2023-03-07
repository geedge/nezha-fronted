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
          <v-selectpage
            :data="assetList"
            :tb-columns="assetColumns"
            :multiple="false"
            :language="language"
            key-field="id"
            show-field="name"
            :width="640"
            v-model="assetId"
            class="form-control"
            :result-format="resultFormat"
          >
          </v-selectpage>
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
      assetList: [],
      // asset表头
      assetColumns: [
        { title: 'id', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        { title: 'Manage Ip', data: 'manageIp' },
        {
          title: this.$t('overall.type'),
          data: (row) => {
            return row.type ? row.type.name : ''
          }
        },
        {
          title: this.$t('asset.model'),
          data: (row) => {
            return row.model ? row.model.name : ''
          }
        },
        {
          title: this.$t('overall.dc'),
          data: (row) => {
            return row.dc ? row.dc.name : ''
          }
        }
      ]
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
    language () { return this.$store.getters.getLanguage },
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
            this.assetId = String(this.assetList[0].id)
            this.loadFinish = true
          }
        }
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
    copyUrl (txt) {
      this.$copyText(txt).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  }
}
</script>
