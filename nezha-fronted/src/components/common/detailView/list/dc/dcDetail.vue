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
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'"  :title="$t('dashboard.explore.ascending')"/>
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'"  :title="$t('dashboard.explore.descending')"/>
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
        @mouseenter="labelHover(item, 'dc', true, $event)"
        @mouseleave="labelHover(item, 'dc', false)">
        <div class="detail-row-info" :title="item.name">
          <div class="asset-manageIp">
            <i class="nz-icon nz-icon-overview-alert" :class="item.alertNum>0?'colorEF7458':'color23BF9A'"/>
            {{item.name}}
          </div>
          <div class="asset-name">
            <span>{{item.location?item.location:'-'}}</span>
          </div>
        </div>
        <alertLabel
          v-if="item && item.loading"
          :id="item.id"
          :that="item"
          :detail-list="true"
          :type="'dc'"
        ></alertLabel>
      </li>
    </ul>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'dcDetail',
  mixins: [detailViewLeftMixin],
  components: {
    alertLabel
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
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('asset.location'),
          prop: 'location',
          show: true
        }, {
          label: this.$t('asset.cabinet'),
          prop: 'cabinetNum',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }, {
          label: this.$t('asset.asset'),
          prop: 'assetNum',
          show: true,
          minWidth: 90,
          sortable: 'custom'
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          width: 120,
          show: true
        }, {
          label: this.$t('config.dc.tel'),
          prop: 'tel',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('config.dc.principal'),
          prop: 'principal',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('config.dc.longitude'),
          prop: 'longitude',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('config.dc.latitude'),
          prop: 'latitude',
          show: false,
          minWidth: 100
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        }
      ]
    }
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
      })
      return str
    }
  }
}
</script>
