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
    // 数据全为空 展示原组件
    isEmpty (obj) {
      let flag = true // 是否为空
      for (const key in obj) {
        if (obj[key] && (!lodash.isEmpty(obj[key]) || obj[key].length)) {
          if (key === 'cpu' && !obj[key].name) {
            flag = true
          } else {
            flag = false
            return false
          }
        }
      }
      return flag
    }
  },
  watch: {
  }
}
</script>
