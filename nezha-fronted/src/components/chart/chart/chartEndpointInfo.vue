<template>
  <chart-detail v-if="chartInfo === 'endpointInfo'" :chart-info="chartInfo" :chart-detail="chartData"></chart-detail>
</template>

<script>
export default {
  name: 'chartEndpointInfo',
  props: {
    chartData: Array,
    chartInfo: Object
  },
  data () {
    return {

    }
  }
}
</script>

<style scoped>

</style>
