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
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'" />
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'" />
      </button>
    </div>
    <ul class="detail-row-box" ref="dataTable">
      <li
        v-for="(item,index) in tableData"
        :key="index"
        class="detail-row"
        :class="item.id === detailViewRightObj.id ? 'selected' : ''"
        @click="detailViewRightShow(item)"
        @mouseenter="labelHover(item, 'asset', true, $event)"
        @mouseleave="labelHover(item, 'asset', false)">
        <div class="detail-row-info">
          <div class="asset-manageIp">
            <span v-if="item.pingInfo" >
              <span :class="{'active-icon green-bg':item.pingInfo.status == 1,'active-icon red-bg':item.pingInfo.status == 0}"></span>
            </span>
            <span v-else style="display: inline-block;width: 13px">
            </span>
            {{item.name}}
          </div>
          <div class="asset-name" :title="item.manageIp">{{item.manageIp}}</div>
        </div>
        <alertLabel
          v-if="item && item.loading"
          :id="item.id"
          :that="item"
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
          label: this.$t('overall.parent'),
          prop: 'parent',
          show: false,
          minWidth: 110
        }, {
          label: this.$t('overall.children'),
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
          label: this.$t('asset.state'),
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
          label: this.$t('asset.alertNum'),
          prop: 'alertNum',
          show: true,
          minWidth: 140,
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
          label: 'Talon',
          prop: 'clientState',
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
      // this.$set(this.tableData,index,item);// 调用父组件
    },
  }
}
</script>

<style scoped lang="scss">
  .order-box{
    display: flex;
    height:40px;
    padding: 0 15px;
    line-height: 40px;
    align-items: center;
    /*.detail-select{*/
    /*  height: 30px;*/
    /*  line-height: 30px;*/
    /*  flex: 1;*/
    /*  /deep/ .el-input--small{*/
    /*    height: 30px;*/
    /*    line-height: 30px;*/
    /*    background-color: rgba(9,30,66,0.08);*/
    /*    border: none;*/
    /*    color: #344563;*/
    /*    input{*/
    /*      height: 30px;*/
    /*      line-height: 30px;*/
    /*      background-color: rgba(9,30,66,0.08);*/
    /*      border: none;*/
    /*      color: #344563;*/
    /*    }*/
    /*  }*/
    /*}*/
    /*.detail-select:hover{*/
    /*  /deep/ .el-input--small{*/
    /*    input{*/
    /*      background-color: rgba(9,30,66,0.13);*/
    /*    }*/
    /*  }*/
    /*}*/
    /*.detail-button{*/
    /*  height: 28px;*/
    /*  line-height: 28px;*/
    /*  background-color: rgba(9,30,66,0.08);*/
    /*  border: none;*/
    /*  .nz-icon{*/
    /*    color: #344563;*/
    /*  }*/
    /*}*/
    /*.detail-button:hover{*/
    /*  background-color: rgba(9,30,66,0.13);*/
    /*}*/
  }
  .detail-row-box{
    height: calc(100% - 40px);
    overflow: hidden;
    overflow-y: auto;
  }
  .detail-row{
    width: 245px;
    padding: 0px 0 0px 15px;
    height: 60px;
    border-bottom: 1px solid #E7EAED;
    cursor: pointer;
  }
  .detail-row:last-of-type{
    border-bottom: none
  }
  .detail-row-info{
    display: flex;
    height: 100%;
    width: calc(100% - 15px);
    justify-content:center;
    flex-direction: column;
    > div{
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  .asset-manageIp{
    font-size: 16px;
    color: #333333;
    font-weight: 400;
  }
    .asset-name {
      padding-left: 22px;
      width: calc(100% - 22px);
      font-size: 14px;
      color: #999999;
      font-weight: 400;
    }
  }
  .selected{
    background: #FFFBF6;
  }
</style>
