<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" class="alert-label__border" ref="alertLabels">
    <div class="alert-label-info" v-if="type==='asset'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.manageIp')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.manageIp ? alertLabelData.manageIp : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.type')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.type && alertLabelData.type.name ? alertLabelData.type.name:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
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
        <div class="alert-label-title">{{$t('overall.dc')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.dc && alertLabelData.dc.name ? alertLabelData.dc.name:'--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.cabinet')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.cabinet && alertLabelData.cabinet.name ? alertLabelData.cabinet.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.brand')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.brand && alertLabelData.brand.name ? alertLabelData.brand.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.model')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.model && alertLabelData.model.name ? alertLabelData.model.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='module'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.project')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ?alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.assetNum ? alertLabelData.assetNum: 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0 + ' ' + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.remark')}}</div>
        <div class="alert-label-value alert-label-remark">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='project'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.module')}}</div>
        <div class="alert-label-value">
          <i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.module && alertLabelData.module.name ? alertLabelData.module.name : '--'}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>
          <span>{{alertLabelData && alertLabelData.assetNum ? alertLabelData.assetNum: 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0 + ' ' + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.remark')}}</div>
        <div class="alert-label-value alert-label-remark">{{alertLabelData && alertLabelData.remark ? alertLabelData.remark : '--'}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='endpoint'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.project')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.project && alertLabelData.project.name ? alertLabelData.project.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.module')}}</div>
        <div class="alert-label-value">
          <i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.module && alertLabelData.module.name ? alertLabelData.module.name : '--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.asset.name ? alertLabelData.asset.name : '--'}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0 + ' ' + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value">
           <span style="width: auto">
            <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics colorFA901C" /> {{$t('project.endpoint.metrics')}} </span>
            <span v-if="alertLabelData && alertLabelData.configs[0].state === 0">
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[0].state === 1">
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[0].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
          <span style="width: auto">
            <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs colorFA901C" /> {{$t('project.endpoint.logs')}} </span>
            <span v-if="alertLabelData && alertLabelData.configs[1].state === 0">
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[1].state === 1">
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[1].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='dc'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.id ? alertLabelData.id : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.location')}}</div>
        <div class="alert-label-value">{{alertLabelData && alertLabelData.location && alertLabelData.location ? alertLabelData.location : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.cabinet')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" class="nz-icon nz-icon-cabinet monitorColor" :class="alertLabelData && alertLabelData.cabinetNum> 0 ? 'color23BF9A' : 'colorEF7458'"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.cabinetNum ? alertLabelData.cabinetNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.asset')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"/>&nbsp;
          <span>{{alertLabelData && alertLabelData.assetNum && alertLabelData.assetNum ? alertLabelData.assetNum: 0}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.alert')}}</div>
        <div class="alert-label-value">
          <i v-if="alertLabelData" :class="alertLabelData && alertLabelData.alertNum > 0 ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>&nbsp;
          <span>{{alertLabelData && alertLabelData.alertNum ? alertLabelData.alertNum : 0}}</span></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value" style="margin-left: 3px">
          <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.state === 'ON','red-bg': alertLabelData && alertLabelData.state === 'OFF'}" class="active-icon"></div>
          <span v-if="alertLabelData && alertLabelData.state === 'ON'">{{ $t('overall.enabled') }}</span>
          <span v-if="alertLabelData && alertLabelData.state === 'OFF'">{{ $t('overall.disabled') }}</span>
        </div>
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
    that: {},
    detailList: Boolean,
    alertTableDialog: Boolean
  },
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
        const dialog = document.getElementsByClassName('el-dialog')[2] // 获取元素类名为 el-dialog的元素数组第二个
        const dialogHeight = dialog.clientHeight // 获取元素窗口
        const leftOffSetView = this.detailList ? -80 : 10
        const topOffSetView = this.detailList ? 0 : 0
        const leftOffSet = this.detailList ? -80 : 10
        const topOffSet = this.detailList ? 70 : 0
        const elHeight = self.type === 'asset' ? 318 : (self.type === 'project' ? 70 : 70)
        if (position.top + elHeight > clientHeight) {
          return {
            left: `${position.left + position.width + leftOffSet}px`,
            top: `${position.top - elHeight + topOffSet}px`
          }
        } else if (dialogHeight && this.alertTableDialog) { // dialogHeight 为获取的元素窗口,this.alertTableDialog // 为了判断是alertMessageTable页面使用的组件
          return {
            left: `${position.left + position.width - 40}px`,
            top: `${position.top - 95}px`
          }
        } else {
          return {
            left: `${position.left + position.width + leftOffSetView}px`,
            top: `${position.top + topOffSetView}px`
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
      if (this.type === 'dc') {
        this.$get('dc/' + this.id).then((res) => {
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
  }
}

</script>

<style scoped>
  .alert-label {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px 23px 10px 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-label__border {
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    box-shadow: 0 6px 16px 0 rgba(0,0,0,0.08);
    border-radius: 3px 3px 3px 3px 0 0;
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
    /*border: 5px;*/
    /*border-style: dashed solid dashed dashed;*/
    /*border-color: transparent #fff transparent transparent;*/
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
    /*border: 5px;*/
    /*border-style: dashed solid dashed dashed;*/
    /*border-color: transparent #fff transparent transparent;*/
    position: absolute;
    bottom: 20px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-label-info{
    /*border: 1px solid #ebeef5;*/
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alert-label-box{
    display: flex;
    flex-direction: row;
    /*border-bottom: 1px solid #ebeef5;*/
  }
  .alert-label-title{
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    line-height: 23px;
    min-width: 110px;
    padding: 0 3px 0 13px;
  }
  .alert-label-value{
    height: 26px;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    line-height: 23px;
  }
  .alert-label-remark {
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    max-width: 210px;
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
  .colorFA901C{
    color: #fa901c;
  }
</style>
