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
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'" :title="$t('dashboard.explore.ascending')" />
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
        @mouseenter="labelHover(item, 'asset', true, $event)"
        @mouseleave="labelHover(item, 'asset', false)">
        <div class="detail-row-info" :title="item.name">
          <div class="asset-manageIp">
            <i class="nz-icon nz-icon-overview-alert" :class="item.alertNum>0?'colorEF7458':'color23BF9A'"/>
            {{item.name}}
          </div>
          <div class="asset-name" :title="item.manageIp">{{item.manageIp}}</div>
        </div>
        <alertLabel
          v-if="item && item.loading"
          :id="item.id"
          :that="item"
          :detail-list="true"
          :type="'asset'"
        ></alertLabel>
      </li>
    </ul>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'assetDetail',
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
          width: 110,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        }, {
          label: this.$t('asset.manageIp'),
          prop: 'manageIp',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.parent'),
          prop: 'parent',
          show: false,
          minWidth: 110
        }, {
          label: this.$t('overall.assetSubTab'),
          prop: 'children',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: this.$t('asset.pingInfo'),
          prop: 'pingInfo',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          minWidth: 140,
          sortable: 'custom'
        }, {
          label: this.$t('asset.cabinet'),
          prop: 'cabinet',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: this.$t('overall.alert'),
          prop: 'alertNum',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.endpointNum2'),
          prop: 'endpointNum',
          show: true,
          minWidth: 160,
          sortable: 'custom'
        }, {
          label: this.$t('asset.brand'),
          prop: 'brand',
          show: true,
          minWidth: 120,
          sortable: 'custom'
        }, {
          label: this.$t('asset.model'),
          prop: 'model',
          show: true,
          minWidth: 110,
          sortable: 'custom'
        }, {
          label: 'SN',
          prop: 'sn',
          show: true,
          minWidth: 110
        }, {
          label: this.$t('asset.talon'),
          prop: 'talon',
          show: true,
          sortable: 'custom',
          minWidth: 150
        }, {
          label: this.$t('asset.purchaseDate'),
          prop: 'purchaseDate',
          show: false,
          minWidth: 120
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
    }
  }
}
</script>
