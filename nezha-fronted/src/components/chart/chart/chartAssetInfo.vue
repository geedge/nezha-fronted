<template>
  <chart-detail :chart-info="chartInfo" :chart-detail="chartData"></chart-detail>
</template>

<script>
import chartDetail from '@/components/chart/chartDetail'
export default {
  name: 'chartAssetInfo',
  components: {
    chartDetail
  },
  props: {
    chartInfo: Object,
    chartData: Object
  },
  data () {
    return {

    }
  },
  methods: {
    resize () {

    }
  }
}
</script>
