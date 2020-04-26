<script>
    import chartDataFormat from "../../../charts/chartDataFormat";
    import bus from '../../../../libs/bus';
    let bgColorList=['#b3424a','#7bbfea', '#f05b72', '#596032', '#bd6758',
      '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
      '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
      '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
      '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
      '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
      '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e',
    ];
    let overviewBgColor = ['#d64f40', '#ffdb28', '#7bfc95', '#77baf4',
      '#ac958f', '', '', '', '', '', '', '', '', '', '', ];
    let pieColor = ['#d64f40', '#e65f50', '#f66f60', '#f69f90',
      '#ffdb28', '#ffeb38', '#fffb48', '#ffffbb'];
    const commonOption={
      title:{
        show:false,
      },
      color: bgColorList,
      legend:{
        show:false,
      },
      toolbox:{
        show:false,
        top:'0',
        showTitle:false,
        tooltip:{
          show:false,
        },
        feature:{
          dataZoom:{
            yAxisIndex:false
          },
          magicType:{
            type:['stack']
          },
          // restore: {},
        }
      },
      tooltip: {
        trigger: 'axis',
        confine:false,
        extraCssText:'z-index:1000;',
        // formatter:null,
        // position:null,
      },
      grid: {
        top: 30,
        left: 0,
        right: 30,
        containLabel: true,
        bottom:8,//156
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
    };
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
    };
    const assetTypePie = {
      title: {
        show: false,
      },
      color: pieColor,
      legend: {
        show: false,
      },
      grid: {},
      series: [],
      tooltip : {}
    };
    const alertMessageBar = {
      title: {
        show: false,
      },
      color: overviewBgColor,
      legend: {
        show: false,
      },
      grid: {
        top: 30,
        left: 0,
        right: 30,
        containLabel: true,
        bottom:8
      },
      series: [],
      tooltip : {},
      xAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          fontSize: 13*window.devicePixelRatio
        }
      },
      yAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: [],
        axisLabel: {
          formatter: function(value) {
            if (value.length > 12) {
              return value.substring(0, 9) + "...";
            }
            return value;
          },
          fontSize: 12*window.devicePixelRatio
        },
        triggerEvent: true
      },
    };
    const overviewLine = {
      title:{
        show: false,
      },
      color: overviewBgColor,
      legend:{
        show:false,
      },
      toolbox:{
        show:false,
        top:'0',
        showTitle:false,
        tooltip:{
          show:false,
        },
        feature:{
          dataZoom:{
            yAxisIndex:false
          },
          magicType:{
            type:['stack']
          },
        }
      },
      tooltip: {
        trigger: 'axis',
        confine: false,
        extraCssText:'z-index:1000;',
      },
      grid: {
        left: 6,
        right: 20,
        containLabel: true,
        bottom: 0,
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          intervale: 0,
          rotate: 0,
          formatter: function (value) {
            value = bus.computeTimezone(value)
            let now = bus.computeTimezone(new Date().getTime());
            let t_date = new Date(value);
            let hhmm = [t_date.getHours(), t_date.getMinutes() < 10 ? "0" + t_date.getMinutes() : t_date.getMinutes()].join(':');
            let mmdd = [t_date.getMonth() + 1, t_date.getDate() < 10 ? "0" + t_date.getDate() : t_date.getDate()].join('/');
            if (value-now < 1000*60*60*24) {
              return hhmm;
            } else if (value-now >= 1000*60*60*24 && value-now < 1000*60*60*24*30) {
              return mmdd + " " + hhmm;
            } else {
              return mmdd;
            }
          },
          fontSize: 13*window.devicePixelRatio
        },
        axisPointer: {//y轴上显示指针对应的值
          show: true,
        },
        splitLine:{
          show:false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
      },
      yAxis: {
        type: 'value',
        splitLine:{
          show:true
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          fontSize: 13*window.devicePixelRatio
        }
      },
      useUTC: false,//使用本地时间
      series: [],
    };
    const chartTypes={
      line:{name:'line',option:commonOption},
      overviewLine: {name: 'line', option: overviewLine},
      map:{name:'map',option:mapOptions},
      pie: {name: 'assetType', option: assetTypePie},
      bar: {name: 'alertMessage', option: alertMessageBar}
    };
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
