<template>
  <div class="info-content">
    <div class="info-box" v-loading="loading">
      <div class="info-box-title">Module info</div>
      <div class="info-box-content">
        <div class="content-box">
          <span class="content-title">Project</span>
          <span class="content-text">{{moduleInfo.project.name}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Module name</span>
          <span class="content-text">{{moduleInfo.name}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Tag</span>
          <!--{{moduleInfo.type}}-->
          <span class="content-text">
            <span :class="{'module-type':true,'module-type-select':moduleInfo.type==='http'}">HTTP</span>
            <span :class="{'module-type':true,'module-type-select':moduleInfo.type==='snmp'}">SNMP</span>
          </span>
        </div>
        <div class="content-box">
          <span class="content-title">Port</span>
          <span class="content-text">{{moduleInfo.port?moduleInfo.port:'--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Path</span>
          <span class="content-text">{{moduleInfo.path?moduleInfo.path:'--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Parameter</span>
          <span class="content-text">{{moduleInfo.seq?moduleInfo.seq:'--'}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Descripsion</span>
          <span class="content-text">{{moduleInfo.remark?moduleInfo.remark:'--'}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name:"popDataInfo",
    props:{
      moduleId:{},
      projectId:{},
    },
    watch:{},
    data(){
      return{
        loading:true,
        moduleInfo:{
          project:{name:''},
          name:'',
          type:'http',
          remark:'',
          port:'',
          path:'',
          seq:'',
        }
      }
    },
    mounted(){
      this.loading=true;
      this.$get('/module',{id:this.moduleId}).then(res=>{
        this.loading=false;
        this.moduleInfo=res.data.list[0];
      })
    },
    methods:{},
    beforeDestroy(){

    }
  }
</script>

<style scoped>
  .info-content{
    display: flex;
    margin-right: 15px;
    flex-direction: column;
    justify-content: space-between;
  }
  .info-box{
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    width: 334px;
    margin-bottom: 15px;
    box-shadow: 1px 2px 4px 0 rgba(0,0,0,0.12), -1px 1px 9px -1px rgba(205,205,205,0.77);
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
    /*border: 1px solid rgba(205,205,205,0.77);*/
  }
  .content-box{
    padding: 0 12px;
    height: 29px;
    line-height: 24px;
  }
  .info-box-content .content-box:not(:last-child){
    border-bottom: 1px solid rgba(205,205,205,0.77);
  }
  .content-title{
    font-size: 12px;
    color: #333333;
    width: 120px;
    display: inline-block;
    border-right: 1px solid rgba(205,205,205,0.77);
    padding: 3px 0;
  }
  .content-text{
    width: 175px;
    color: #333333;
    font-size: 12px;
    display: inline-block;
    padding: 3px 5px;
  }
  .module-type{
    border: 1px solid #DCDCDC;
    text-align: center;
    width: 44px;
    display: inline-block;
    height: 20px;
    margin: 0 auto;
    line-height: 20px;
  }
  .module-type:first-child{
    border-right-color:rgba(255,140,14,0.54);
    border-radius: 4px 0 0 4px;
    margin-right: -4px;
    border-right: none;
  }
  .module-type:last-child{
    border-left-color:rgba(255,140,14,0.54);
    border-radius: 0 4px 4px 0;
    z-index: -1;
  }
  .module-type-select{
    border-color:rgba(255,140,14,0.54);
    color: rgba(255,140,14,0.54);
  }
</style>
