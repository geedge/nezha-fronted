<template>
  <div style="width: 100%;height: 100%">
    <chartList
      v-if="chartInfo.loaded"
      ref="chartList"
      name="group"
      :class="{'show-top':showTopBtn}"
      :data-list="dataList"
      :dataJson = "dataJson.chartsData"
      :is-export-html="!!dataJson"
      :nowTimeType="nowTimeType"
      :from="from"
      :panel-lock="panelLock"
      :isGroup="true"
      :showTool="showTool"
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
    from: String,
    filter: {},
    showTool: {
      type: Boolean,
      default: true
    }
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
      chartListLoading: false,
      dataJson: window.dataJson || ''
    }
  },
  methods: {
    refreshTime () {

    },
    initChart () {
      // setTimeout(() => {
      //   this.dataList = this.dataList.map(item => {
      //     return {
      //       ...item
      //       // hide: item.name.indexOf(this.filter.searchName) === -1, // 搜索条件
      //     }
      //   })
      // }, 100)
    }
  },
  watch: {
    chartData: {
      immediate: true,
      handler (n) {
        this.$nextTick(() => {
          const arr = JSON.parse(JSON.stringify(n))
          this.dataList = arr.map(item => {
            return {
              ...item
              // hide: item.name.indexOf(this.filter.searchName) === -1, // 搜索条件
              // loaded: false
            }
          })
        })
      }
    }
  }
}
</script>
