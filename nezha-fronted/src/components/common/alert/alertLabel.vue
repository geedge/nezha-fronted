<template>
  <span>
    <div class="alertLabelInfo" v-if="type==='asset'" v-loading="loading">
      <div class="alertLabelBox">
        <div class="alertLabelTitle">ID</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.id:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">SN</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.sn:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Host</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.host:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">State</div>
        <div class="alertLabelValue">{{alertLabelData?(alertStateStr(alertLabelData.state)):''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Ping</div>
        <div class="alertLabelValue">
          <div v-if="alertLabelData" :class="{'active-icon green':alertLabelData.pingStatus == 1,'active-icon red':alertLabelData.pingStatus == 0}"></div>
          <span v-if="alertLabelData">{{alertLabelData.pingRtt?alertLabelData.pingRtt+'ms':''}}</span>
        </div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Asset Type</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.assetType:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Vendor</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.vendor:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Model</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.model:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">PingLastReply</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.pingLastReply:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Alert</div>
        <div class="alertLabelValue">
          <span v-if="alertLabelData" :class="{danger:alertLabelData.alert>0,success:alertLabelData.alert<=0}">{{alertLabelData.alert + alertActiveStr()}}</span>
        </div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">DC</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.dataCenter:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Endpoint</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.endpoint:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Administrator</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.principal:''}}</div>
      </div>
  </div>

    <div class="alertLabelInfo" v-if="type==='module'" v-loading="loading">
      <div class="alertLabelBox">
        <div class="alertLabelTitle">ID</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.id:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Name</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.name:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Project</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.project.name:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Description</div>
        <div class="alertLabelValue">{{alertLabelData?(alertLabelData.remark?alertLabelData.remark:'-'):''}}</div>
      </div>
    </div>

    <div class="alertLabelInfo" v-if="type==='project'" v-loading="loading">
      <div class="alertLabelBox">
        <div class="alertLabelTitle">ID</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.id:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Name</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.name:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Description</div>
        <div class="alertLabelValue">{{alertLabelData?(alertLabelData.remark?alertLabelData.remark:'-'):''}}</div>
      </div>
    </div>
  </span>
</template>

<script>
  export default {
    name:"alertLabel",
    props:{
      id:{},
      severityData:{
        type:Array
      },
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
  .alertLabelInfo{
    border: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alertLabelBox{
    display: flex;
    justify-content:space-between;
    border-bottom: 1px solid #ebeef5;
  }
  .alertLabelTitle{
    text-align: left;
    width: 90px;
    border-right: 1px solid #ebeef5;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alertLabelValue{
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
