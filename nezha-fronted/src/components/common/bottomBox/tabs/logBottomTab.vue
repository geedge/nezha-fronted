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
import { fromRoute } from '@/components/common/js/constants'

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
            this.matchContent && (expr = `${item} ${this.matchSymbol} "${this.matchContent}"`)
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + expr + '&start=' + this.$stringTimeParseToUnix(this.filterTime[0]) + '&end=' + this.$stringTimeParseToUnix(this.filterTime[1]) + '&limit=' + limit))
          }
        })
        axios.all(requestArr).then(res => {
          this.logData = res.map(r => r.data)
        })
      }
    }
  },
  mounted () {
    if (this.from === fromRoute.endpoint) {
      this.expressions = [`{project="${this.obj.project.name}",module="${this.obj.module.name}",endpoint="${this.obj.name}"}`]
    } else if (this.from === fromRoute.asset) {
      this.expressions = [`{asset="${this.obj.name}"}`]
    }
    this.queryLogData()
  }
}
</script>

<style>
.symbol-select .el-input__inner {
  padding-left: 8px;
}
</style>
