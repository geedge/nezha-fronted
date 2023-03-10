<template>
  <chart-detail :chart-info="chartInfo" :chart-detail="chartData" :from="from"></chart-detail>
</template>

<script>
import chartDetail from '@/components/chart/chartDetail'
export default {
  name: 'chartAssetInfo',
  components: {
    chartDetail
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
    resize () {

    }
  }
}
</script>
