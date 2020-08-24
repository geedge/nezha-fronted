<template>
  <div class="info-content">
    <div class="info-box">
      <div class="info-box-title">module info</div>
      <div class="info-box-content">
        <div class="content-box">
          <span class="content-title">project</span>
          <span class="content-text">123</span>
        </div>
        <div class="content-box">
          <span class="content-title">module name</span>
          <span class="content-text">123</span>
        </div>
        <div class="content-box">
          <span class="content-title">Tag</span>
          <span class="content-text">123</span>
        </div>
        <div class="content-box">
          <span class="content-title">Port</span>
          <span class="content-text">123</span>
        </div>
        <div class="content-box">
          <span class="content-title">path</span>
          <span class="content-text">123</span>
        </div>
        <div class="content-box">
          <span class="content-title">Parameter</span>
          <span class="content-text">123</span>
        </div>
        <div class="content-box">
          <span class="content-title">Descripsion</span>
          <span class="content-text">123</span>
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

      }
    },
    mounted(){
      console.log(this.moduleId,this.projectId)
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
    width: 173px;
    margin-bottom: 15px;
  }
  .info-box-title{
    background: #EFEFEF;
    font-size: 14px;
    color: #333333;
    height: 26px;
    line-height: 26px;
    padding-left: 12px;
  }
  .info-box-content{
    font-size: 12px;
    color: #333333;
    /*padding: 12px;*/
  }
  .content-box{
    padding: 0 12px;
  }
  .info-box-content .content-box:not(:last-child){
    margin-bottom: 5px;
  }
  .content-title{
    color: #666666;
  }
</style>
