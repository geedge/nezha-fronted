<template>
  <div>
    <div class="line-area"  ref="lineChartArea"  :id="'lineChartArea'+chartIndex" v-show="firstShow" style="width:100%;"></div>
  </div>
</template>

<script>
	export default {
		name:"totalChart",
    props:{

    },
    watch:{},
    data(){
		  return{

      }
    },
    mounted(){

    },
    methods:{
		  //加载chart
      initChart(chartInfo, dataArg, ele, chartSite,legend) {
        this.chartInfo=chartInfo;
        const self = this;
        this.chartType = ''; // 图表类型
        if ( chartInfo.type === 4) {//line,bar
          this.chartType = 'line';
        }
        let minTime = null;
        let maxTime = null;
        if(dataArg.length>0 && dataArg[0].data
          && dataArg[0].data.length>0 && dataArg[0].data[0].length>0){
          let len = dataArg[0].data.length-1;
          minTime = dataArg[0].data[0][0];
          maxTime = dataArg[0].data[len][0];
        }
        if (chartSite === 'local') {
          this.echartStore = echarts.init(ele);
          //chartId='lineChartArea';
        }else if (chartSite === 'screen') {
          this.echartModalStore = echarts.init(ele);
          //chartId='screenShowArea';
        }
        var chartWidth = ele.clientWidth;
        var title = {
          show:false,
          text: chartInfo.title || null,
          textAlign: 'left',
          useHTML: true,
          textStyle: {
            //display: 'inline-block',//无此属性
            width: '60%',
            fontStyle:'normal',
            fontWeight:'bold',
            color: "#333",

          }
        };
        let stackIconBorderColor = (chartInfo.type==='stackArea'?'#53a3cb':'#7e7e7e');
        let stackIconChooseBorderColor = (chartInfo.type==='stackArea'?'#7e7e7e':'#53a3cb');
        var option = {
          title:{
            show:false,
          },
          color: this.bgColorList,
          toolbox:{
            show:false,
            top:'0',
            showTitle:true,
            feature:{
              dataZoom:{
                yAxisIndex:false,
                title:{
                  zoom:self.$t('overall.toolBox.zoom'),
                  back:self.$t('overall.toolBox.back'),
                }
              },
              magicType:{
                type:['stack'],
                title:{
                  stack:self.$t('overall.toolBox.stack')
                },
                iconStyle:{
                  borderColor:stackIconBorderColor,
                },
                emphasis:{
                  borderColor:stackIconChooseBorderColor,
                }
              },
            }
          },
          tooltip: {
            trigger: 'axis',
            confine:false,
            backgroundColor:'rgba(221,228,237,1)',
            textStyle:{
              color:'#000'
            },
            extraCssText:'z-index:1000;',
            /*enterable:true, 导致tooltip不消失，显示多个tooltip*/
            position:function(point,params,dom,rect,size){
              dom.style.transform = "translateZ(0)";
              //提示框位置
              var x=0;
              var y=0;
              //当前鼠标位置
              var pointX = point[0];
              var pointY = point[1];
              //外层div大小
              var viewWidth = size.viewSize[0];
              var viewHeight = size.viewSize[1];
              //提示框大小
              var boxWidth = size.contentSize[0];
              var boxHeight = size.contentSize[1];
              if (chartSite === 'local') { // 本地显示
                let chartDom = document.getElementById(chartInfo.title+"_"+chartInfo.id);
                if(chartDom){
                  let parTop = document.getElementById(chartInfo.title+"_"+chartInfo.id).offsetTop;
                  let parleft = document.getElementById(chartInfo.title+"_"+chartInfo.id).offsetLeft;

                  let parent = document.getElementById('tableList');
                  let parClientHeight = parent.clientHeight;//可视高度
                  let parClientWidth = parent.clientWidth;//可视宽度
                  let parScrollTop = parent.scrollTop;
                  if((parClientWidth-pointX-parleft-20)>=boxWidth){//说明鼠标在左边放不下提示框
                    x=pointX+10;
                  }else{
                    x = pointX - boxWidth;
                  }
                  if((parClientHeight-pointY-(parTop-parScrollTop)-20)>=boxHeight){//说明鼠标上面放不下提示框
                    y = pointY+10;
                  }else {
                    y = pointY-boxHeight;
                  }
                  return [x,y];
                }else {//preview page
                  x = pointX - boxWidth;
                  y = pointY+10;
                  return [x,y];
                }
              }else {
                if(pointX<(viewWidth/2)){//说明鼠标在左边放不下提示框
                  x=pointX+10;
                }else{
                  x = pointX - boxWidth;
                }
                if(pointY<(viewHeight/2)){//说明鼠标上面放不下提示框
                  y = pointY+10;
                }else {
                  y = pointY-boxHeight;
                }
                return [x,y];
              }
            },
            formatter:function(params){
              //display:inline-block;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;
              let str = `<div>`;

              //let str = `<div  style='white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;min-width:150px;max-width:600px;display:inline-block;line-height: 18px;font-size:12px;font-family: Roboto,Helvetica Neue,Arial,sans-serif;'>`;
              let sum = 0;
              params.forEach((item, i) => {
                let tip=legend[item.seriesIndex];
                let color = self.bgColorList[item.seriesIndex];
                if(i===0){
                  let value=bus.computeTimezone(item.data[0]);
                  let t_date = new Date(value);
                  str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                    + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                  str +=`<br/>`;
                }
                let val = parseFloat(Number(item.data[1]).toFixed(2));
                if(val===0){
                  val = Number(item.data[1]);
                }
                sum +=val;
                str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                str += `<div style="padding-left: 10px;">`;
                str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                str += `</div>`;
                str += `</div>`;
              });
              if(self.data.type==='stackArea' || self.isStackArea){
                if(!self.stackTotalColor||self.stackTotalColor==''){
                  self.stackTotalColor=randomcolor();
                }
                sum = parseFloat(Number(sum).toFixed(2));
                str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                str +=`<div style="line-height: 18px; font-size: 12px;padding-left:0px;">`
                str +=`<span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${self.stackTotalColor};}'></span>`;
                str +=self.$t("dashboard.panel.chartTotal");
                str +=`</div>`;
                str +=`<div style="padding-left: 10px;">`;
                str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                str +=`</div>`;
                str += `</div>`;
              }

              str +=`</div>`;
              return str;
            },
          },
          legend: {
            type:'scroll',
            height:80,
            show:false,
            icon:"roundRect",
            itemHeight:5,
            itemWidth:15,
            formatter:function(name){
              if(!name){
                return '';
              }
              //计算宽度
              var span = document.createElement("span");
              var result = {};
              result.width = span.offsetWidth;
              result.height = span.offsetHeight;
              span.style.visibility = "hidden";
              span.style.fontSize = 14;
              span.style.fontFamily = "Arial";
              span.style.display = "inline-block";
              document.body.appendChild(span);
              if(typeof span.textContent != "undefined"){
                span.textContent = name;
              }else{
                span.innerText = name;
              }
              var txtWidth = parseFloat(window.getComputedStyle(span).width) - result.width;
              document.body.removeChild(span);

              if(txtWidth < chartWidth){
                return name;
              }else {
                var charNum = `${(chartWidth-100)/(txtWidth/name.length)}`;
                return name.slice(0,charNum)+'...';
              }
            },
            tooltip:{
              show:true,
              formatter:function(params){
                return `<div  style='width:100%;display:block;word-break:break-all;word-wrap:break-word;white-space:normal'> ${params.name}</div>`;
              },
            },
            data: legend,
            orient:'vertical',
            x:'center',
            y:'bottom',
          },
          grid: {
            top: 30,
            left: 0,
            right: 30,
            containLabel: true,
            bottom:8,//156
          },
          xAxis: {
            type: 'time',
            axisLabel: {
              interval: '0',
              showMaxLabel:false,
              rotate: 0,
              show:true,
              fontSize: 10,
              formatter: function (value) {
                value = bus.computeTimezone(value);
                let t_date = new Date(value);
                let hour = t_date.getHours();
                hour=hour>9?hour:"0"+hour; //加0补充为两位数字
                let minute = t_date.getMinutes();
                minute=minute>9?minute:"0"+minute; //如果分钟小于10,则在前面加0补充为两位数字
                if(minTime!==null && maxTime!==null){
                  let diffSec = (maxTime-minTime)/1000;
                  let secOneDay = 24*60*60;//1天的秒数
                  let secOneMonth = secOneDay*30;//30天的秒数
                  if(diffSec<=secOneDay) {//同一天
                    return [hour,minute ].join(':');
                  }else if(diffSec<secOneMonth){//大于1天，小于30天
                    return [t_date.getMonth() + 1, t_date.getDate()].join('/') +" "+  [hour, minute].join(':');
                  }else {//大于等于30天
                    return [t_date.getMonth() + 1, t_date.getDate()].join('/');
                  }
                }else {
                  return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('/') + "\n"
                    + [hour, minute].join(':');
                }

              }
            },
            axisPointer: {//y轴上显示指针对应的值
              show: true,
            },
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
            //boundaryGap:['20%', '0'],
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
            //去掉y轴--start
            axisLine:{
              show:false
            },
            minInterval: 1,
            axisTick: {
              show: false,
            },
            //去掉y轴--end
            axisLabel: {
              show:true,
              fontSize: 10,
              formatter: function(value,index){
                let chartUnit=chartInfo.unit;
                chartUnit=chartUnit?chartUnit:2;
                let unit=chartDataFormat.getUnit(chartUnit);
                //console.info(value, chartUnit, unit.compute(value,index))
                return unit.compute(value,index);
              },
            },
            //boundaryGap:[0,0.2]
          },
          useUTC: false,//使用本地时间
          series: dataArg
        };
        // params.series = dataArg;
        if (chartSite === 'local') { // 本地显示
          if(legend){
            this.legendList = [];
            legend.forEach((item, i) => {
              const legend = {
                name:item.name,
                alias:item.alias,
                showText:this.formatLegend(chartWidth,item.name)
              };
              this.legendList.push(legend);
              this.isGrey.push(false);
            });
          }
          this.legendListMore=this.legendList.filter((item,index)=>index<this.seriesLength);
          this.$nextTick(() => {
            setTimeout(function () {
              let divHeight = self.$refs.legendArea.offsetHeight;
              if(!chartInfo.height){
                self.echartStore.resize({height:(400-divHeight-self.$chartResizeTool.titleHeight-self.$chartResizeTool.chartBlankHeight)});
              }else {
                self.echartStore.resize({height:(chartInfo.height-divHeight-self.$chartResizeTool.titleHeight-self.$chartResizeTool.chartBlankHeight)});
              }
              if(dataArg&&dataArg.length>0){
                self.echartStore.clear();
                self.echartStore.setOption(option);//创建图表
                self.noData=false;
              }else{
                self.noData=true;
                option=chartConfig.getOption('noData')
                self.echartStore.clear();
                self.echartStore.setOption(option);//创建图表
              }

              self.$refs['localLoading'+self.chartIndex].endLoading();
              self.firstShow = true; // 展示操作按键
            }, 100);

            window.addEventListener('resize', function () {
              self.echartStore.resize();
            });
            this.echartStore.on('magictypechanged', function (params) {
              self.isStackArea = !self.isStackArea;
              if(self.isStackArea){
                this.setOption({
                  toolbox:{
                    feature:{
                      dataZoom:{
                        yAxisIndex:false,
                        title:{
                          zoom:self.$t('overall.toolBox.zoom'),
                          back:self.$t('overall.toolBox.back'),
                        }
                      },
                      magicType:{
                        type:['stack'],
                        title:{
                          stack:self.$t('overall.toolBox.stack')
                        },
                        iconStyle:{
                          borderColor:'#7e7e7e',
                        },
                        emphasis:{
                          borderColor:stackIconChooseBorderColor,
                        }
                      },
                    }
                  },
                  tooltip: {
                    formatter:function(params){
                      let str = `<div>`;
                      let sum = 0;
                      params.forEach((item, i) => {let tip=legend[item.seriesIndex];
                        let color = self.bgColorList[item.seriesIndex];
                        if(i===0){
                          let value=bus.computeTimezone(item.data[0]);
                          let t_date = new Date(value);
                          str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                            + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                          str +=`<br/>`;
                        }
                        let val = parseFloat(Number(item.data[1]).toFixed(2));
                        if(val===0){
                          val = Number(item.data[1]);
                        }
                        sum +=val;
                        str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                        str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                        str += `<div style="padding-left: 10px;">`;
                        str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                        str += `</div>`;
                        str += `</div>`;
                      });
                      if(self.data.type==='stackArea' || self.isStackArea){
                        sum = parseFloat(Number(sum).toFixed(2));
                        str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                        str +=`<div style="line-height: 18px; font-size: 12px;padding-left:20px;">`
                        str +=self.$t("dashboard.panel.chartTotal");
                        str +=`</div>`;
                        str +=`<div style="padding-left: 10px;">`;
                        str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                        str +=`</div>`;
                        str += `</div>`;
                      }

                      str +=`</div>`;
                      return str;
                    },
                  }
                });
              }
            });
          });
        } else if (chartSite === 'screen') { // 全屏显示
          // eslint-disable-next-line
          if(legend){
            this.screenLegendList = [];
            legend.forEach((item, i) => {
              const legend = {
                name:item.name,
                alias:item.alias,
                showText:this.formatLegend(chartWidth,item.name)
              };
              this.screenLegendList.push(legend);
              this.isGreyScreen.push(false);
            });
          }
          if(this.screenLegendListMore.length!==this.screenLegendList.length){
            this.screenLegendListMore=this.screenLegendList.filter((item,index)=>index<this.seriesLength);
          }
          if(self.echartModalStore){
            self.echartModalStore.clear();
            option.title = {};
            self.showLegend = true;
            self.$refs['localLoadingScreen'+self.chartIndex].endLoading();
          }
          this.$nextTick(() => {
            let legendDiv = document.getElementById('screenLegendArea'+self.chartIndex);
            let divHeight = legendDiv.offsetHeight;
            let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
            let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
            //console.log("11____00",sumHeight,divHeight,legendDiv)
            self.$refs.screenShowArea.style.height = `${sumHeight - divHeight - self.screenTitleHeight}px`;
            self.echartModalStore.resize({height: (sumHeight - divHeight - self.screenTitleHeight)});//图表的高度
            setTimeout(function () {
              if(self.screenLegendListMore.length!==self.screenLegendList.length){
                self.seriesItemArrScreen=self.seriesItemScreen.filter((item,index)=>index<self.seriesLength);

              }else{
                self.seriesItemArrScreen=self.seriesItemScreen
              }
              option.series=self.seriesItemArrScreen;
              if(dataArg&&dataArg.length>0){
                self.echartModalStore.setOption(option);//显示全屏界面
                self.noData=false;
              }else{
                self.noData=true;
                option=chartConfig.getOption('noData')
                self.echartModalStore.setOption(option);//显示全屏界面
              }
              self.echartModalStore.on('finished', function () {
                let legendDiv = document.getElementById('screenLegendArea'+self.chartIndex);
                let divHeight = legendDiv.offsetHeight;
                let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
                let sumHeight = Math.floor(screenHeight*0.99*0.8);//margin-top:1vh; dailog:80%
                //console.log("11____00",sumHeight,divHeight,legendDiv)
                self.$refs.screenShowArea.style.height = `${sumHeight - divHeight - self.screenTitleHeight}px`;
                self.echartModalStore.resize({height: (sumHeight - divHeight - self.screenTitleHeight)});//图表的高度
                console.log(self.seriesItemScreen,self.seriesItemArrScreen);
                self.echartModalStore.off('finished');
              })
            }, 100);

            this.echartModalStore.on('magictypechanged', function (params) {
              self.isStackArea = !self.isStackArea;
              if(self.isStackArea){
                this.setOption({
                  toolbox:{
                    feature:{
                      dataZoom:{
                        yAxisIndex:false,
                        title:{
                          zoom:self.$t('overall.toolBox.zoom'),
                          back:self.$t('overall.toolBox.back'),
                        }
                      },
                      magicType:{
                        type:['stack'],
                        title:{
                          stack:self.$t('overall.toolBox.stack')
                        },
                        iconStyle:{
                          borderColor:'#7e7e7e',
                        },
                        emphasis:{
                          borderColor:stackIconChooseBorderColor,
                        }
                      },
                    }

                  },
                  tooltip: {
                    formatter:function(params){
                      let str = `<div>`;
                      let sum = 0;
                      params.forEach((item, i) => {let tip=legend[item.seriesIndex];
                        let color = self.bgColorList[item.seriesIndex];
                        if(i===0){
                          let value=bus.computeTimezone(item.data[0]);
                          let t_date = new Date(value);
                          str += [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + " "
                            + [t_date.getHours(), t_date.getMinutes(),t_date.getSeconds()].join(':');
                          str +=`<br/>`;
                        }
                        let val = parseFloat(Number(item.data[1]).toFixed(2));
                        if(val===0){
                          val = Number(item.data[1]);
                        }
                        sum +=val;
                        str += `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                        str += `<div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${color};}'></span>${tip?(tip.alias?tip.alias:tip.name):item.seriesName}  </div>`;
                        str += `<div style="padding-left: 10px;">`;
                        str += chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(val,null,2);
                        str += `</div>`;
                        str += `</div>`;
                      });
                      if(self.data.type==='stackArea' || self.isStackArea){
                        sum = parseFloat(Number(sum).toFixed(2));
                        str +=`<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">`;
                        str +=`<div style="line-height: 18px; font-size: 12px;padding-left:20px;">`
                        str +=self.$t("dashboard.panel.chartTotal");
                        str +=`</div>`;
                        str +=`<div style="padding-left: 10px;">`;
                        str +=chartDataFormat.getUnit(chartInfo.unit?chartInfo.unit:2).compute(sum,null,2);
                        str +=`</div>`;
                        str += `</div>`;
                      }

                      str +=`</div>`;
                      return str;
                    },
                  }
                });
              }
            });
          });
        }
      },
    },
	}
</script>

<style scoped>

</style>
