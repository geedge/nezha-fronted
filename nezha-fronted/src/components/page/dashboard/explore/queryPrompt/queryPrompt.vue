<template>
  <div
    class="explore-history-box query-prompt-box"
    v-clickoutside="hideMe"
    v-my-loading="firstLoading"
    :style="{
      width: width + 'px',
      top: position.top + 'px',
      left: position.left + 'px'
    }"
  >
    <div class="explore-history-box-header">
      <span class="header-text">{{ type !== 'log' ? $t('overall.metric') : 'Label browser'}}</span>
      <el-input
        v-if="type !== 'log'"
        class="header-search"
        size="mini"
        v-model="searchStr"
        @input="changeSearchStr"
        :placeholder="$t('overall.search')"
        suffix-icon="nz-icon nz-icon-search"
      />
    </div>
    <div v-if="type !== 'log'" class="query-prompt-metric">
      <div class="explore-history-box-content-header">
        <div class="query-prompt-name text-ellipsis query-prompt-content-text">Name</div>
        <div class="query-prompt-type text-ellipsis query-prompt-content-text">Type</div>
        <div class="query-prompt-remark text-ellipsis query-prompt-content-text">Description</div>
      </div>
      <div
        class="explore-history-box-content"
        v-if="metricOptions.length || firstLoading"
        infinite-scroll-disabled="disabled"
        v-loadMore="{
           load: loadNextData,
           hasMore: hasMore,
        }"
      >
        <div v-for="(item, index) in metricOptions" :key="index" :title="item.value" class="explore-history-item" @click.stop="selectMetric(item)">
          <div class="query-prompt-name query-prompt-content-text" :title="item.name">
            <span class="query-prompt-content-title text-ellipsis">{{item.name}}</span>
            <i class=" query-prompt-content-icon nz-icon nz-icon-override" @click.stop="copyItem(item.name)"></i>
          </div>
          <div class="query-prompt-type text-ellipsis query-prompt-content-text" :title="item.gname">{{item.gname}}</div>
          <div class="query-prompt-remark text-ellipsis query-prompt-content-text" :title="item.remark">
            <span class="query-prompt-content-title text-ellipsis">{{item.remark}}</span>
            <i class=" query-prompt-content-icon nz-icon nz-icon-huiche" @click.stop="selectMetric(item)"></i>
          </div>
        </div>
        <div v-if="pageObj.total > metricOptions.length" v-my-loading.scaleMin="loading" class="explore-history-item no-more">
          {{$t('el.select.loading')}}...
        </div>
        <div v-else class="explore-history-item no-more" :class="metricOptions.length< 9 ? 'in-bottom': ''">
          {{$t('overall.noMoreData')}}
        </div>
      </div>
      <div v-else class="explore-history-box-content nodata">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-no-data-list"></use>
        </svg>
        <div class="table-no-data__title">{{$t('overall.noDataAvailable')}}</div>
      </div>
    </div>
    <div v-if="type === 'log'"  class="query-prompt-log" v-my-loading="logLoading">
      <div>1.Select label names and values</div>
      <div class="query-prompt-log-content" style="">
        <div class="query-prompt-log-content-left">
          <div v-for="item in logLabels" :key="item" class="log-content-left-label">
            {{item}}
          </div>
        </div>
        <div class="query-prompt-log-content-right">
          <div v-for="item in logValues">

          </div>
        </div>
      </div>
      <div>2.Resulting selector</div>
      <div class="query-prompt-log-final">
        {{logFinalStr}}
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import { get } from '@/http'

export default {
  name: 'queryPrompt',
  // todo 显示位置调整
  props: {
    type: {
      type: String,
      default: 'metric'
    },
    width: {
      type: Number,
      default: 626
    },
    position: {
      type: Object,
      default () {
        return {
          top: 0,
          left: 0
        }
      }
    }
  },
  data () {
    return {
      oldMetricOptions: [],
      searchMetricOptions: [],
      metricOptions: [],
      metaData: [],
      loading: false,
      firstLoading: false,
      searchStr: '',
      hasMore: false,
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0
      },
      logFinalStr: {},
      logLabels: [],
      logLabelsShow: '',
      logValues: [],
      selectLogLabels: {},
      logLoading: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      if (this.type === 'metric' || this.type === 'metrics') {
        this.metricInit()
      }
      if (this.type === 'log') {
        this.logInit()
      }
    },
    metricInit () {
      this.firstLoading = true
      this.pageObj = {
        pageNo: 1,
        pageSize: 20,
        total: 0
      }
      const promiseArr = []
      this.oldMetricOptions = []
      this.metricOptions = []
      promiseArr.push(this.$get('/prom/api/v1/label/__name__/values'))
      promiseArr.push(this.$get('/prom/api/v1/metadata'))
      promiseArr.push(this.$get('/expression/tmpl?pageSize=-1'))
      Promise.all(promiseArr).then(allRes => {
        const values = allRes[0]
        const metaData = this.metaData = allRes[1]
        const template = allRes[2]
        const arr = []
        if (template.code === 200) { // 首先处理template
          arr.push(...template.data.list)
        }

        if (values.code === 200 && metaData.code === 200) { // 处理 metaData 以及values为一个数组 格式与template 保持一致
          arr.push(...this.calcMetaData(metaData.data, values.data))
        } else if (values.code === 200) {
          arr.push(...this.calcMetaData({}, values.data))
        } else if (metaData.code === 200) {
          arr.push(...this.calcMetaData(metaData.data, []))
        }
        if (values.code !== 200) {
          this.$message.error(values.msg || values.error)
        }
        if (metaData.code !== 200) {
          this.$message.error(metaData.msg || metaData.error)
        }
        if (template.code !== 200) {
          this.$message.error(template.msg || template.error)
        }
        this.oldMetricOptions = this.$lodash.cloneDeep(arr)
        this.searchMetricOptions = this.$lodash.cloneDeep(arr)
        this.pageObj.total = this.searchMetricOptions.length
        this.metricOptions = arr.slice(0, 20)
        this.firstLoading = false
        this.hasMore = this.pageObj.total > this.metricOptions.length
      })
    },
    calcMetaData (metaData, values) {
      const obj = {}
      values.forEach(item => {
        obj[item] = [{ type: '', help: '', unit: '' }]
      })
      const mergeObj = Object.assign(obj, metaData)
      const arr = Object.keys(mergeObj).map(key => {
        const item = {
          id: undefined,
          name: key,
          gname: mergeObj[key][0].type,
          expression: key,
          remark: mergeObj[key][0].help,
          buildIn: 0,
          vars: null,
          varsVal: null
        }
        return item
      })
      return arr
    },
    logInit () {
      this.logLoading = true
      this.$get('/logs/loki/api/v1/labels').then(res => {
        if (res.code === 200) {
          this.logLabels = res.data
          this.logLabelsShow = this.logLabels[0]
          this.getLogLabelsValues(this.logLabels[0])
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    getLogLabelsValues (labels) {
      this.logLoading = true
      this.logValues = []
      this.$get(`/logs/loki/api/v1/label/${labels}/values`).then(res => {
        this.logLoading = false
        if (res.data) {
          const nodes = res.data.sort().map(d => ({
            value: d,
            label: d,
            leaf: true
          }))
          this.logValues = nodes
        } else {
          this.logValues = []
        }
        console.log(this.logValues)
      })
    },
    hideMe () {
      this.$emit('close')
    },
    changeSearchStr: bus.debounce(function (val) {
      this.search()
    }, 300),
    search () {
      if (this.searchStr) {
        this.searchMetricOptions = this.oldMetricOptions.filter(item => item.name.indexOf(this.searchStr) !== -1)
      } else {
        this.searchMetricOptions = this.$lodash.cloneDeep(this.oldMetricOptions)
      }
      this.metricOptions = this.searchMetricOptions.slice(0, 20)
      this.pageObj.pageNo = 1
      this.pageObj.total = this.searchMetricOptions.length
    },
    loadNextData: bus.debounce(function (val) {
      this.pageObj.pageNo++
      this.loadData()
    }, 300),
    loadData () {
      const pageNo = this.pageObj.pageNo
      const arr = this.searchMetricOptions.slice((pageNo - 1) * 20, pageNo * 20)
      this.metricOptions.push(...arr)
      this.hasMore = this.pageObj.total > this.metricOptions.length
    },
    selectMetric (item) {
      this.$emit('selectMetric', item)
      this.hideMe()
    },
    copyItem (value) {
      this.$copyText(value).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  }
}
</script>
