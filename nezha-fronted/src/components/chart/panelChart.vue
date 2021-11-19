<template>
  <!-- chart外层箱子 -->
  <div class="panel-chart">
    <!-- title和工具栏，支持浮动 -->
    <chart-header
      :chart-info="chartInfo"
    ></chart-header>
    <!-- chart -->
    <div class="chart-container">
      <!-- 数据获取后传入chart组件，chart组件内不发送查询请求，只根据接传递的数据来渲染 -->
      <chart
        :chart-data="chartData"
        :chart-info="chartInfo"
      ></chart>
    </div>
  </div>
</template>

<script>
import chartHeader from '@/components/chart/chartHeader'
import chart from '@/components/chart/chart'
export default {
  name: 'panelChart',
  components: {
    chartHeader,
    chart
  },
  props: {
    chartInfo: Object
  },
  data () {
    return {
      chartData: null
    }
  },
  methods: {
    getChartData () {

    }
  },
  mounted () {
    this.getChartData()
  }
}
</script>
