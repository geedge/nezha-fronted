<template>
  <div style="height: 100%;width: 100%">
    <div class="time-line-header">
      {{$t('alert.relatedAlerts')}}
      <el-select
        id="time-line-scope"
        v-model="scope"
        multiple
        collapse-tags
        :placeholder="$t('el.select.placeholder')"
        popper-class="right-box-select-top prevent-clickoutside"
        size="small"
        @change="changeScope"
      >
        <el-option
          v-for="item in scopeList"
          :key="item.key"
          :label="$t(item.label)"
          :value="item.key"
        >
        </el-option>
      </el-select>
    </div>
    <el-timeline v-my-loading="loading" v-if="!noData">
      <el-timeline-item
        v-for="(item,index) in timeLineData"
        :key="item.id"
        :class="{
          'only': timeLineData.length === 1 ,
          'has-time': item.startAt
        }"
        :timestamp="item.startAt?item.startAt: ''"
        placement="top">
        <div >
          <div class='margin-b-10'>
            <span slot="title-icon" v-if="item['state']" style="margin-left: 5px" class="alert-message-state" :class="{'gray-bg': item['state'] == 3, 'red-bg': item['state'] == 1,'yellow-bg': item['state'] == 2}">{{$t(stateOptions.find(state=>state.value == item['state']).label)}}</span>
            <span class="time-line-item-header"> {{item.alertRule.name}}</span>
          </div>
          <div>
          <span v-for="(label, i) in labelsSort(JSON.parse(item.labels))" :key="i">
            <span
              @mouseenter="labelHover(item, label.label, true, true, $event)"
              @mouseleave="labelHover(item, label.label, false, true,)">
              <nz-alert-tag
                v-if="label.label !== 'alertname' && label.label !== 'severity'" :key="label.label" :cursor-point="tagType(label.label) !== 'info'"
                :label="label.label"
                :type="tagType(label.label)"
                style="margin: 5px 0 5px 5px;"
              >
               {{label.value}}
              </nz-alert-tag>
            </span>
          </span>
          </div>
        </div>
      </el-timeline-item>
<!--      <div @click="getTimeLineData" v-if="timeLineData.length === total">加载更多</div>-->
<!--      <div v-else>没有更多了</div>-->
    </el-timeline>
    <div class="table-no-data" v-else>
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
    ></alertLabel>
  </div>
</template>

<script>
import { alertMessage as alertMessageConstant } from '@/components/common/js/constants'
import alertMessageLabelMixin from '@/components/common/alert/alertMessageLabelMixin'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'

export default {
  name: 'alertMessageInfoTimeLine',
  props: {
    infoData: {
      type: Object
    },
    time: {}
  },
  mixins: [alertMessageLabelMixin, alertLabelMixin],
  computed: {
    severityData () {
      return this.$store.getters.severityData
    }
  },
  data () {
    return {
      pageNo: 1,
      pageSize: 20,
      scope: ['asset', 'datacenter', 'project', 'module', 'endpoint', 'alertrule', 'hash '],
      timeLineData: [],
      lastDataTime: '',
      loading: false,
      dateFormatStr: localStorage.getItem('nz-default-dateFormat') ? localStorage.getItem('nz-default-dateFormat') : 'YYYY-MM-DD HH:ss:mm',
      noData: false,
      stateOptions: alertMessageConstant.states,
      scopeList: [{
        key: 'asset',
        label: this.$t('overall.asset')
      }, {
        key: 'datacenter',
        label: this.$t('overall.dc')
      }, {
        key: 'project',
        label: this.$t('overall.project')
      }, {
        key: 'module',
        label: this.$t('overall.module')
      }, {
        key: 'endpoint',
        label: this.$t('overall.endpoint')
      },
      {
        key: 'alertrule',
        label: this.$t('alert.alertRule')
      }, {
        key: 'hash',
        label: this.$t('overall.hash')
      }
      ],
      total: 20
    }
  },
  mounted () {
    this.getTimeLineData(1)
    const dateFormatStr = localStorage.getItem('nz-default-dateFormat')
    if (dateFormatStr) {
      this.dateFormatStr = dateFormatStr.split(' ')[0]
    } else {
      this.dateFormatStr = 'YYYY-MM-DD'
    }
  },
  methods: {
    getTimeLineData (pageNo = this.pageNo) {
      this.noData = false
      this.loading = true
      const params = {
        pageNo: pageNo,
        pageSize: this.pageSize,
        scope: this.scope.join(','),
        id: this.infoData.id,
        state: '',
        startAt: this.time[1],
        endAt: this.time[0],
        orderBy: '-startAt'
      }
      this.$get('/alert/message/rel', params).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.total = res.data.total
          if (pageNo == 1) {
            this.timeLineData = res.data.list
          } else {
            this.timeLineData.push(...res.data.list)
          }
          this.disposeTime(pageNo)
          this.noData = false
          this.pageNo++
        } else {
          this.noData = true
        }
      }).catch(() => {
        this.loading = false
        this.noData = true
      })
    },
    disposeTime (pageNo) {
      let i = (pageNo - 1) * this.pageSize
      for (i; i < this.timeLineData.length; i++) {
        const lastDataTime = this.timestampStr(this.timeLineData[i].startAt, this.dateFormatStr)
        if (this.lastDataTime !== lastDataTime) {
          this.lastDataTime = lastDataTime
          this.timeLineData[i].startAt = lastDataTime
        } else {
          this.timeLineData[i].startAt = ''
        }
      }
    },
    changeScope (value) {
      console.log(value)
      this.getTimeLineData(1)
    }
  }
}
</script>

<style scoped>

</style>
