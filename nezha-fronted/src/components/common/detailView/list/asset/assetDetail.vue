<template>
  <div class="detail-left-box">
    <div style="height:40px">123</div>
    <ul class="detail-row-box">
      <li v-for="(item,index) in tableData" :key="index" class="detail-row" @click="detailViewRightShow(item)" :class="item.id === detailViewRightObj.id ? 'selected' : ''">
        <div class="detail-row-info">
          <div class="asset-manageIp" :title="item.name">
            <el-popover :content="$t('asset.assetStatPre')+(item.pingInfo.lastUpdate?utcTimeToTimezoneStr(item.pingInfo.lastUpdate):$t('asset.assetStatDown'))" v-if="item.pingInfo" placement="right" trigger="hover">
            <span slot="reference">
              <span :class="{'active-icon green-bg':item.pingInfo.status == 1,'active-icon red-bg':item.pingInfo.status == 0}"></span>
            </span>
            </el-popover>
            <span v-else style="display: inline-block;width: 13px">
            </span>
            {{item.name}}
          </div>
          <div class="asset-name" :title="item.manageIp">{{item.manageIp}}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'

export default {
  name: 'assetDetail',
  mixins: [detailViewLeftMixin],
  props: {
    detailViewRightObj: {}
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
          label: 'Talon',
          prop: 'clientState',
          show: true,
          sortable: 'custom',
          minWidth: 150
        }
      ]
    }
  },
  methods: {
    detailViewRightShow (item) {
      this.$emit('detailViewRightShow', item)
    }
  }
}
</script>

<style scoped lang="scss">
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
