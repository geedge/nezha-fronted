<template>
  <div class="full-width-height endpoint-tab-new">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :api="url"
      :tableId="tableId"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
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
            <button @click="changeTime(-10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-prepend" style="height:32px" id="endpoint-query-changetime" :title="$t('overall.decreaseTime')"><i class="el-icon-d-arrow-left"></i></button>
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
            <button class="nz-btn nz-btn-size-normal nz-btn-style-light" :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}" @click="viewGraph" :title="$t('overall.showLineChart')">
              <i class="nz-icon nz-icon-chart"  :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i>
            </button>
            <button @click="dropdownHandler(dropdownShow)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go">
            <i class="nz-icon nz-icon-arrow-down"></i>
            <transition name="el-zoom-in-top">
              <div v-if="dropdownShow" class="endpoint-query-dropdown el-popover" style="right: 11px;top: 33px;">
                <span style="padding-top: 2px">{{$t('project.endpoint.hideSameLabels')}}</span>
                <el-switch v-model="hideSameLabels" size="small"></el-switch>
              </div>
            </transition>
          </button>
          </div>
        </div>
      </template>
      <template v-slot>
        <endpointQueryTab
          ref="endpointQueryTab"
          :orderByFa="'id'"
          :from="from"
          :obj="obj"
          :formatTime="formatTime"
          :hideSameLabels="hideSameLabels"
          :queryExpression="queryExpression"
          @changSelection="changSelectionF"
          @selectedEndpointsChange="selectedEndpointsChange"
        />
      </template>
<!--      <template v-slot:pagination>-->
<!--        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>-->
<!--      </template>-->
    </nz-bottom-data-list>
  </div>
</template>

<script>
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import endpointQueryTab from '@/components/common/table/special/endpointQueryTab'
import bus from '@/libs/bus'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
export default {
  name: 'endpointQuery',
  mixins: [subDataListMixin, detailViewRightMixin],
  props: {
    from: {}
  },
  components: {
    nzBottomDataList,
    endpointQueryTab
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
      url: 'monitor/endpoint',
      tableId: 'endpointTab', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [/* {
          id: 12,
          name: 'endpoint name',
          type: 'input',
          label: 'name',
          disabled: false
        },
        {
          id: 13,
          name: 'endpoint id',
          type: 'input',
          label: 'id',
          disabled: false
        } */]
      },
      nowTime: '',
      rightBox: {
        editShow: false,
        show: false
      },
      fromBottom: true,
      selectedEndpoints: [],
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
      this.$refs.endpointQueryTab.viewGraph()
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
    selectedEndpointsChange (n) {
      this.selectedEndpoints = n
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
