<template>
  <chart-detail-new v-if="chartData.feature&&!isEmpty(chartData.feature)" :chart-info="chartInfo" :chart-detail="chartData" :from="from"></chart-detail-new>
  <chart-detail v-else :chart-info="chartInfo" :chart-detail="chartData" :from="from"></chart-detail>
</template>

<script>
import chartDetail from '@/components/chart/chartDetail'
import chartDetailNew from '@/components/chart/chartDetailNew'
import lodash from 'lodash'
export default {
  name: 'chartAssetInfo',
  components: {
    chartDetail,
    chartDetailNew
  },
  props: {
    from: String,
    chartInfo: Object,
    chartData: Object
  },
  data () {
    return {

    }
  },
  methods: {
    isEmpty (obj) {
      return lodash.isEmpty(obj)
    }
  },
  watch: {
  }
}
</script>
