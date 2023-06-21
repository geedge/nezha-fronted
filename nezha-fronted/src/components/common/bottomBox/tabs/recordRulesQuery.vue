<template>
  <div class="full-width-height recordRules-query">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :layout="[]"
      :tabs="tabs"
      :targetTab="targetTab"
      :showPagination="false"
      @changeTab="changeTab"
      :customTool="true"
      class="full-width-height"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <div class="top-tool-right">
          <div class="top-tool-search margin-r-20">
            <el-input ref="elementQuery" @clear="clearInput" id="elementQuery" @focus="focusInput"  @blur="blurInput" v-model="queryExpression" class="query-input-inactive" size="mini" clearable  :placeholder="$t('project.endpoint.promExpr')" >
              <i slot="suffix" class="el-input__icon nz-icon nz-icon-search" style="float:right" @click="focusInput"></i>
            </el-input>
          </div>
          <div class="margin-r-20 nz-btn-group">
            <button @click="changeTime(-10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-prepend" style="height:32px" id="recordRules-query-changetime" :title="$t('overall.decreaseTime')"><i class="el-icon-d-arrow-left"></i></button>
            <my-date-picker
              v-model="formatTime"
              type="datetime"
              size="mini"
              class="project-calendar nz-input-group-middle"
              clearable
              :time-arrow-control="true"
              placeholder="Moment"
              :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
              :format="timeFormatStrToDatePickFormat(timeFormatMain)"
          >
          </my-date-picker>
            <button @click="changeTime(10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-append" style="height:32px" :title="$t('overall.increaseTime')"><i class="el-icon-d-arrow-right"></i></button>
          </div>
          <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light" style="height: 28px;">
            <button class="nz-btn nz-btn-size-normal nz-btn-style-light" :class="{'control-icon-unchecked':selectedrecordRules.length<1,'control-icon-checked':selectedrecordRules.length>0}" @click="viewGraph" :title="$t('overall.showLineChart')">
              <i class="nz-icon nz-icon-chart"  :class="{'control-icon-unchecked':selectedrecordRules.length<1,'control-icon-checked':selectedrecordRules.length>0}"></i>
            </button>
            <button @click="dropdownHandler(dropdownShow)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go">
            <i class="nz-icon nz-icon-arrow-down"></i>
            <transition name="el-zoom-in-top">
              <div v-if="dropdownShow" class="recordRules-query-dropdown el-popover" style="right: 11px;top: 33px;">
                <span style="padding-top: 2px">{{$t('project.endpoint.hideSameLabels')}}</span>
                <el-switch v-model="hideSameLabels" size="small"></el-switch>
              </div>
            </transition>
          </button>
          </div>
        </div>
      </template>
      <template v-slot>
        <recordRulesQueryTab
          ref="recordRulesQueryTab"
          :orderByFa="'id'"
          :from="from"
          :obj="obj"
          :formatTime="formatTime"
          :hideSameLabels="hideSameLabels"
          :queryExpression="queryExpression"
          @changSelection="changSelectionF"
          @selectedrecordRulesChange="selectedrecordRulesChange"
        />
      </template>
    </nz-bottom-data-list>
  </div>
</template>

<script>
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import recordRulesQueryTab from '@/components/common/table/special/recordRulesQueryTab'
import bus from '@/libs/bus'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
export default {
  name: 'recordRulesQuery',
  mixins: [subDataListMixin, detailViewRightMixin],
  props: {
    from: {}
  },
  components: {
    nzBottomDataList,
    recordRulesQueryTab
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
        this.searchLabel = {}
        this.formatTime = bus.timeFormate(new Date(bus.computeTimezoneTime(new Date())))
      }
    }
  },
  data () {
    return {
      nowTime: '',
      rightBox: {
        editShow: false,
        show: false
      },
      fromBottom: true,
      selectedrecordRules: [],
      queryExpression: '',
      dropdownShow: false,
      timeout: null,
      formatTime: '',
      hideSameLabels: true
    }
  },
  methods: {
    focusInput () {
      let classVal = document.getElementById('elementQuery').parentElement.getAttribute('class')
      classVal = classVal.replace('query-input-inactive', 'query-input-active')
      document.getElementById('elementQuery').parentElement.setAttribute('class', classVal)
      this.$refs.elementQuery.focus()
    },
    blurInput () {
      if (!this.queryExpression || this.queryExpression == '') {
        setTimeout(function () {
          let classVal = document.getElementById('elementQuery').parentElement.getAttribute('class')
          classVal = classVal.replace('query-input-active', 'query-input-inactive')
          document.getElementById('elementQuery').parentElement.setAttribute('class', classVal)
        }, 100)
      }
    },
    clearInput () {
      this.$refs.elementQuery.focus()
    },
    changeTime (size, unit) {
      this.formatTime = this.getTime(size, unit)
    },
    getTime (size, unit) { // 计算时间
      const now = !this.formatTime ? new Date(bus.computeTimezone(new Date().getTime())) : new Date(bus.formateTimeToTime(this.formatTime))
      if (unit) {
        switch (unit) {
          case 'y':
            now.setFullYear(now.getFullYear() + size)
            break
          case 'M':
            now.setMonth(now.getMonth() + size)
            break
          case 'd':
            now.setDate(now.getDate() + size)
            break
          case 'h':
            now.setHours(now.getHours() + size)
            break
          case 'm':
            now.setMinutes(now.getMinutes() + size)
            break
          case 's':
            now.setSeconds(now.getSeconds() + size)
            break
          default:
            console.error('unit error')
        }
      } else {
        now.setSeconds(now.getSeconds() + size)
      }
      const year = now.getFullYear()
      let month = now.getMonth() + 1
      month = month < 10 ? '0' + month : month
      let day = now.getDate()
      day = day < 10 ? '0' + day : day
      let hour = now.getHours()
      hour = hour < 10 ? '0' + hour : hour
      let minute = now.getMinutes()
      minute = minute < 10 ? '0' + minute : minute
      let second = now.getSeconds()
      second = second < 10 ? '0' + second : second
      const str = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
      return bus.timeFormate(new Date(str))
    },
    viewGraph () {
      this.$refs.recordRulesQueryTab.viewGraph()
      this.dropdownHandler(true)
    },
    dropdownHandler (show) {
      if (!show) {
        this.dropdownShow = true
      } else {
        this.dropdownShow = false
      }
    },
    changSelectionF (arr) {
      this.changSelection = arr
    },
    selectedrecordRulesChange (n) {
      this.selectedrecordRules = n
    },
    toTop (wrap) {
      let currentTop = wrap.scrollTop
      const interval = currentTop / 10
      const intervalFunc = setInterval(function () { // 花200ms分10次回到顶部，模拟动画效果
        if (currentTop === 0) {
          clearInterval(intervalFunc)
        } else {
          currentTop = (currentTop - interval) < interval * 0.5 ? 0 : currentTop - interval
          wrap.scrollTop = currentTop
        }
      }, 20)
    }
  }
}
</script>
