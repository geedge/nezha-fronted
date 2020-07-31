<template>
  <span>
    <div class="alert-label-info" v-if="type==='asset'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.id:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">SN</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.sn:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Host</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.host:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">State</div>
        <div class="alert-label-value">{{alertLabelData?(alertStateStr(alertLabelData.state)):''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Ping</div>
        <div class="alert-label-value">
          <div v-if="alertLabelData" :class="{'active-icon green':alertLabelData.pingStatus == 1,'active-icon red':alertLabelData.pingStatus == 0}"></div>
          <span v-if="alertLabelData">{{alertLabelData.pingRtt?alertLabelData.pingRtt+'ms':''}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Asset Type</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.assetType:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Vendor</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.vendor:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Model</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.model:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">PingLastReply</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.pingLastReply:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Alert</div>
        <div class="alert-label-value">
          <span v-if="alertLabelData" :class="{danger:alertLabelData.alert>0,success:alertLabelData.alert<=0}">{{alertLabelData.alert + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">DC</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.dataCenter:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Endpoint</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.endpoint:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Administrator</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.principal:''}}</div>
      </div>
  </div>

    <div class="alert-label-info" v-if="type==='module'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.id:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.name:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Project</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.project.name:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Description</div>
        <div class="alert-label-value">{{alertLabelData?(alertLabelData.remark?alertLabelData.remark:'-'):''}}</div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type==='project'" v-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.id:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">{{alertLabelData?alertLabelData.name:''}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Description</div>
        <div class="alert-label-value">{{alertLabelData?(alertLabelData.remark?alertLabelData.remark:'-'):''}}</div>
      </div>
    </div>
  </span>
</template>

<script>
  export default {
    name:"alertLabel",
    props:{
      id:{},
      type:{},
      labelLoading:{},
      that:{}
    },
    watch:{
      labelLoading(){
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
    },
    data() {
      return {
        alertLabelData:null,
        loading:true
      }
    },
    components:{

    },

    methods:{
      alertActiveStr(){
        return vm.$t('overall.active');
      },
      alertStateStr(num){
        if( num == 1){
          return vm.$t('asset.inStock')
        } else {
          return vm.$t('asset.notInStock')
        }
      },
    },
    mounted(){
      // console.log(vm.$t('overall.exportAll'));
    },
  }

</script>

<style scoped>
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
    width: 90px;
    border-right: 1px solid #ebeef5;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alert-label-value{
    text-align: left;
    width: 150px;
    color: #1a1a1a;
    padding: 0 3px 0 13px;
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
