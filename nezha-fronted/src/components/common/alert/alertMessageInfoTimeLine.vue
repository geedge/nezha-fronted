<template>
  <div style="height: 100%; width: 100%" id="alert" class="message-time-line">
    <div class="time-line-header">
      <span>{{ $t("alert.relatedAlerts") }}</span>
      <div class="scope-icon-box">
        <div
          class="scope-box"
          v-for="item in scopeList"
          :class="item.isSelect ? 'is-select' : ''"
          :key="item.type"
          @click="scopeChange(item)"
          :title="item.label"
        >
          <i class="nz-icon" :class="selectIcon(item)" />
        </div>
      </div>
    </div>
    <el-timeline v-my-loading="loading" v-if="!noData && timeLineData.length">
      <el-timeline-item
        v-for="(item, index) in timeLineData"
        :key="item.id"
        :class="{
          only: timeLineData.length === 1,
          'has-time': item.startAt,
          last: index === timeLineData.length - 1 && index !== 0,
        }"
        :color="item.severity.color"
        :timestamp="item.startAt ? item.startAt : ''"
        placement="top"
      >
        <div>
          <div class="margin-b-10">
            <span
              slot="title-icon"
              v-if="item['state']"
              style="margin-left: 5px"
              class="alert-message-state"
              :class="{
                'gray-bg': item['state'] == 3,
                'red-bg': item['state'] == 1,
                'yellow-bg': item['state'] == 2,
              }"
              >{{
                $t(
                  stateOptions.find((state) => state.value == item["state"])
                    .label
                )
              }}</span
            >
            <span class="time-line-item-header">
              {{ item.alertRule.name }}</span
            >
          </div>
          <div class="alert-message-summary">{{ item.summary }}</div>
          <div class="alert-message-startAt">
            <span>Start time:</span>
            <span>{{utcTimeToTimezoneStr(item.startTime)}}</span>
            <span>Duration:</span>
            <span>{{getDuration(item)}}</span>
          </div>
          <div class="alert-message-labels">
            <span
              v-for="(label, i) in labelsSort(JSON.parse(item.labels))"
              :key="i"
            >
              <span
                @mouseenter="labelHover(item, label.label, true, true, $event)"
                @mouseleave="labelHover(item, label.label, false, true)"
              >
                <nz-alert-tag
                  v-if="
                    label.label !== 'alertname' && label.label !== 'severity'
                  "
                  :key="label.label"
                  :cursor-point="tagType(label.label) !== 'info'"
                  :label="label.label"
                  :type="tagType(label.label)"
                  style="margin: 5px 0 5px 5px"
                >
                  {{ label.value }}
                </nz-alert-tag>
              </span>
            </span>
          </div>
        </div>
      </el-timeline-item>
      <div v-if="timeLineData.length >= total" style="text-align: center">
        {{ $t("overall.noMoreData") }}
      </div>
      <div v-else class="load-more-box">
        <el-button size="small" @click="getTimeLineData()" :loading="loading">{{
          $t("overall.loadMore")
        }}</el-button>
      </div>
    </el-timeline>
    <div class="table-no-data" v-else>
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
    <alertLabel
      v-if="alertLabelShow"
      :alertTableDialog="true"
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
import { calcDurationByStringTimeB } from '@/components/common/js/tools.js'
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
    },
    getDuration () {
      return function (record) {
        if (record.endAt) {
          return calcDurationByStringTimeB(record.startTime, record.endAt)
        }
        return calcDurationByStringTimeB(record.startTime, this.nowTime)
      }
    }
  },
  watch: {
    time: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n && n.length) {
          this.pageNo = 1
          this.lastDataTime = ''
          this.getTimeLineData()
        }
      }
    }
  },
  data () {
    return {
      pageNo: 1,
      pageSize: 20,
      scope: [
        'asset',
        'datacenter',
        'project',
        'module',
        'endpoint',
        'alertrule',
        'hash'
      ],
      timeLineData: [],
      lastDataTime: '',
      loading: false,
      dateFormatStr: localStorage.getItem('nz-default-dateFormat')
        ? localStorage.getItem('nz-default-dateFormat')
        : 'YYYY-MM-DD HH:ss:mm',
      noData: false,
      stateOptions: alertMessageConstant.states,
      scopeList: [
        {
          key: 'asset',
          isSelect: true,
          label: this.$t('asset.asset')
        },
        {
          key: 'datacenter',
          isSelect: true,
          label: this.$t('overall.dc')
        },
        {
          key: 'project',
          isSelect: true,
          label: this.$t('project.project.projectName')
        },
        {
          key: 'module',
          isSelect: true,
          label: this.$t('overall.module')
        },
        {
          key: 'endpoint',
          isSelect: true,
          label: this.$t('asset.endpoint')
        },
        {
          key: 'alertrule',
          isSelect: true,
          label: this.$t('alert.rule')
        },
        {
          key: 'hash',
          isSelect: true,
          label: this.$t('overall.hash')
        }
      ],
      total: 20,
      scopeChangeTimer: null
    }
  },
  mounted () {
    // this.getTimeLineData(1)
    const dateFormatStr = localStorage.getItem('nz-default-dateFormat')
    if (dateFormatStr) {
      this.dateFormatStr = dateFormatStr.split(' ')[0]
    } else {
      this.dateFormatStr = 'YYYY-MM-DD'
    }
  },
  methods: {
    getTimeLineData () {
      this.noData = false
      this.loading = true
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        scope: this.scopeList
          .filter((item) => item.isSelect)
          .map((item) => item.key)
          .join(','),
        id: this.infoData.id,
        state: '',
        startAt: this.timezoneToUtcTimeStr(
          this.time[0] * 1000,
          'YYYY-MM-DD HH:mm:ss'
        ),
        endAt: this.timezoneToUtcTimeStr(
          this.time[1] * 1000,
          'YYYY-MM-DD HH:mm:ss'
        ),
        orderBy: '-startAt'
      }
      this.$get('/alert/message/rel', params)
        .then((res) => {
          this.loading = false
          if (res.code === 200) {
            this.total = res.data.total
            if (this.pageNo == 1) {
              this.timeLineData = res.data.list
            } else {
              this.timeLineData.push(...res.data.list)
            }
            this.disposeTime(this.pageNo)
            this.noData = false
            this.pageNo++
          } else {
            this.noData = true
          }
        })
        .catch(() => {
          this.loading = false
          this.noData = true
        })
    },
    disposeTime (pageNo) {
      let i = (pageNo - 1) * this.pageSize
      for (i; i < this.timeLineData.length; i++) {
        const lastDataTime = this.utcTimeToTimezoneStr(
          this.timeLineData[i].startAt,
          this.dateFormatStr
        )
        this.timeLineData[i].color = '#fa8'
        this.timeLineData[i].startTime = this.timeLineData[i].startAt
        if (this.lastDataTime !== lastDataTime) {
          this.lastDataTime = lastDataTime
          this.timeLineData[i].startAt = lastDataTime
        } else {
          this.timeLineData[i].startAt = ''
        }
      }
    },
    selectIcon (item) {
      switch (item.key) {
        case 'asset':
          return 'nz-icon-overview-project'
        case 'datacenter':
          return 'nz-icon-Datacenter2'
        case 'project':
          return 'nz-icon-project'
        case 'module':
          return 'nz-icon-overview-module'
        case 'endpoint':
          return 'nz-icon-overview-endpoint'
        case 'alertrule':
          return 'nz-icon-Alertrule'
        case 'hash':
          return 'nz-icon-module5'
      }
      return 'nz-icon-module5'
    },
    scopeChange (scope) {
      if (this.scopeChangeTimer) {
        clearInterval(this.scopeChangeTimer)
        this.scopeChangeTimer = null
      }
      this.loading = true
      const isSelectArr = this.scopeList.filter((item) => item.isSelect)
      if (isSelectArr.length === this.scopeList.length) {
        this.scopeList.forEach((item) => {
          item.isSelect = false
        })
        scope.isSelect = !scope.isSelect
      } else if (isSelectArr.length === 1 && isSelectArr[0].key === scope.key) {
        this.scopeList.forEach((item) => {
          item.isSelect = true
        })
      } else {
        scope.isSelect = !scope.isSelect
      }
      this.scopeChangeTimer = setTimeout(() => {
        this.pageNo = 1
        this.lastDataTime = ''
        this.getTimeLineData()
      }, 100)
    }
  }
}
</script>