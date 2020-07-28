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
          <div v-if="alertLabelData" :class="{'active-icon green':alertLabelData.pingState == 1,'active-icon red':alertLabelData.pingState == 0}"></div>
          <span v-if="alertLabelData">{{alertLabelData.pingRtt?alertLabelData.pingRtt+'ms':''}}</span>
        </div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Type</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.model.type.value:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Vendor</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.model.vendor.name:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Model</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.model.name:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">PurchaseDate</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.createAt:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Alert</div>
        <div class="alertLabelValue"><sapn v-if="alertLabelData" :class="{danger:alertLabelData.alertNum>0,success:alertLabelData.alertNum<=0}">{{alertLabelData.alertNum + alertActiveStr()}}</sapn></div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Dc</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.idc.name:''}}</div>
      </div>
      <div class="alertLabelBox">
        <div class="alertLabelTitle">Endpoint</div>
        <div class="alertLabelValue">{{alertLabelData?alertLabelData.endpointNum:''}}</div>
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
          this.$get('/asset?id='+this.id).then((res)=>{
            if(res.msg==='success'){
              this.loading=false;
              this.alertLabelData=res.data.list[0];
            } else{
              this.$message.error(res.msg);
            }
          })
        }
        if(this.type==='project'){
          this.$get('/project?id='+this.id).then((res)=>{
            if(res.msg==='success'){
              this.loading=false;
              this.alertLabelData=res.data.list[0];
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
      }
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
