<template>
  <div class="integration">
    <!-- NZ-talon -->
    <p class="integration-title" style="margin-top:10px;">{{talon.name}}</p>
    <ul class="integration-list">
      <li class="integration-item" @click="talonDetail">
        <img class="integration-icon" :src="talon.icon" alt="">
        <h2 class="integration-name">{{talon.name}}</h2>
        <p class="integration-remark">{{talon.remark}}</p>
        <div class="integration-internal">{{$t('integration.internal')}}</div>
      </li>
    </ul>
    <!-- Available Integration -->
    <p class="integration-title" style="margin-top:20px;">{{$t('integration.availableIntegration')}}</p>
    <ul class="integration-list">
      <li class="integration-item" v-for="item in dataList" :key="item.id" @click="details(item)">
        <img class="integration-icon" :src="item.icon" alt="">
        <h2 class="integration-name">{{item.name}}</h2>
        <p class="integration-remark">{{item.remark}}</p>
      </li>
    </ul>

    <!-- 集成详情 -->
    <el-dialog
      class="integration-dialog"
      :class="type=='internal'?'integration-dialog-internal':''"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :show-close="true"
      :append-to-body="false"
      :z-index="1000"
      @close="closeDialog"
    >
      <!-- introduce -->
      <div class="integration-dialog-top">
        <div class="integration-dialog-top-logo">
          <img :src="detailsObj.icon" alt="">
        </div>
        <div class="integration-dialog-introduce">
          <h2 class="integration-name">{{detailsObj.name}}</h2>
          <p class="integration-remark">{{detailsObj.remark}}</p>
        </div>
      </div>
      <!-- tabs -->
      <div class="integration-dialog-content">
        <integration-tabs  :type="type" :detailsObj="detailsObj"></integration-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import integrationTabs from './integration-tabs/integration-tabs.vue'
export default {
  name: 'integration',
  components: {
    'integration-tabs': integrationTabs
  },
  data () {
    return {
      dialogVisible: false,
      talon: {
        icon: 'https://static.datadoghq.com/static/images/logos/azure_avatar.svg',
        name: 'NZ-TALON',
        remark: this.$t('integration.talonRemark')
      },
      // 模块列表
      dataList: [],
      type: '',
      detailsObj: {}
    }
  },
  methods: {
    async getDataList () {
      const res = await this.$get('/integration/module', { pageSize: -1 })
      this.dataList = res.data.list
    },
    // talon 详情
    talonDetail () {
      this.type = 'internal'
      this.detailsObj = this.talon
      this.dialogVisible = true
    },
    // 详情
    details (val) {
      this.type = 'module'
      this.detailsObj = val
      this.dialogVisible = true
    },
    closeDialog () {
      this.detailsObj = {}
      this.dialogVisible = false
    }
  },
  created () {
    this.getDataList()
  }
}
</script>
