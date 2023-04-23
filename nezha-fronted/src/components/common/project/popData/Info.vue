<template>
  <div class="info-content pop-data-info-content" v-if="showInfo">
    <div class="info-box" v-my-loading="loading">
      <div class="info-box-title">{{$t('overall.module')}} {{$t('project.topo.icon.info')}}</div>
      <div class="info-box-content">
        <div class="content-box">
          <span class="content-title">ID</span>
          <span class="content-text">{{moduleInfo.id}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.name') }}</span>
          <span class="content-text">{{moduleInfo.name ? moduleInfo.name : '--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('project.project.projectName') }}</span>
          <span class="content-text">{{moduleInfo.project ? moduleInfo.project.name : '--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('asset.endpoint') }}</span>
          <span class="content-text">
            <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
            <span>{{moduleInfo.endpointNum ? moduleInfo.endpointNum : 0}}</span>
          </span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('asset.asset') }}</span>
          <span class="content-text">
             <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>&nbsp;
              <span>{{ moduleInfo.assetNum ? moduleInfo.assetNum: 0}}</span>
            </span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.alert') }}</span>
          <span class="content-text">
           <i :class="moduleInfo.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{moduleInfo.alertNum ? moduleInfo.alertNum : 0}}</span>
          </span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.remark') }}</span>
          <span class="content-text" :title="moduleInfo.remark?moduleInfo.remark:'--'">{{moduleInfo.remark?moduleInfo.remark:'--'}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'popDataInfo',
  props: {
    moduleId: {},
    projectId: {}
  },
  watch: {},
  data () {
    return {
      loading: true,
      showInfo: false,
      moduleInfo: {}
    }
  },
  mounted () {
    this.loading = true
    this.$get('/monitor/module/' + this.moduleId).then(res => {
      this.loading = false
      if (res.code === 200) {
        this.moduleInfo = res.data
        this.showInfo = true
      } else {
        this.showInfo = false
        this.$message.error(res.msg)
      }
    })
  }
}
</script>
