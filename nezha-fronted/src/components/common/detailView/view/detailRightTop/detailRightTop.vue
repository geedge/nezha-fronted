<template>
  <div style="height: 100%">
    <div v-if="from === fromRoute.asset" class="detail-title-box">
      <div>
        <span class="detail-title-key">{{$t('dc.dc')}} :</span> <span class="detail-title-value">{{obj.dc?obj.dc.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">{{$t('dc.cabinets')}} :</span>
        <span class="detail-title-value">
          <span v-if="obj.cabinet && obj.cabinet !== '--'">{{obj.cabinet.name}}&nbsp;{{returnCabinet( obj.cabinetStart, obj.cabinetEnd)}}</span>
          <span v-else >-</span>
      </span>
      </div>
      <div>
        <span class="detail-title-key">{{$t('dc.alert')}} :</span> <span class="detail-title-value"><i :class="obj.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i> {{obj.alertNum?obj.alertNum:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">{{$t('asset.endpoint')}} :</span> <span class="detail-title-value"><i class="nz-icon nz-icon-overview-endpoint monitorColor"></i> {{obj.endpointNum?obj.endpointNum:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">{{$t('asset.brand')}} :</span> <span class="detail-title-value">{{obj.brand?obj.brand.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">{{$t('asset.model')}} :</span> <span class="detail-title-value">{{obj.model?obj.model.name:'-'}}</span>
      </div>
      <div>
        <span class="detail-title-key">{{$t('asset.sn')}} :</span> <span class="detail-title-value">{{obj.sn?obj.sn:'-'}}</span>
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
  methods: {
    returnCabinet (start, end) { // 返回机柜u位信息
      if (!start || !end) {
        return ''
      }
      return `[${start}-${end}]`
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
