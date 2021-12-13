<template>
  <div style="width: 100%;height: 100%">
    <chartList
      ref="chartList"
      name="group"
      :class="{'show-top':showTopBtn}"
      :data-list="dataList"
      :nowTimeType="nowTimeType"
      :from="fromRoute.panel"
      :panel-lock="panelLock"
      :isGroup="true"
      :time-range="searchTime"
      :groupInfo="chartInfo"
      @on-refresh-time="refreshTime"
      :loading="chartListLoading"
    ></chartList>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
export default {
  name: 'chart-group',
  props: {
    panelLock: Boolean,
  },
  mixins: [chartMixin, chartFormat],
  computed: {
    searchTime () {
      return this.$store.getters.getTimeRange
    },
    nowTimeType () {
      return this.$store.getters.getNowTimeType
    }
  },
  data () {
    return {
      fromRoute,
      dataList: [],
      showTopBtn: false,
      chartListLoading: false
    }
  },
  methods: {
    refreshTime () {

    }
  },
  watch: {
    chartData: {
      immediate: true,
      handler (n) {
        console.log(n)
        this.$nextTick(() => {
          this.dataList = JSON.parse(JSON.stringify(n))
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
