<template>
  <nz-bottom-data-list
    :custom-tool="true"
    :layout="[]"
    :show-pagination="false"
    :tabs="tabs"
    :targetTab="targetTab"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot:top-tool-right>
      <el-input v-model="matchContent" class="margin-r-10" placeholder="" size="small" suffix-icon="el-icon-search" @keyup.enter.native="queryLogData()">
        <el-select slot="prepend" v-model="matchSymbol" class="symbol-select" size="small" style="width: 60px;">
          <el-option value="|="></el-option>
          <el-option value="!="></el-option>
          <el-option value="|~"></el-option>
          <el-option value="!~"></el-option>
        </el-select>
      </el-input>
      <pick-time id="explore" ref="pickTime" v-model="filterTime" :refresh-data-func="queryLogData" :use-chart-unit="false" :use-refresh="false">
        <template slot="added-text">{{$t('overall.query')}}</template>
      </pick-time>
    </template>
    <template v-slot>
      <log-tab ref="logDetail" :log-data="logData" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import logTab from '@/components/page/dashboard/explore/logTab'
import subDataListMixin from '@/components/common/mixin/subDataList'
import axios from 'axios'
import bus from '@/libs/bus'

export default {
  name: 'logBottomTab',
  mixins: [subDataListMixin],
  components: {
    nzBottomDataList,
    logTab
  },
  data () {
    return {
      logData: [],
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1), 'yyyy-MM-dd hh:mm:ss'),
        bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss')
      ],
      expressions: [''],
      matchSymbol: '|=',
      matchContent: ''
    }
  },
  methods: {
    exportLog ({ limit, descending }) {
      const params = {
        logql: this.expressions,
        start: this.$stringTimeParseToUnix(this.filterTime[0]),
        end: this.$stringTimeParseToUnix(this.filterTime[1]),
        direction: descending ? 'backward' : 'forward',
        limit
      }
      axios.get('/logs/loki/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, 'log')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = 'log'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    queryLogData (limit) { // log的chart和table是一个请求
      if (!limit) {
        limit = this.$refs.logDetail.getLimit()
      }
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          if (item != '') {
            let expr = item
            this.matchContent && (expr = `${item} ${this.matchSymbol} ${this.matchContent}`)
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + expr + '&start=' + this.$stringTimeParseToUnix(this.filterTime[0]) + '&end=' + this.$stringTimeParseToUnix(this.filterTime[1]) + '&limit=' + limit))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          this.logData = res.map(r => r.data)
          const hasGraph = this.logData.some(d => d.resultType === 'matrix')
          const hasLog = this.logData.some(d => d.resultType === 'streamsFormat')
          const graphTabIndex = this.showTab.indexOf('1')
          if (hasGraph) {
            if (graphTabIndex === -1) {
              this.showTab.push('1')
            }
          } else {
            if (graphTabIndex > -1) {
              this.showTab.splice(graphTabIndex, 1)
            }
          }
          const logTabIndex = this.showTab.indexOf('2')
          if (hasLog) {
            if (logTabIndex === -1) {
              this.showTab.push('1')
            }
          } else {
            if (logTabIndex > -1) {
              this.showTab.splice(logTabIndex, 1)
            }
          }
          this.$nextTick(() => {
            hasGraph && this.loadLogGraph()
          })
        })
      }
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChart.startLoading()
        const promqlInputIndexs = []
        const queryExpression = []
        const series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '') {
            promqlInputIndexs.push(index)
            queryExpression.push(item)
          }
          this.logData.forEach((response, index) => {
            if (response.resultType === 'matrix') {
              const promqlIndex = promqlInputIndexs[index]
              const data = response.result
              if (!data || data.length < 1) {
                return
              }
              data.forEach((result, i) => {
                const seriesItem = {
                  name: '',
                  symbol: 'emptyCircle', // 去掉点
                  symbolSize: [2, 2],
                  showSymbol: false,
                  smooth: 0.2, // 曲线变平滑
                  data: [],
                  lineStyle: {
                    width: 1,
                    opacity: 0.9
                  },
                  type: 'line'
                }
                let legendName = ''
                seriesItem.data = result.values.map((item) => {
                  return [item[0] * 1000, item[1]]
                })
                if (result.metric && Object.keys(result.metric).length > 0) {
                  const metric = Object.assign({}, result.metric)
                  seriesItem.name += metric.__name__ ? metric.__name__ : ''
                  seriesItem.name += '{'
                  delete metric.__name__
                  for (const key in metric) {
                    seriesItem.name += key + '=' + '"' + metric[key] + '",'
                  }
                  legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                  legendName += '}'
                } else {
                  legendName = queryExpression[index]
                }
                seriesItem.name = legendName + '-' + index
                series.push(seriesItem)
                legend.push({ name: seriesItem.name, alias: legendName, isGray: false })
              })

              this.$refs['promql-' + promqlIndex][0].setError('')
            }
          })
        })
        this.$refs.logChart.setLegend(legend)
        this.$refs.logChart.setRandomColors(series.length)
        this.$refs.logChart.setSeries(series)
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.logChart.endLoading()
        })
      }
    }
  },
  mounted () {
    this.expressions = [`{project="${this.obj.project.name}",module="${this.obj.module.name}",endpoint="${this.obj.name}"}`]
    this.queryLogData()
  }
}
</script>

<style>
.symbol-select .el-input__inner {
  padding-left: 8px;
}
</style>
