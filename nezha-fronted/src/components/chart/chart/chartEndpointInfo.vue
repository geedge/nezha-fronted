<template>
  <chart-detail :chart-info="chartInfo" :chart-detail="chartData"></chart-detail>
</template>

<script>
import chartDetail from '@/components/chart/chartDetail'
export default {
  name: 'chartEndpointInfo',
  components: {
    chartDetail
  },
  props: {
    chartData: Object,
    chartInfo: Object
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
