<script>
    import chartDataFormat from "../../../charts/chartDataFormat";
    import bus from '../../../../libs/bus';
    import vm from '../../../../main'
    window.onload=function(){
      commonOption.toolbox.feature.dataZoom.title.zoom=vm.$i18n.t('overall.toolBox.zoom')
      commonOption.toolbox.feature.dataZoom.title.back=vm.$i18n.t('overall.toolBox.back')
      commonOption.toolbox.feature.magicType.title.stack=vm.$i18n.t('overall.toolBox.stack')
    }
    let bgColorList=['#b3424a','#7bbfea', '#f05b72', '#596032', '#bd6758',
      '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
      '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
      '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
      '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
      '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
      '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e',
    ];
    let overviewBgColor =
      ['#d64f40', '#ffdb28', '#7bfc95', '#77baf4',
      '#ac958f', '', '', '', '', '', '', '', '', '', '', ];
/*    let pieColor = ["#0c69ff","#59f747","#2eeab8","#b5ed8e",
      "#205299","#ffd6c6","#a0ffdf","#9be524",
      "#8abafc","#d181e8","#d88d50","#cce8ff",
      "#161ef9"];*/

    let pieColor = ["#ECCD82", "#99CEB9", "#EEA694", "#8EA8DF", "#92C9DF"];/*['#d64f40', '#e66f60', '#f68f80', '#f6afa0',
      '#ffdb28', '#ffeb38', '#fffb48', '#ffffbb'];*/

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
        showTitle:true,
        tooltip:{
          show:false,
        },
        feature:{
          dataZoom:{
            yAxisIndex:false,
            title:{

            }
          },
          magicType:{
            type:['stack'],
            title:{}
          },
          // restore: {},
        }
      },
      tooltip: {
        trigger: 'axis',
        confine:false,
        extraCssText:'z-index:1000;',
        backgroundColor:'rgba(221,228,237,1)',
        borderColor:'rgba(221,228,237,1)',
        textStyle:{color: "#000"}
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
            value=value
            var t_date = new Date(value);
            return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + "\n"
              + [t_date.getHours(), t_date.getMinutes()].join(':');
          }
        },
        axisPointer: {//y轴上显示指针对应的值
          show: true,
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine:{
          show:true,
          lineStyle: {
            color: "#d9d9d9",
            opacity: 0.8,
            width: 1
          }
        }
      },
      yAxis: {
        type: 'value',
        splitLine:{
          show:true,
          lineStyle: {
            color: "#d9d9d9",
            opacity: 0.8,
            width: 1
          }
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
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
        itemStyle: {areaColor: "white"},
        map: '',
        roam: true,//鼠标是否可以控制缩放
        center: [67.45, 48],//当前视角的中心点，用经纬度表示
        //center: [-127.45, -48],//当前视角的中心点，用经纬度表示
        zoom: 6,
        label: { //控制显示地图名称
          normal: {
            show: false
          },
          emphasis: {
            show: false
          },
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
        scaleLimit: {
          min: 4,
          max: 8
        }
      },
      tooltip : {
        trigger: 'item',
        type:'cross',
        alwaysShowContent: false,
        backgroundColor: 'rgba(255,255,255,0.7)',
        /*borderColor:'#ffffff',
        borderRadius: 4,
        borderWidth: 1,
        padding: 0,*/
      },
      backgroundColor: "#BDE3FD"
    };
    const assetTypePie = {
      title: {
        show: false,
      },
      color: pieColor,
      grid: {
        top: "top",
        left: "left"
      },
      legend: {},
      series: [],
      tooltip : {}
    };
    const alertMessageBarByRule = {
      title: {
        show: false,
      },
      legend: {
        show: false,
      },
      grid: {
        top: 60,
        left: 80,
        right: 30,
        bottom: 60,
      },
      series: [],
      tooltip : {
        backgroundColor: "rgba(255, 255, 255, 0.66)",
        extraCssText: "box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);",
        textStyle: {color: "#333"}
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show:true,
          fontSize: 14
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
          show: true,
          fontSize: 12,
          formatter: function(value) {
            if (value.length > 10) {
              return value.substring(0, 8) + "...";
            }
            return value;
          },
        },
        triggerEvent: true
      },
    };
    const alertMessageBarByAsset = {
      title: {
        show: false,
      },
      color: function(params) {
        //首先定义一个数组
        let colorList = [pieColor[0], pieColor[1]];;
        if(params.dataIndex % 2 == 0){
          return colorList[0]
        }else{
          return colorList[1]
        }
      },
      legend: {
        show: false,
      },
      grid: {
        top: 60,
        left: 80,
        right: 30,
        bottom: 60,
      },
      series: [],
      tooltip : {
        backgroundColor: "rgba(255, 255, 255, 0.66)",
        extraCssText: "box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);",
        textStyle: {color: "#333"}
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show:true,
          fontSize: 14
        }
      },
      xAxis: {
        type: 'category',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: [],
        axisLabel: {
          show: true,
          fontSize: 12,
          formatter: function(value) {
            let r = value;
            if (r.length > 4) {
              r = value.substring(0, 3) + "...";
            }
            return r.split("").join("\n");
          },
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
        formatter: function(v, i) {
          return v;
        }
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
            if (now-value < 1000*60*60*24) {
              return hhmm;
            } else if (now-value >= 1000*60*60*24 && now-value < 1000*60*60*24*30) {
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
          fontSize: 13*window.devicePixelRatio,
          formatter: function(value, i) {
            let y;
            if (value < 1000) {
              y = value + " Bs";
            } else if (value < 1000000) {
              y = value/1000 + " KBs";
            } else if (value >= 1000000) {
              y = value/1000000 + " MBs";
            } else {
              y = value/1000000000 + " GBs";
            }
            return y;
          }
        }
      },
      useUTC: false,//使用本地时间
      series: [],
    };
    const noDataOption={
      grid: {
        top: 30,
        left: 0,
        right: 30,
        containLabel: true,
        bottom:8,//156
      },
      xAxis: {
        type: 'category',
        data: createTempTimes(),
        splitLine:{
          show:true
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
      },
      yAxis: {
        type: 'category',
        data: [1, 3, 5, 7, 9, 11, 13],
        splitLine:{
          show:true
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
      },
      series: null,
    };
    function createTempTimes(){
      let times=[];
      for(let i=0;i<10;i++){
        let time=new Date();
        time.setMinutes(new Date().getMinutes()-(10-i)*5);
        times.push(bus.timeFormate(time,'hh:mm'))
      }
      return times;
    }
    const chartTypes={
      line:{name:'line',option:commonOption},
      overviewLine: {name: 'line', option: overviewLine},
      map:{name:'map',option:mapOptions},
      pie: {name: 'assetType', option: assetTypePie},
      bar: {name: 'alertMessage', option: alertMessageBarByAsset},
      ruleBar: {name: 'ruleMessage', option: alertMessageBarByRule},
      assetBar: {name: 'assetMessage', option: alertMessageBarByAsset},
      noData:{name:'noData',option:noDataOption},
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
      },

    }
</script>
