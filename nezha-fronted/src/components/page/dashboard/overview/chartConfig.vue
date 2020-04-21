<script>
    import chartDataFormat from "../../../charts/chartDataFormat";
    import bus from '../../../../libs/bus';
    let bgColorList=['#7bbfea', '#b3424a', '#f05b72', '#596032', '#bd6758',
      '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
      '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
      '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
      '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
      '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
      '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e',
    ]
    const commonOption={
      title:{
        show:false,
      },
      color: bgColorList,
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
        show:false,
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
            value=bus.computeTimezone(value)
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

        roam:'scale',//鼠标是否可以控制缩放
        scaleLimit:{
          min:0.7,
          max:1.5
        },
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
      },
      getBgColorList:function(){
        return Object.assign([],bgColorList)
      }
    }
</script>
