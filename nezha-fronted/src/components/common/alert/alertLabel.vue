<template>
  <span v-loading="loading">
    <div class="alertLabelInfo" v-if="type==='asset'">
    <div class="alertLabelBox">
      <div class="alertLabelTitle">ID</div>
      <div class="alertLabelValue">{{alertLabelData?alertLabelData.id:''}}</div>
    </div>
    <div class="alertLabelBox">
      <div class="alertLabelTitle">SN</div>
      <div class="alertLabelValue">{{alertLabelData?alertLabelData.sn:''}}</div>
    </div>
  </div>
  <div class="alertLabelInfo" v-if="type==='module'">
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
      <div class="alertLabelValue">{{alertLabelData?alertLabelData.remark:''}}</div>
    </div>
  </div>
  <div class="alertLabelInfo" v-if="type==='project'">
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
      <div class="alertLabelValue">{{alertLabelData?alertLabelData.remark:''}}</div>
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
      labelLoading:{}
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
        loading:module
      }
    },
    components:{

    },

    methods:{

    },
    mounted(){
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
    width: 80px;
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
</style>
