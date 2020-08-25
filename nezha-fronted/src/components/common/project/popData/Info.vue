<template>
  <div class="info-content">
    <div class="info-box">
      <div class="info-box-title">module info</div>
      <div class="info-box-content">
        <div class="content-box">
          <span class="content-title">project</span>
          <span class="content-text">{{moduleInfo.project.name}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">module name</span>
          <span class="content-text">{{moduleInfo.name}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Tag</span>
          <span class="content-text">{{moduleInfo.type}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Port</span>
          <span class="content-text">{{moduleInfo.port}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Path</span>
          <span class="content-text">{{moduleInfo.path}}</span>
        </div>
        <div class="content-box">
          <span class="content-title">Parameter</span>
          <span class="content-text">{{moduleInfo.seq}}</span>
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
      this.$get('/module',{id:this.moduleId}).then(res=>{
        this.moduleInfo=res.data.list[0];
        console.log(this.moduleInfo,this.projectId);
      })
    },
    methods:{},
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
</style>
