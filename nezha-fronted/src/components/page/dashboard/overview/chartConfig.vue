<script>
    import chartDataFormat from "../../../charts/chartDataFormat";
    const commonOption={
      title:{
        show:false,
      },
      color: this.bgColorList,
      legend:{
        show:false,
      },
      tooltip: {
        trigger: 'axis',
        confine:false,
        extraCssText:'z-index:1000;',
        // formatter:null,
        // position:null,
      },
      grid: {
        top: 13,
        left: 0,
        right: 30,
        containLabel: true,
        bottom:35,//156
      },
      dataZoom: [{
        type: 'slider',
        show:true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height:25,
        bottom:10,//96
        left:40,
        right:48,
      }],
      xAxis: {
        type: 'time',
        // boundaryGap: false,//line-false; bar-true;
        axisLabel: {
          intervale: 0,
          rotate: 0,
          formatter: function (value) {
            var t_date = new Date(value);
            return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + "\n"
              + [t_date.getHours(), t_date.getMinutes()].join(':');
          }
        },
        axisPointer: {//y轴上显示指针对应的值
          show: true,
        },
        splitLine:{
          show:false
        }
      },
      yAxis: {
        type: 'value',
        splitLine:{
          show:true
        },
        axisLabel: {
          // formatter:null,
        },
      },
      useUTC: false,//使用本地时间
      series: [],
    }
    const mapOptions={
      geo:{
        map:'',

        roam:true,//鼠标是否可以控制缩放
        // center:[],//当前视角的中心点，用经纬度表示
        label: { //控制显示地图名称
          normal: {
            show: true
          },
          emphasis: {
            show: true
          },
        } ,
        itemStyle:{
          // areaColor:'lightgrey', //设置默认状态下地图颜色

        },
        emphasis:{
          itemStyle: {
            areaColor:'white'
          }
        },
        left:0,
        top:0,
        right:0,
        bottom:0,
      },
      dataRange:{
        x: '-1000 px', //图例横轴位置
        y: '-1000 px', //图例纵轴位置
        splitList: [
          { start: 1, end: 1, label: 'astana', color: '#cfc5de' },
          { start: 2, end: 2, label: '天津', color: '#f1ebd1' },
          { start: 3, end: 3, label: '上海', color: '#feffdb' },
          ]
      },
      tooltip : {
        trigger: 'item',
        type:'cross',
        alwaysShowContent: false,
        // backgroundColor: 'rgba(0,0,0,0.7)',
        borderColor:'#ffffff',
        borderRadius: 4,
        borderWidth: 1,
        padding: 0,
      },
    }
    const chartTypes={
      line:{name:'line',option:commonOption},
      map:{name:'map',option:mapOptions},
    }
    export default {
      getOption:function(type){
        return Object.assign({},chartTypes[type].option);
      },
      setMap:function(map){
        mapOptions.geo.map=map
      }
    }
</script>
