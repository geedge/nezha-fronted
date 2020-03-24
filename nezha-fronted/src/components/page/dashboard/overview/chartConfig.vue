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
      tooltip : {
        trigger: 'item',
        type:'cross',
        backgroundColor:"#ff7f50",//提示标签背景颜色
        textStyle:{color:"#fff"}, //提示标签字体颜色
        alwaysShowContent: false,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 0,
        textStyle: {
          fontSize: 12,
          color: '#333'
        },
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
    }
</script>
