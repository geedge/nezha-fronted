<template>
  <chart-detail :chart-info="chartInfo" :chart-detail="chartData" :from="from"></chart-detail>
</template>

<script>
import chartDetail from '@/components/chart/chartDetail'
export default {
  name: 'chartEndpointInfo',
  components: {
    chartDetail
  },
  props: {
    from: String,
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
