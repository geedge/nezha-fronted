<template>
  <div class="info-content pop-data-info-content">
    <div class="info-box" v-loading="loading">
      <div class="info-box-title">Module info</div>
      <div class="info-box-content">
        <div class="content-box">
          <span class="content-title">ID</span>
          <span class="content-text">{{moduleInfo.id}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.name') }}</span>
          <span class="content-text">{{moduleInfo.name}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.project') }}</span>
          <span class="content-text">{{moduleInfo.project.name}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('project.endpoint.endpoints') }}</span>
          <span class="content-text">{{moduleInfo.endpointNum?moduleInfo.endpointNum:'--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.alert') }}</span>
          <span class="content-text">{{moduleInfo.alertNum?moduleInfo.alertNum:'--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.remark') }}</span>
          <span class="content-text">{{moduleInfo.remark?moduleInfo.remark:'--'}}</span>
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
      moduleInfo: {
        project: { name: '' },
        name: '',
        type: 'http',
        remark: '',
        port: '',
        path: '',
        seq: '',
        assetNum: '',
        endpointNum: ''
      }
    }
  },
  mounted () {
    this.loading = true
    this.$get('/monitor/module/' + this.moduleId).then(res => {
      this.loading = false
      this.moduleInfo = res.data
    })
  }
}
</script>
