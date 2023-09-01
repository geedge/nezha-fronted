<template>
 <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      id="logBottomTab"
      :tableId="tableId"
    :custom-tool="true"
    :layout="[]"
    :show-pagination="false"
    :tabs="tabs"
    :targetTab="targetTab"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot:top-tool-right>
      <el-input v-model="matchContent" class="margin-r-10" placeholder="" size="small" @keyup.enter.native="dateChange()">
        <el-select slot="prepend" v-model="matchSymbol" class="symbol-select" size="small" style="width: 60px;">
          <el-option value="|=">
            <span style="font-family: Inter-Regular">|=</span>
          </el-option>
          <el-option value="!=">
            <span style="font-family: Inter-Regular">!=</span>
          </el-option>
          <el-option value="|~">
            <span style="font-family: Inter-Regular">|~</span>
          </el-option>
          <el-option value="!~">
            <span style="font-family: Inter-Regular">!~</span>
          </el-option>
        </el-select>
        <button  slot="suffix" class="search-icon-btn"><i class="el-icon-search" @click="dateChange()"></i></button>
      </el-input>
      <pick-time id="explore" ref="pickTime" v-model="filterTime" :refresh-data-func="getData" :show-locked="true" :sign="sign" :use-chart-unit="false" :use-refresh="false">
        <template slot="added-text">{{$t('overall.query')}}</template>
      </pick-time>
    </template>
    <template v-slot>
      <log-tab ref="logDetail" v-my-loading="loading" :loading-bottom="endpointLoading" :time-range="filterTime" :log-data="logData" :tab-index="9" @exportLog="exportLog" @limitChange="queryLogData"></log-tab>
<!--      <div v-my-loading="loading" v-if="!logData" style="height: 300px; width: 100%; display: flex; justify-content: center; align-items: center; color: #999;">No Data</div>-->
    </template>
  </nz-bottom-data-list>
</template>

<script>
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import logTab from '@/components/page/dashboard/explore/logTab'
import subDataListMixin from '@/components/common/mixin/subDataList'
import axios from 'axios'
import bus from '@/libs/bus'
import { fromRoute } from '@/components/common/js/constants'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'logBottomTab',
  mixins: [subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    logTab
  },
  props: {
    sign: [Number, String]
  },
  data () {
    return {
      tableId: 'logBottomTab',
      logData: null,
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData())
      ],
      expressions: [''],
      matchSymbol: '|=',
      matchContent: '',
      loading: true,
      endpointLoading: false,
      limit: 100,
      nowTimeType: {}
    }
  },
  computed: {
    timePickerLocked () {
      return this.$store.getters.getTimePickerLocked
    },
    timePickerRange () {
      return this.$store.getters.getTimePickerRange
    }
  },
  methods: {
    exportLog ({ limit, descending }) {
      const params = {
        logql: this.expressions,
        start: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])),
        end: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])),
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
    dateChange () {
      this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.refresh()
    },
    getData () {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.setSearchTime('filterTime')
      this.$store.dispatch('dispatchTimePickerRange', {
        time: this.searchTime,
        nowTimeType: this.nowTimeType
      })
      this.queryLogData()
    },
    setTimePickerRange () {
      this.$nextTick(() => {
        if (!this.timePickerLocked || !this.timePickerRange.nowTimeType) {
          return
        }
        const nowTimeType = this.nowTimeType = this.timePickerRange.nowTimeType
        this.filterTime = this.timePickerRange.time
        this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.setTimeRange(this.nowTimeType, this.filterTime)
        this.setSearchTime('filterTime')
      })
    },
    queryLogData (limit) { // log的chart和table是一个请求
      this.loading = true
      if (limit) {
        this.limit = limit
      }
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          if (item != '') {
            let expr = item
            this.matchContent && (expr = `${item} ${this.matchSymbol} "${this.matchContent}"`)
            const statTime = bus.formateTimeToTime(this.filterTime[0])
            const endTime = bus.formateTimeToTime(this.filterTime[1])
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(expr) + '&start=' + this.$stringTimeParseToUnix(statTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&limit=' + this.limit))
          }
        })
        axios.all(requestArr).then(res => {
          this.logData = res.map(r => r.data)
          if (this.logData[0]) {
            if (this.logData[0].result.length > 0) {
              this.endpointLoading = false
            } else {
              this.endpointLoading = true
            }
          } else {
            this.endpointLoading = true
          }
        }).finally(() => {
          this.loading = false
        })
      } else {
        this.loading = false
      }
    }
  },
  mounted () {
    if (this.from === fromRoute.endpoint) {
      this.expressions = [`{project="${this.obj.project.name}",module="${this.obj.module.name}",endpoint="${this.obj.name}"}`]
    } else if (this.from === fromRoute.asset) {
      this.expressions = [`{asset="${this.obj.name}"}`]
    }
    this.setTimePickerRange()
    this.$nextTick(() => {
      this.queryLogData()
    })
  }
}
</script>
