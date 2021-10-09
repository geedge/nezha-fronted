<template>
  <ul class="detail-row-box">
    <li v-for="(item,index) in tableData" :key="index" class="detail-row" @click="detailViewRightShow(item)">
      <div class="detail-row-info">
        <div class="asset-manageIp">
          <el-popover :content="$t('asset.assetStatPre')+(item.pingInfo.lastUpdate?utcTimeToTimezoneStr(item.pingInfo.lastUpdate):$t('asset.assetStatDown'))" v-if="item.pingInfo" placement="right" trigger="hover">
          <span slot="reference">
            <span :class="{'active-icon green-bg':item.pingInfo.status == 1,'active-icon red-bg':item.pingInfo.status == 0}"></span>
          </span>
        </el-popover>
          {{item.manageIp}}
        </div>
        <div class="asset-name">{{item.name}}</div>
      </div>
    </li>
  </ul>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'

export default {
  name: 'assetDetail',
  mixins: [detailViewLeftMixin],
  methods: {
    detailViewRightShow (item) {
      this.$emit('detailViewRightShow')
    }
  }
}
</script>

<style scoped lang="scss">
  .detail-row-box{
    /*height: 100%;*/
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
    justify-content:center;
    flex-direction: column;
    > div{
      width: 100%;
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
</style>
