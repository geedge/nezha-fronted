<template>
    <div class="overview">
      <!--左侧菜单栏-->
      <div class="overview-left content-left">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item sidebar-info-top " @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
        </div>
      </div>
      <!--右侧内容-->
      <div class="overview-right content-right">
        <!--标题-->
        <div class="overview-content-header">
          <div class="header-title">{{$t('dashboard.overview.contentTitle')}}</div>
          <div class="header-tool">
            <div class="tool-container">
              <div class="time">{{sysTime}}</div>
              <div class="date">
                <div class="week">{{sysWeek}}</div>
                <div class="sys-date">{{sysDate}}</div>
              </div>
              <div class="operation"><span ><i class="nz-icon nz-icon-maxview"></i></span></div>
            </div>
          </div>
        </div>

        <!--内容-->
        <div class="overview-content">
          <el-scrollbar>
            <div class="content-row-box">
              <div class="content-col-box box-height-250 " style="width: 45%"></div>
              <div class="content-col-box box-height-250 " style="width: 25%"></div>
              <div class="content-col-box box-height-250 " style="width: 23%"></div>
            </div>
            <div class="content-row-box">
              <div class="content-col-box box-height-350 " style="width: 45%"></div>
              <div class="content-col-box box-height-350 "style="width: 50.2%"></div>
            </div>
            <div class="content-row-box">
              <div class="content-col-box box-height-400 "style="width: 25%"></div>
              <div class="content-col-box box-height-400 "style="width: 48%"></div>
              <div class="content-col-box box-height-400 "style="width: 20%"></div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
</template>

<script>
  export default {
    name: "overview",
    props:[],
    data(){
      return {
        sysTime:'',
        sysDate:'',
        sysWeek:'',
      }
    },
    created() {
    },
    methods:{
      /*header 时间处理 start*/
      initDate:function(){
        this.sysTime=this.getTime();
        this.sysDate=this.getDate();
        this.sysWeek=this.getWeek();
        this.freshTime();
      },
      freshTime:function(){
        let $temp=this;
        setInterval(function(){
          $temp.sysTime=$temp.getTime()
          $temp.sysDate=$temp.getDate();
          $temp.sysWeek=$temp.getWeek();
        },1000)
      },
      getTime:function(){
        let date=new Date();
        let hours=date.getHours()>9?date.getHours():'0'+date.getHours();
        let minutes=date.getMinutes()>9?date.getMinutes():'0'+date.getMinutes();
        let seconds=date.getSeconds()>9?date.getSeconds():'0'+date.getSeconds();
        return hours+':'+minutes+':'+seconds;
      },
      getDate:function(){
        let date=new Date();
        let years=date.getFullYear();
        let months=date.getMonth()+1>9?date.getMonth()+1:'0'+(date.getMonth()+1);
        let days=date.getDate()>9?date.getDate():'0'+date.getDate();
        return years+'-'+months+'-'+days;
      },
      getWeek:function(){
        let language=localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en';
        let enWeeks=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        let cnWeeks=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        let date=new Date();
        let day=date.getDay();
        if(language == 'en'){
          return enWeeks[day];
        }else if(language == 'cn'){
          return cnWeeks[day];
        }else{
          return enWeeks[day];
        }
      },
      /*header 时间处理end*/
      jumpTo(data, id) {
        //this.$store.state.assetData.moduleData = data
        //this.$store.state.assetData.selectedData = id
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
    },
    computed:{

    },
    mounted() {
      this.initDate();
    }
  }
</script>

<style scoped>
@import "overview.scss";
</style>
<style>
  .overview .el-scrollbar__wrap{
    margin-bottom: 0px !important;
  }
</style>
