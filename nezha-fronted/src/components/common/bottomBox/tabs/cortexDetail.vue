<template>
  <nz-bottom-data-list
    id="cortexDetail"
    :showTitle='showTitle'
    :obj='obj'
    :tableId="tableId"
    :custom-table-title.sync="tools.customTableTitle"
    :tabs="tabs"
    :targetTab="targetTab"
    :showPagination="false"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <div v-if="!loading" style="height:auto;">
        <cortexDetailTable
        :ringTableData='ringTableData'
        :configTableData='configTableData'
        :servicesTableData='servicesTableData'
        @configval='configval'>
        </cortexDetailTable>
      </div>
      <loading v-else ref="loading"></loading>
  </template>
  </nz-bottom-data-list>
</template>

<script>
import loading from '@/components/common/loading'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import cortexDetailTable from '@/components/common/table/settings/cortexDetailTable'

export default {
  name: 'cortexDetail',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    cortexDetailTable,
    loading
  },
  props: {
    obj: Object,
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      async handler (n) {
        this.loading = true
        this.getReadyTableData().then(res => {
          this.getTableData()
        }).catch(res => {
          this.ringTableData.push([])
          this.$refs.loading.endLoading()
          this.loading = false
          this.$message.error(res.msg)
        })
      }
    }
  },
  data () {
    return {
      tableId: 'cortexDetail',
      configMode: 'defaults',
      configTableData: [],
      servicesTableData: [],
      ringTableData: [],
      readyTableData: '',
      loading: false
    }
  },
  mounted () {
  },
  methods: {
    async getTableData () {
      await this.getCompactorTableData()
      await this.getservicesTableData()
      await this.getIngesterTableData()
      await this.getStoreGatewayTableData()
      this.getConfigTableData()
    },
    configval (val) {
      this.configMode = val
      this.getConfigTableData()
    },
    async getIngesterTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/ingester/ring')
      if (response.code === 200) {
        this.ringTableData.push(response.data.list)
      }
    },
    async getStoreGatewayTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/store-gateway/ring')
      if (response.code === 200) {
        this.ringTableData.push(response.data.list)
      }
    },
    async getCompactorTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/compactor/ring')
      if (response.code === 200) {
        this.ringTableData.push(response.data.list)
      }
    },
    async getConfigTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/config?mode=' + this.configMode)
      if (response.code === 200) {
        this.configTableData = response.data.content.split(/\n/)
      }
      this.$refs.loading.endLoading()
      this.loading = false
    },
    async getReadyTableData () {
      return new Promise((resolve, reject) => {
        this.$get('agent/' + this.obj.id + '/cortex/ready').then(response => {
          if (response.code === 200) {
            this.$refs.loading.startLoading()
            this.readyTableData = response.data.status
            resolve()
          } else {
            reject(response)
          }
        })
      })

    },
    async getservicesTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/services')
      if (response.code === 200) {
        const serObj = {}
        response.data.list.forEach(item => {
          serObj[item.name] = item.status
        })
        serObj.ready = this.readyTableData
        this.servicesTableData.push(serObj)
      }
    }
  }
}
</script>
