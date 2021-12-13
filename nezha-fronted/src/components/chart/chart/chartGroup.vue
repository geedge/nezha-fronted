<template>
  <chart-list
    ref="chartList"
    :class="{'show-top':showTopBtn}"
    :data-list="dataList"
    :nowTimeType="nowTimeType"
    :from="fromRoute.panel"
    :panel-lock="panelLock"
    :time-range="searchTime"
    @edit-chart="editChart"
    @on-refresh-time="refreshTime"
    @on-remove-chart="delChart"
    @on-add-group-item-chart="addGroupItem"
    :loading="chartListLoading"
  ></chart-list>
</template>

<script>
import ChartList from '../../chart/chartList'
export default {
  name: 'chart-group',
  components: {
    'chart-list': ChartList
  },
  data () {
    showTopBtn: false
  }
}
</script>

<style scoped>

</style>
