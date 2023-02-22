<template>
  <div class="integration">
    <!-- NZ-talon -->
    <p class="integration-title" style="margin-top:10px;">NZ-talon</p>
    <ul class="integration-list">
      <li class="integration-item" @click="details">
        <img class="integration-icon" src="https://static.datadoghq.com/static/images/logos/azure_avatar.svg" alt="">
        <h2 class="integration-name">NZ-talontalontalontalontalontalontalontalontalontalon</h2>
        <p class="integration-remark">Check content name check contentname check content Check content name name check content name check content namecheck content namecheck content namecheck content name</p>
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
          <img src="https://static.datadoghq.com/static/images/logos/azure_avatar.svg" alt="">
        </div>
        <div class="integration-dialog-introduce">
          <h2 class="integration-name">Azure Usage and Quotas</h2>
          <p class="integration-remark">Azure Usage and Quotas allows you to keep track of your current usages and limits limilimitslimitstslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimitslimits.</p>
        </div>
      </div>
      <!-- tabs -->
      <div class="integration-dialog-content">
        <integration-tabs :detailsObj="detailsObj"></integration-tabs>
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
      dataList: [],
      detailsObj: {}
    }
  },
  methods: {
    async getDataList () {
      const res = await this.$get('/integration/module', { pageSize: -1 })
      this.dataList = res.data.list
      console.log(res)
    },
    // 详情
    details (val) {
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
