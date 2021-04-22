<template>
  <div class="full-width-height">
    <nz-bottom-data-list
      :api="url"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab="targetTab"
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
          <div class="margin-r-20 nz-btn-group nz-btn-group-size-small nz-btn-group-light">
            <button @click="changeTime(-10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-prepend" id="endpoint-query-changetime"><i class="el-icon-d-arrow-left"></i></button><el-date-picker
            v-model="formatTime"
            type="datetime"
            size="mini"
            class="project-calendar nz-input-group-middle"
            clearable
            :time-arrow-control="true"
            placeholder="Moment"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker><button @click="changeTime(10)" class="nz-btn nz-btn-size-normal nz-btn-style-light change-time-height nz-input-group-append"><i class="el-icon-d-arrow-right"></i></button>
          </div>
          <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light" style="height: 24px;">
            <button class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="viewGraph">
              <i class="nz-icon nz-icon-chart"  :class="{'control-icon-unchecked':selectedEndpoints.length<1,'control-icon-checked':selectedEndpoints.length>0}"></i>
            </button><button @mouseenter="dropdownHandler(true)" @mouseleave="dropdownHandler(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go">
            <i class="nz-icon nz-icon-arrow-down"></i>
            <transition name="el-zoom-in-top">
              <div v-if="dropdownShow" class="endpoint-query-dropdown el-popover">
                <span style="padding-top: 2px">{{$t('project.endpoint.hideSameLabels')}}</span>
                <el-switch v-model="hideSameLabels" active-color="#ee9d3f" size="small"></el-switch>
              </div>
            </transition>
          </button>
          </div>
        </div>
      </template>
      <template v-slot>
        <endpointQueryTab
          ref="endpointQueryTab"
          :from="from"
          :obj="obj"
          :formatTime="formatTime"
          :hideSameLabels="hideSameLabels"
          :queryExpression="queryExpression"
          @changSelection="changSelectionF"
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

export default {
  name: 'endpointTab',
  mixins: [subDataListMixin],
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
        console.log(n)
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
      dropdownShow: '',
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
    viewGraph () {
      this.$refs.endpointQueryTab.viewGraph()
    },
    dropdownHandler (show) {
      if (show) {
        clearTimeout(this.timeout)
        this.dropdownShow = true
      } else {
        this.timeout = setTimeout(() => {
          this.dropdownShow = false
        }, 700)
      }
    },
    changSelectionF (arr) {
      this.changSelection = arr
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
<style scoped>
  .full-width-height{
    width: 100%;
    height: 100%;
  }
</style>
