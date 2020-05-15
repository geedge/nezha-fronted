<template>
  <div class="overview" style="height: 100%;">
    <!--左侧菜单栏-->
    <left-menu>
      <div slot="content-left" class="slot-content">
        <div class="sidebar-title">{{$t('dashboard.title')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item sidebar-info-item-active" >{{$t('dashboard.overview.title')}}</div>
          <div class="sidebar-info-item sidebar-info-top " @click="jumpTo('panel')">{{$t('dashboard.panel.title')}}</div>
          <div class="sidebar-info-item" @click="jumpTo('explore')">{{$t('dashboard.metricPreview.title')}}</div>
        </div>
      </div>
      <!--右侧内容-->
      <div class="overview-right slot-content" id="mainDisplay" slot="content-right">
        <svg width="500" height="500">
          <path fill="none" stroke-width="10"></path>
        </svg>
      </div>
      <!--<div class="overview-right slot-content" id="mainDisplay" slot="content-right">
        <div id="topo" style="width: 75%; display: inline-block; height: 99%"></div>
        <div style="width: 24%; display: inline-block; height: 99%; background-color: white; vertical-align: top">
          name: <input id="k1"></input><br/>
          alerts: <input id="k2"></input><br/>
          x: <input id="k3"></input>
        </div>
      </div>-->
    </left-menu>
  </div>
</template>

<script>
  import * as d3 from "d3";
  export default {
    name: "test",
    data() {
      return {

      }
    },
    methods: {
      test() {

      }
    },
    mounted() {
      this.test();
    }
  }
  /*export default {
    name: "test",
    data() {
      return {
        chart: '',
        data: {nodes: [
            {color: "#4f19c7", label: "jquery", y: -404.26147, x: -739.36383, id: "jquery", size: 54},
            {color: "#4f19c7", label: "jsdom", y: -404.26147, x: -738.06383, id: "jsdom", size: 13}],
          edges: [{sourceID: "jquery", targetID: "jsdom", size: 1}]}
      }
    },
    methods: {
      load() {
        let myChart = echarts.init(document.getElementById("topo"));
        var symbolSize = 20;

        //var data = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];
        var data = [[[15, 0], [-50, 10]], [[-50, 10], [-56.5, 20]], [[-56.5, 20], [-46.5, 30]], [[-46.5, 30], [-22.1, 40]]];
        var data1 = [[15, 0], [-50, 10], [-56.5, 20], [-46.5, 30], [-22.1, 40]];
        var data2 = data.map((d, i) => {
          return {
            name: i,
            coords: d
          };
        });
        myChart.setOption({
          xAxis: {
            min: -100,
            max: 80,
            type: 'value',
            axisLine: {onZero: false},
            show: false
          },
          yAxis: {
            min: -30,
            max: 60,
            type: 'value',
            axisLine: {onZero: false},
            show: false
          },
          series: [
            {
              id: 'a',
              type: 'lines',
              coordinateSystem: 'cartesian2d',
              symbol: ['none', 'arrow'],
              symbolSize: symbolSize, // 为了方便拖拽，把 symbolSize 尺寸设大了。
              data: data2,
              lineStyle: {
                normal: {
                  color: '#ff0000',
                  width: 1,
                  curveness: 0.2
                }
              },
            }, {
              id: 'b',
              symbolSize: 20,
              data: data1,
              type: 'scatter',
              label: {
                show: true,
              }
            }
          ]
        });
        setTimeout(() => {
          myChart.setOption({
            graphic: echarts.util.map(data1, function (dataItem, dataIndex) {
              let a = {
                type: 'circle',
                shape: {
                  r: symbolSize / 2
                },
                position: myChart.convertToPixel('grid', dataItem),
                draggable: true,
                invisible: true,
                z: 100,
                info: {name: 'kafka' + dataIndex, alerts: (dataIndex+1)*50},
                ondrag: echarts.util.curry(onPointDragging, dataIndex),
                style: {
                  fill: '#777'
                }
              };
              return a;
            })
          });
        });
        myChart.on('click', (e) => {
          if (e.info) {
            document.getElementById("k1").value = e.info.name;
            document.getElementById("k2").value = e.info.alerts;
            document.getElementById("k3").value = e.event.offsetX;
          }
        });
        myChart.on('mousedown', (e) => {
          if (e.info) {
            document.getElementById("k1").value = e.info.name;
            document.getElementById("k2").value = e.info.alerts;
            document.getElementById("k3").value = e.event.offsetX;
          }
        });
        myChart.on('mousemove', (e) => {
          if (e.info) {
            document.getElementById("k3").value = e.event.offsetX;
          }
        });
        function onPointDragging(dataIndex) {
          for (let k in myChart._componentsMap) {
            if (k.indexOf("graphic") > -1) {
              if (dataIndex != 0) {
                data[dataIndex-1] = [data[dataIndex-1][0], myChart.convertFromPixel('grid', this.position)];
              }
              if (dataIndex != data.length) {
                data[dataIndex] = [myChart.convertFromPixel('grid', this.position), data[dataIndex][1]];
              }
              data1[dataIndex] = myChart.convertFromPixel('grid', this.position);
            }
          }
          // 用更新后的 data，重绘折线图。
          myChart.setOption({
            series: [{
              id: 'a',
              data: data
            }, {
              id: 'b',
              data: data1
            }]
          });
        }
        window.addEventListener('resize', function () {
          // 对每个拖拽圆点重新计算位置，并用 setOption 更新。
          myChart.setOption({
            graphic: echarts.util.map(data, function (item, dataIndex) {
              return {
                position: myChart.convertToPixel('grid', item)
              };
            })
          });
        });
      }
    },
    mounted() {
      this.load();
    }
  }*/
</script>
