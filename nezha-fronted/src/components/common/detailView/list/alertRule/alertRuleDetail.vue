<template>
  <div class="detail-left-box">
    <div class="order-box">
      <el-select v-model="orderBy" size="small" :placeholder="$t('asset.detail.orderBy')" popper-class="right-box-select-top" class="detail-select">
        <el-option
          v-for="item in tableTitle"
          v-if="item.sortable==='custom'"
          :key="item.prop"
          :label="$t('asset.detail.orderByLabel',{label:item.label})"
          :value="item.prop">
          {{item.label}}
        </el-option>
      </el-select>
      <button @click="orderTypeChange" size="small" class="detail-button top-tool-btn table-column-setting margin-l-10">
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'" :title="$t('dashboard.explore.ascending')"/>
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'" :title="$t('dashboard.explore.descending')"/>
      </button>
    </div>
    <ul class="detail-row-box" ref="dataTable">
      <li
        v-for="(item,index) in tableData"
        :key="index"
        class="detail-row"
        :id="'globalSearch' + item.id"
        :class="item.id === detailViewRightObj.id ? 'selected' : ''"
        @click="detailViewRightShow(item)"
        @mouseenter="alertMessageHover(item, true, $event)"
        @mouseleave="alertMessageHover(item, false)"
      >
        <alertRuleInfo v-if="item.loading" :id="item.id" :severity-data="severityData" :that="item" @showText="showText(item)" :detail-list="true"></alertRuleInfo>
        <div class="detail-row-info" slot="reference">
          <div class="asset-manageIp">
            <i class="nz-icon nz-icon-overview-alert" :class="item.alertNum>0?'colorEF7458':'color23BF9A'"/>
            {{item.name}}
          </div>
          <div class="asset-name">
            <span>
              <span v-if="item.type === 1">{{ $t('overall.metric') }}</span>
              <span v-else-if="item.type === 2">{{ $t('overall.logs') }}</span>
              <span v-else-if="item.type === 3">SNMP trap</span>
              <span v-else>-</span>
            </span>
          </div>
        </div>
      </li>
    </ul>
    <el-dialog class="nz-dialog table-chart-dialog" :title="$t('alert.config.trbShot')"
               :visible.sync="dialogShowText"
               width="96%"  @close="dialogShowText = false" :modal-append-to-body="false">
      <div slot="title">
        <span class="nz-dialog-title">{{$t('alert.config.trbShot')}}</span>
      </div>
      <div class="rich-text-screen-container"  >
        <div id="chartScreenContainer"  ref="chartScreenContainer" class="text-content" >
          <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
            <div style="height: 100%;" v-html="dialogText" ></div>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
import alertRuleInfo from '@/components/common/alert/alertRuleInfo'
export default {
  name: 'alertRuleDetail',
  mixins: [detailViewLeftMixin],
  components: {
    alertLabel,
    alertRuleInfo
  },
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('alert.alertName'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('alert.config.expr'),
          prop: 'expr',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('alert.config.operator'),
          prop: 'operator',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('alert.config.threshold'),
          prop: 'threshold',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('alert.config.for'),
          prop: 'last',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('alert.severity'),
          prop: 'severity',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'description',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('alert.alert'),
          prop: 'alertNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('alert.receiver'),
          prop: 'receivers',
          show: false,
          minWidth: 100
        },
        {
          label: this.$t('alert.notify'),
          prop: 'method',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }
      ],
      severityData: [],
      dialogText: '',
      dialogShowText: false
    }
  },
  mounted () {
    this.getSeverityData()
  },
  methods: {
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    suspendedStr (status) { // 10进制转为2进制 分别给对应的状态
      if (!status || status === 1 || status == 0) { return '' }
      const arr = status.toString(2).split('')
      while (arr.length < 4) {
        arr.unshift('0')
      }
      arr.pop()
      let str = ''
      arr.forEach((item, index) => {
        if (index === 0) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> DC</div>`
        }
        if (index === 1) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> ASSET</div>`
        }
        if (index === 2) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> ENDPOINT</div>`
        }
        // if (index === 3) {
        //   str += `<div>PROMETHEUS <div class="active-icon inline-block ${item == '0' ? 'red-bg' : 'green-bg'}"></div></div>`
        // }
      })
      return str
    },
    getSeverityData () {
      this.$get('alert/severity', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.severityData = response.data.list
        }
      })
    },
    // alertName鼠标划入
    alertMessageHover (item, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
      // item.loading = true;
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    showText (row) {
      this.dialogShowText = true
      this.dialogText = row.trbShot
    }
  }
}
</script>
<style>
.alert-rule-detail {
  left: 440px !important;
}
</style>
