<template>
  <div style="height: 100%">
    <div v-if="from === fromRoute.asset" class="detail-title-box">
      <div>
        <span class="detail-title-key">Data center :</span> <span class="detail-title-value">{{obj.dc?obj.dc.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">Cabinet :</span> <span class="detail-title-value">{{obj.cabinet?obj.cabinet.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">Alert :</span> <span class="detail-title-value"><i :class="obj.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i> {{obj.alertNum?obj.alertNum:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">Endpoint :</span> <span class="detail-title-value"><i class="nz-icon nz-icon-overview-endpoint monitorColor"></i> {{obj.endpointNum?obj.endpointNum:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">Brand :</span> <span class="detail-title-value">{{obj.brand?obj.brand.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">Brand :</span> <span class="detail-title-value">{{obj.model?obj.model.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">SN :</span> <span class="detail-title-value">{{obj.sn?obj.sn:'-'}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
export default {
  name: 'detailRightTop',
  props: {
    obj: Object, // 关联的实体对象
    from: String // 来自哪个页面
  },
  data () {
    return {
      fromRoute: fromRoute
    }
  },
  watch: {
    from: {
      immediate: true,
      handler (n) {
        console.log(n === fromRoute.asset)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.detail-title-box{
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content:  flex-start;
  align-items: center;
  height: 100%;
  padding-left: 15px;
  & > div{
    height: 100%;
    line-height: 60px;
    margin-right: 40px;
  }
  .detail-title-key{
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 400;
  }
  .detail-title-value{
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 400;
    margin-left: 10px;
  }
}
</style>
