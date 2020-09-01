<template>
  <div class="main-content">
    <div class="main-box">
      <div class="main-box-title">asset</div>
      <div class="main-box-content">
        <div class="content-box">
          <span class="content-title"><i class="el-icon-upload2 colorFFF bg23BF9A"></i>up</span>
          <span class="float-right">{{moduleInfo.assetStat.up}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="el-icon-download colorFFF bgEC7F66"></i>down</span>
          <span class="float-right">{{moduleInfo.assetStat.down}}</span>
        </div>
      </div>
    </div>

    <div class="main-box">
      <div class="main-box-title">endpoint</div>
      <div class="main-box-content">
        <div class="content-box">
          <span class="content-title"><i class="el-icon-upload2 colorFFF bg23BF9A"></i>up</span>
          <span class="float-right">{{moduleInfo.endpointStat.up}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="el-icon-download colorFFF bgEC7F66"></i>down</span>
          <span class="float-right">{{moduleInfo.endpointStat.down}}</span>
        </div>
      </div>
    </div>

    <div class="main-box">
      <div class="main-box-title">alert message</div>
      <div class="main-box-content">
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-top colorFFF bg23BF9A"></i>high</span>
          <span class="float-right">{{moduleInfo.alertStat.high}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-right colorFFF bg3C92F1"></i>medium</span>
          <span class="float-right">{{moduleInfo.alertStat.medium}}</span>
        </div>
        <div class="content-box">
          <span class="content-title"><i class="nz-icon nz-icon-jiantou-down colorFFF bgEC7F66"></i>low</span>
          <span class="float-right">{{moduleInfo.alertStat.low}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	export default {
		name:"popDataMain",
    props:{
		  moduleId:{},
      projectId:{},
    },
    watch:{
      moduleId(n){
        this.init();
      }
    },
    data(){
		  return{
        moduleInfo:{
          alertStat:{
            high:0,
            low:0,
            medium:0,
          },
          assetStat:{
            down:0,
            up:0,
          },
          endpointStat:{
            down:0,
            up:0,
          },
        }
      }
    },
    mounted(){
		  this.init()
    },
    methods:{
		  init(){
		    console.log(111);
        this.$get('/module/stat',{id:this.moduleId}).then(res=>{
          this.moduleInfo=res.data;
        })
      }
    },
  }
</script>

<style scoped>
  .main-content{
    display: flex;
    margin-right: 15px;
    flex-direction: column;
    justify-content: space-between;
  }
  .main-box{
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    width: 173px;
    margin-bottom: 15px;
  }
  .main-box-title{
    background: #EFEFEF;
    font-size: 14px;
    color: #333333;
    height: 26px;
    line-height: 26px;
    padding-left: 12px;
  }
  .main-box-content{
    font-size: 12px;
    color: #333333;
    padding: 12px;
  }
 .main-box-content .content-box:not(:last-child){
    margin-bottom: 5px;
  }
  .content-title{
    color: #666666;
  }
  .colorFFF{
    color: #FFFFFF;
    vertical-align: middle;
    display: inline-block;
    padding: 1px;
    font-size: 10px;
    margin-right: 5px;
    line-height: 1;
  }
  .bg23BF9A{
    background: #23BF9A;
  }
  .bgEC7F66{
    background: #EC7F66;
  }
  .bg3C92F1{
    background: #3C92F1;
  }
</style>
