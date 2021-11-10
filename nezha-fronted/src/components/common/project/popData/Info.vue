<template>
  <div class="info-content">
    <div class="info-box" v-loading="loading">
      <div class="info-box-title">Module info</div>
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
          <span class="content-title">{{ $t('overall.project') }}</span>
          <span class="content-text">{{moduleInfo.project ? moduleInfo.project.name : '--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('project.endpoint.endpoints') }}</span>
          <span class="content-text">
            <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
            <span>{{moduleInfo.endpointNum ? moduleInfo.endpointNum : 0}}</span>
          </span>
        </div>
        <div class="content-box">
          <span class="content-title">{{ $t('overall.asset') }}</span>
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
      moduleInfo: {}
    }
  },
  mounted () {
    this.loading = true
    this.$get('/monitor/module/' + this.moduleId).then(res => {
      this.loading = false
      if (res.code === 200) {
        this.moduleInfo = res.data
      } else {
        this.$message.error(res.msg)
      }
    })
  },
  methods: {},
  beforeDestroy () {

  }
}
</script>

<style scoped>
  .info-content{
    display: flex;
    margin-right: 15px;
    flex-direction: column;
    justify-content: space-between;
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    box-shadow: 0 6px 16px 0 rgba(0,0,0,0.08);
    border-radius: 3px 3px 3px 3px 0 0;
  }
  .info-box{
    background: #FFFFFF;
    margin-bottom: 15px;
    min-width: 260px;
  }
  .info-box-title{
    background: #EFEFEF;
    font-size: 14px;
    color: #333333;
    height: 26px;
    line-height: 26px;
    padding-left: 12px;
    font-weight: bold;
  }
  .info-box-content{
    font-size: 12px;
    color: #333333;
  }
  .content-box{
    padding: 0 12px;
    height: 26px;
    line-height: 24px;
  }
  .content-title{
    font-size: 14px;
    color: #333333;
    min-width: 120px;
    display: inline-block;
    color: #666666;
    padding: 3px 0;
  }
  .content-text{
    color: #333333;
    font-size: 14px;
    padding: 3px 5px;
  }
  .module-type{
    text-align: center;
    width: 44px;
    display: inline-block;
    height: 20px;
    margin: 0 auto;
    line-height: 20px;
  }
  .module-type:first-child{
    border-radius: 4px 0 0 4px;
    margin-right: -4px;
    border-right: none;
  }
  .module-type:last-child{
    border-radius: 0 4px 4px 0;
    z-index: -1;
  }
  .module-type-select{
    border-color:rgba(255,140,14,0.54);
    color: rgba(255,140,14,0.54);
  }
</style>
