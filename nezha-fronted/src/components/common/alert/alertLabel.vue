<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" ref="alertLabels">
    <div class="alert-label-info" v-if="type==='asset'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">SN</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.sn ? alertLabelData.sn:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">ManageIp</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.manageIp ? alertLabelData.manageIp : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">State</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.state && alertLabelData.state.name ? alertLabelData.state.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Ping</div>
        <div class="alert-label-value">
          <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.status === 1,'red-bg': alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.status === 0}" class="active-icon"></div>
          <span v-if="alertLabelData">{{alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.rtt ? alertLabelData.pingInfo.rtt + 'ms':'--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Asset Type</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.type && alertLabelData.type.name ? alertLabelData.type.name:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Brand</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.brand && alertLabelData.brand.name ? alertLabelData.brand.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Model</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.model && alertLabelData.model.name ? alertLabelData.model.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">PingLastReply</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.pingInfo && alertLabelData.pingInfo.lastUpdate ? utcTimeToTimezoneStr(alertLabelData.pingInfo.lastUpdate) : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Alert</div>
        <div class="alert-label-value">
          <span v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'danger' : 'success'">{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0 + ' ' + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">DC</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.dc && alertLabelData.dc.name ? alertLabelData.dc.name : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='module'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Project</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ?alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Description</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '-'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='project'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Description</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='endpoint'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Project</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ? alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Module</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.module && alertLabelData.module.name ? alertLabelData.module.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Configs</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.configs ? alertLabelData.configs : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">ManageIp</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.asset ? alertLabelData.asset.manageIp : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Port</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.port ? alertLabelData.port : '--'}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alertLabel',
  props: {
    id: {},
    type: {},
    // labelLoading:{},
    that: {}
  },
  /* watch:{
      labelLoading: {
        immediate: true,
        handler(n) {
          if(this.type==='asset'){
            this.$get('/asset/info?id='+this.id).then((res)=>{
              if(res.msg==='success'){
                this.loading=false;
                this.alertLabelData=res.data.Basic;
              } else{
                this.$message.error(res.msg);
              }
            })
          }
          if(this.type==='project'){
            this.$get('/project/info?id='+this.id).then((res)=>{
              if(res.msg==='success'){
                this.loading=false;
                this.alertLabelData=res.data.basic;
              } else{
                this.$message.error(res.msg);
              }
            })
          }
          if(this.type==='module'){
            this.$get('/module?id='+this.id).then((res)=>{
              if(res.msg==='success'){
                this.loading=false;
                this.alertLabelData=res.data.list[0];
              } else{
                this.$message.error(res.msg);
              }
            })
          }
        }
      }
    }, */
  data () {
    return {
      alertLabelData: null,
      loading: true
    }
  },
  components: {

  },
  watch: {
    id: {
      immediate: true,
      deep: true,
      handler (n) {
        this.init()
      }
    },
    that: {
      immediate: true,
      deep: true,
      handler (n) {
      }
    },
    LRTriangle: {
      immediate: true,
      deep: true,
      handler (n) {

      }
    }
  },
  computed: {
    calcPosition () {
      const self = this
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const elHeight = self.type === 'asset' ? 318 : (self.type === 'project' ? 70 : 70)
        if (position.top + elHeight > clientHeight) {
          return {
            left: `${position.left + position.width + 20}px`,
            top: `${position.top - elHeight - 20}px`
          }
        } else {
          return {
            left: `${position.left + position.width + 20}px`,
            top: `${position.top - 20}px`
          }
        }
      }
    },
    calcHeight () {
      const self = this
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const elHeight = self.type === 'asset' ? 318 : (self.type === 'project' ? 70 : 70)
        if (position.top + elHeight > clientHeight) {
          return 'alert-labelUp'
        } else {
          return 'alert-label'
        }
      }
    }
  },
  methods: {
    init () {
      this.loading = true
      if (this.type === 'asset') {
        this.$get('asset/asset/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'project') {
        this.$get('monitor/project/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'module') {
        this.$get('monitor/module/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'endpoint') {
        this.$get('monitor/endpoint/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    alertActiveStr () {
      return this.$t('overall.active')
    },
    alertStateStr (num) {
      if (num == 1) {
        return this.$t('asset.inStock')
      } else {
        return this.$t('asset.notInStock')
      }
    }
  },
  mounted () {},
  beforeDestroy () {

  }
}

</script>

<style scoped>
  .alert-label {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-labelUp {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-label::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 5px;
    border-style: dashed solid dashed dashed;
    border-color: transparent #fff transparent transparent;
    position: absolute;
    top: 20px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-labelUp::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 5px;
    border-style: dashed solid dashed dashed;
    border-color: transparent #fff transparent transparent;
    position: absolute;
    bottom: 20px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-label-info{
    border: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alert-label-box{
    display: flex;
    justify-content:space-between;
    border-bottom: 1px solid #ebeef5;
  }
  .alert-label-title{
    text-align: left;
    width: 110px;
    border-right: 1px solid #ebeef5;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alert-label-value{
    text-align: left;
    width: 150px;
    color: #1a1a1a;
    padding: 0 3px 0 13px;
    word-break: break-all;
  }
  .danger{
    background-color: #d64f40;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  .success{
    background-color: #50d050;
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  /deep/.active-icon{
    margin-top: 0;
  }
</style>
