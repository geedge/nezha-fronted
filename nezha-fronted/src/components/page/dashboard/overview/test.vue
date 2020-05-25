<template>
  <div class="overview topo" style="height: 100%;">
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
        <svg width="100%" height="100%" x="0" y="0" id="canvas">
          <!--左侧菜单 图片列表-->
          <g id="menu">
            <g id="items">
              <g id="dc" class="menu-item-box">
                <rect class="menu-item-shade" x="30" y="96" height="75" width="80"></rect>
                <svg x="40" y="100" viewBox="0 0 1024 1024" width="60" height="60"><path d="M693.2 225.1h49.3v-49.3h-49.3v49.3z m-459.9 32.8h16.4v-115h-16.4v115z m98.5 246.4H134.7v16.4h197.1v-16.4zM216.8 800h32.9v-32.9h-32.9V800zM726 504.3h-32.9v16.4H726v-16.4z m0 262.8h-32.9V800H726v-32.9zM857.4 455v-98.6H559c-4.9-14-16-25.1-30-30v-19.2h312V93.7H184v213.5h312.1v19.2c-14 4.9-25.1 16-30 30H216.8V455H85.4v394.2h295.7V455H249.7v-65.7H466c4.9 14 16 25.1 30 30V455h-82.1v394.2H611V455h-82.1v-35.7c14-4.9 25.1-16 30-30h134.2V455h-49.3v394.2h131.4V455H726v-65.7h98.6V455h-16.4v394.2h131.4V455h-82.2z m-509.2 32.9v328.5h-230V487.9h230zM216.8 274.3V126.5h591.3v147.8H216.8z m361.4 213.6v328.5H446.8V487.9h131.4z m-65.7-98.6c-9.1 0-16.4-7.4-16.4-16.4 0-9.1 7.4-16.4 16.4-16.4s16.4 7.4 16.4 16.4c0 9.1-7.3 16.4-16.4 16.4z m230 98.6v328.5h-65.7V487.9h65.7z m164.2 328.5H841V487.9h65.7v328.5z m-16.4-49.3h-32.9V800h32.9v-32.9z m0-262.8h-32.9v16.4h32.9v-16.4z m-328.5 0h-98.6v16.4h98.6v-16.4zM496.1 800H529v-32.9h-32.9V800z" fill="#1782bb"></path></svg>
                <svg x="40" y="100" class="temp dc-temp" viewBox="0 0 1024 1024" width="60" height="60"><rect x="0" y="0" height="100%" width="100%" fill="transparent"></rect><path d="M693.2 225.1h49.3v-49.3h-49.3v49.3z m-459.9 32.8h16.4v-115h-16.4v115z m98.5 246.4H134.7v16.4h197.1v-16.4zM216.8 800h32.9v-32.9h-32.9V800zM726 504.3h-32.9v16.4H726v-16.4z m0 262.8h-32.9V800H726v-32.9zM857.4 455v-98.6H559c-4.9-14-16-25.1-30-30v-19.2h312V93.7H184v213.5h312.1v19.2c-14 4.9-25.1 16-30 30H216.8V455H85.4v394.2h295.7V455H249.7v-65.7H466c4.9 14 16 25.1 30 30V455h-82.1v394.2H611V455h-82.1v-35.7c14-4.9 25.1-16 30-30h134.2V455h-49.3v394.2h131.4V455H726v-65.7h98.6V455h-16.4v394.2h131.4V455h-82.2z m-509.2 32.9v328.5h-230V487.9h230zM216.8 274.3V126.5h591.3v147.8H216.8z m361.4 213.6v328.5H446.8V487.9h131.4z m-65.7-98.6c-9.1 0-16.4-7.4-16.4-16.4 0-9.1 7.4-16.4 16.4-16.4s16.4 7.4 16.4 16.4c0 9.1-7.3 16.4-16.4 16.4z m230 98.6v328.5h-65.7V487.9h65.7z m164.2 328.5H841V487.9h65.7v328.5z m-16.4-49.3h-32.9V800h32.9v-32.9z m0-262.8h-32.9v16.4h32.9v-16.4z m-328.5 0h-98.6v16.4h98.6v-16.4zM496.1 800H529v-32.9h-32.9V800z" fill="#1782bb"></path></svg>
                <text x="70" y="168" class="item-name">Datacenter</text>
              </g>
              <g id="cab" class="menu-item-box">
                <rect class="menu-item-shade" x="111" y="96" height="75" width="80"></rect>
                <svg x="121" y="100" viewBox="0 0 1024 1024" width="60" height="60"><path d="M640 896h192V469.376h42.666667V896.213333c0 23.466667-19.029333 42.474667-42.666667 42.474667H597.333333V725.333333h-170.666666v213.333334H192c-23.573333 0-42.666667-18.986667-42.666667-42.453334V469.354667h42.666667V896h192V682.666667h256v213.333333z" fill="#1782bb"></path><path d="M100.032 506.133333a21.333333 21.333333 0 1 1-29.397333-30.933333L466.282667 99.349333a66.688 66.688 0 0 1 91.434666 0L953.386667 475.2a21.333333 21.333333 0 1 1-29.397334 30.933333L528.341333 130.282667a24.021333 24.021333 0 0 0-32.682666 0L100.053333 506.133333zM832 192h-128a21.333333 21.333333 0 0 1 0-42.666667h149.333333a21.333333 21.333333 0 0 1 21.333334 21.333334v149.333333a21.333333 21.333333 0 0 1-42.666667 0V192z" fill="#1782bb"></path></svg>
                <svg x="121" y="100" class="temp cab-temp" viewBox="0 0 1024 1024" width="60" height="60"><rect x="0" y="0" height="100%" width="100%" fill="transparent"></rect><path d="M640 896h192V469.376h42.666667V896.213333c0 23.466667-19.029333 42.474667-42.666667 42.474667H597.333333V725.333333h-170.666666v213.333334H192c-23.573333 0-42.666667-18.986667-42.666667-42.453334V469.354667h42.666667V896h192V682.666667h256v213.333333z" fill="#1782bb"></path><path d="M100.032 506.133333a21.333333 21.333333 0 1 1-29.397333-30.933333L466.282667 99.349333a66.688 66.688 0 0 1 91.434666 0L953.386667 475.2a21.333333 21.333333 0 1 1-29.397334 30.933333L528.341333 130.282667a24.021333 24.021333 0 0 0-32.682666 0L100.053333 506.133333zM832 192h-128a21.333333 21.333333 0 0 1 0-42.666667h149.333333a21.333333 21.333333 0 0 1 21.333334 21.333334v149.333333a21.333333 21.333333 0 0 1-42.666667 0V192z" fill="#1782bb"></path></svg>
                <text x="151" y="168" class="item-name">Cabinet</text>
              </g>
              <g id="device" class="menu-item-box">
                <rect class="menu-item-shade" x="30" y="181" height="75" width="80"></rect>
                <svg x="40" y="185" viewBox="0 0 1024 1024" width="60" height="60"><path d="M447.5 960.3l-321-110v-642l321 82z" fill="#37BBEF"></path><path d="M447.5 960.3l450-240v-600l-450 170z" fill="#2481BA"></path><path d="M126.5 208.3l321 82 450-170-344.4-56.6z" fill="#3ED6FF"></path><path d="M400.3 348.9v80l-239-60v-80l239 60z m-239 48.3l239 60v-10l-239-60v10z m0 23l239 60v-10l-239-60v10z m0 23l239 60v-10l-239-60v10z" fill="#D4F7FF"></path><path d="M175.7 308.4v34l210.2 53v-34zM175.7 363.4l210.2 53v-13.3l-210.2-53z" fill="#113B42"></path><path d="M447.5 894.1v-5.2l-174.4-55.3-1.2 4.8zM271.9 809.3L447.5 864v-5.3l-174.4-54.3zM271.9 780.1l175.6 53.7v-5.2l-174.4-53.4zM447.5 707.9l-174.4-49.3-1.2 4.8 175.6 49.7zM271.9 692.6l175.6 50.7v-5.2l-174.4-50.4zM271.9 750.9l175.6 52.7v-5.2l-174.4-52.3zM271.9 721.8l175.6 51.7v-5.3l-174.4-51.3z" fill="#0071BC"></path><path d="M379.5 540.8c-9.4-3.4-17 1.6-17 11.2s7.6 20.1 17 23.2 17-1.9 17-11.2-7.6-19.8-17-23.2zM379.5 603.6c-3.9-1.2-7 1-7 4.9s3.1 8.1 7 9.3 7-1 7-4.9c0-3.9-3.1-8-7-9.3z" fill="#FFFFFF"></path></svg>
                <svg x="40" y="185" class="temp device-temp" viewBox="0 0 1024 1024" width="60" height="60"><rect x="0" y="0" height="100%" width="100%" fill="transparent"></rect><path d="M447.5 960.3l-321-110v-642l321 82z" fill="#37BBEF"></path><path d="M447.5 960.3l450-240v-600l-450 170z" fill="#2481BA"></path><path d="M126.5 208.3l321 82 450-170-344.4-56.6z" fill="#3ED6FF"></path><path d="M400.3 348.9v80l-239-60v-80l239 60z m-239 48.3l239 60v-10l-239-60v10z m0 23l239 60v-10l-239-60v10z m0 23l239 60v-10l-239-60v10z" fill="#D4F7FF"></path><path d="M175.7 308.4v34l210.2 53v-34zM175.7 363.4l210.2 53v-13.3l-210.2-53z" fill="#113B42"></path><path d="M447.5 894.1v-5.2l-174.4-55.3-1.2 4.8zM271.9 809.3L447.5 864v-5.3l-174.4-54.3zM271.9 780.1l175.6 53.7v-5.2l-174.4-53.4zM447.5 707.9l-174.4-49.3-1.2 4.8 175.6 49.7zM271.9 692.6l175.6 50.7v-5.2l-174.4-50.4zM271.9 750.9l175.6 52.7v-5.2l-174.4-52.3zM271.9 721.8l175.6 51.7v-5.3l-174.4-51.3z" fill="#0071BC"></path><path d="M379.5 540.8c-9.4-3.4-17 1.6-17 11.2s7.6 20.1 17 23.2 17-1.9 17-11.2-7.6-19.8-17-23.2zM379.5 603.6c-3.9-1.2-7 1-7 4.9s3.1 8.1 7 9.3 7-1 7-4.9c0-3.9-3.1-8-7-9.3z" fill="#FFFFFF"></path></svg>
                <text x="70" y="253" class="item-name">Device</text>
              </g>
            </g>
            <g id="lines">
              <g id="solidLine" class="menu-item-box straight-line">
                <rect class="menu-item-shade" x="30" y="320" height="30" width="30"></rect>
                <polyline points="40,325 50,345" class="line-shape"></polyline>
              </g>
              <g id="dashLine" class="menu-item-box straight-line">
                <rect class="menu-item-shade" x="63" y="320" height="30" width="30"></rect>
                <polyline stroke-dasharray="3,2" points="73,325 83,345" class="line-shape"></polyline>
              </g>
            </g>
            <line x1="220" y1="0" x2="220" y2="100%" style="stroke:#d9d9d9;stroke-width:1"></line>
          </g>

          <!--数据区-->
          <svg x="220" y="0" id="content" width="100%" height="100%">
            <rect x="1200" y="100" height="40" width="40" fill="#666" id="test"></rect>
          </svg>

          <!--模板定义-->
          <defs>
            <svg id="dcTemplate" width="80" height="80" class="item-box">
              <svg x="10" y="5" viewBox="0 0 1024 1024" width="60" height="60"><rect x="0" y="0" height="100%" width="100%" fill="transparent"></rect><path d="M693.2 225.1h49.3v-49.3h-49.3v49.3z m-459.9 32.8h16.4v-115h-16.4v115z m98.5 246.4H134.7v16.4h197.1v-16.4zM216.8 800h32.9v-32.9h-32.9V800zM726 504.3h-32.9v16.4H726v-16.4z m0 262.8h-32.9V800H726v-32.9zM857.4 455v-98.6H559c-4.9-14-16-25.1-30-30v-19.2h312V93.7H184v213.5h312.1v19.2c-14 4.9-25.1 16-30 30H216.8V455H85.4v394.2h295.7V455H249.7v-65.7H466c4.9 14 16 25.1 30 30V455h-82.1v394.2H611V455h-82.1v-35.7c14-4.9 25.1-16 30-30h134.2V455h-49.3v394.2h131.4V455H726v-65.7h98.6V455h-16.4v394.2h131.4V455h-82.2z m-509.2 32.9v328.5h-230V487.9h230zM216.8 274.3V126.5h591.3v147.8H216.8z m361.4 213.6v328.5H446.8V487.9h131.4z m-65.7-98.6c-9.1 0-16.4-7.4-16.4-16.4 0-9.1 7.4-16.4 16.4-16.4s16.4 7.4 16.4 16.4c0 9.1-7.3 16.4-16.4 16.4z m230 98.6v328.5h-65.7V487.9h65.7z m164.2 328.5H841V487.9h65.7v328.5z m-16.4-49.3h-32.9V800h32.9v-32.9z m0-262.8h-32.9v16.4h32.9v-16.4z m-328.5 0h-98.6v16.4h98.6v-16.4zM496.1 800H529v-32.9h-32.9V800z" fill="#1782bb"></path></svg>
            </svg>
            <svg id="cabTemplate" width="80" height="80" class="item-box">
              <svg x="10" y="5" viewBox="0 0 1024 1024" width="60" height="60"><rect x="0" y="0" height="100%" width="100%" fill="transparent"></rect><path d="M640 896h192V469.376h42.666667V896.213333c0 23.466667-19.029333 42.474667-42.666667 42.474667H597.333333V725.333333h-170.666666v213.333334H192c-23.573333 0-42.666667-18.986667-42.666667-42.453334V469.354667h42.666667V896h192V682.666667h256v213.333333z" fill="#1782bb"></path><path d="M100.032 506.133333a21.333333 21.333333 0 1 1-29.397333-30.933333L466.282667 99.349333a66.688 66.688 0 0 1 91.434666 0L953.386667 475.2a21.333333 21.333333 0 1 1-29.397334 30.933333L528.341333 130.282667a24.021333 24.021333 0 0 0-32.682666 0L100.053333 506.133333zM832 192h-128a21.333333 21.333333 0 0 1 0-42.666667h149.333333a21.333333 21.333333 0 0 1 21.333334 21.333334v149.333333a21.333333 21.333333 0 0 1-42.666667 0V192z" fill="#1782bb"></path></svg>
            </svg>
            <svg id="deviceTemplate" width="80" height="80" class="item-box">
              <svg x="10" y="5" viewBox="0 0 1024 1024" width="60" height="60"><rect x="0" y="0" height="100%" width="100%" fill="transparent"></rect><path d="M447.5 960.3l-321-110v-642l321 82z" fill="#37BBEF"></path><path d="M447.5 960.3l450-240v-600l-450 170z" fill="#2481BA"></path><path d="M126.5 208.3l321 82 450-170-344.4-56.6z" fill="#3ED6FF"></path><path d="M400.3 348.9v80l-239-60v-80l239 60z m-239 48.3l239 60v-10l-239-60v10z m0 23l239 60v-10l-239-60v10z m0 23l239 60v-10l-239-60v10z" fill="#D4F7FF"></path><path d="M175.7 308.4v34l210.2 53v-34zM175.7 363.4l210.2 53v-13.3l-210.2-53z" fill="#113B42"></path><path d="M447.5 894.1v-5.2l-174.4-55.3-1.2 4.8zM271.9 809.3L447.5 864v-5.3l-174.4-54.3zM271.9 780.1l175.6 53.7v-5.2l-174.4-53.4zM447.5 707.9l-174.4-49.3-1.2 4.8 175.6 49.7zM271.9 692.6l175.6 50.7v-5.2l-174.4-50.4zM271.9 750.9l175.6 52.7v-5.2l-174.4-52.3zM271.9 721.8l175.6 51.7v-5.3l-174.4-51.3z" fill="#0071BC"></path><path d="M379.5 540.8c-9.4-3.4-17 1.6-17 11.2s7.6 20.1 17 23.2 17-1.9 17-11.2-7.6-19.8-17-23.2zM379.5 603.6c-3.9-1.2-7 1-7 4.9s3.1 8.1 7 9.3 7-1 7-4.9c0-3.9-3.1-8-7-9.3z" fill="#FFFFFF"></path></svg>
              <!--<circle v-for="(point, index) in menuItemConnectionPoint" :key="index" r="3" :cx="point.x" :cy="point.y" class="connection-point"></circle>-->
            </svg>
          </defs>
          <!--滤镜-->
          <filter id="menuItemHover">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
            <feOffset dx="1" dy="1"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </svg>
      </div>
    </left-menu>
  </div>
</template>

<script>
  var vm;
  import * as d3 from "d3";
  export default {
    name: "test",
    data() {
      vm = this;
      return {
        dcData: [{id: 1, x: 400, y: 100, name: "Astana"}, {id: 2, x: 900, y: 100, name: "Almaty"}],
        cabData: [{id: 1, x: 250, y: 220, name: "电信"}, {id: 2, x: 550, y: 220, name: "联通"},{id: 3, x: 900, y: 220, name: "铁通"}],
        deviceData: [{id: 1, x: 90, y: 380, name: "device1"}, {id: 2, x: 170, y: 380, name: "device2"},{id: 3, x: 250, y: 380, name: "device3"},{id: 4, x: 330, y: 380, name: "device4"},{id: 5, x: 410, y: 380, name: "device5"},{id: 6, x: 860, y: 380, name: "device6"},{id: 7, x: 940, y: 380, name: "device7"},{id: 8, x: 550, y: 380, name: "device8"}],
        relationData: [{startType: "dc", startId: 1, endType: "cab", endId: 2, type: "solid", text: "飞过来"}],

        /*svg数值*/
        leftMargin: 200,
        menuLeftMargin: 220,
        topMargin: 50,
        dcTemplate: {width: 80, height: 60},
        cabTemplate: {width: 80, height: 60},
        deviceTemplate: {width: 80, height: 60},
        connectionPointIncreasedWidth: 18,
        connectionPointIncreasedHeight: 8,
        itemNameMarginTop: 12,
        menuItemConnectionPoint: [{x: 4, y: 4}, {x: "50%", y: 4}, {x: 76, y: 4}, {x: 4, y: "50%"}, {x: 76, y: "50%"}, {x: 4, y: 76}, {x: "50%", y: 76}, {x: 76, y: 76}, {x: "50%", y: "50%"}]
      }
    },
    watch: {
      "dcData.length": {
        handler(n, o) {
          this.updateData(n > o ? "increase" : "decrease", "dc");
        }
      },
      "cabData.length": {
        handler(n, o) {
          this.updateData(n > o ? "increase" : "decrease", "cab");
        }
      },
      "deviceData.length": {
        handler(n, o) {
          this.updateData(n > o ? "increase" : "decrease", "device");
        }
      }
    },
    methods: {
      init() {
        this.initData();
        this.menuItemEvent();
        this.menuLineEvent();
        d3.select("#test").on("click", function() {
          vm.dcData.push({id: 3, x: 1000, y: 100, name: "Astana"});
        });
      },

      /*初始化数据*/
      initData() {
        this.updateData("increase", "dc");
        this.updateData("increase", "cab");
        this.updateData("increase", "device");
      },
      updateData(op, type) {
        let data = eval("vm." + type + "Data");
        let template = eval("vm." + type + "Template");
        let items = d3.select("#content").selectAll("." + type).data(data);
        let itemNames = d3.select("#content").selectAll("." + type + "-name").data(data);
        if (op == "increase") {
          let group = items.enter().append("g").attr("class", type);
          group.append("use").attr("x", d => d.x).attr("y", d => d.y).attr("xlink:href", "#" + type + "Template").attr("class", type + "-item");
          group.append("text").text(d => d.name).attr("x", d => d.x+template.width/2).attr("y", d => d.y+template.height+vm.itemNameMarginTop).attr("class", "item-name " + type + "-name");
        } else if (op == "decrease") {
          items.exit().remove();
          itemNames.exit().remove();
        }
      },
      /*左侧菜单事件*/
      menuItemEvent() {
        let vm = this;
        let selectors = [".dc-temp", ".cab-temp", ".device-temp"]; //左侧菜单列表
        openListener(); //开启菜单点击监听

        function openListener() {
          selectors.forEach(selector => {
            menuStartListener(selector);
          });
        }
        function closeListener() {
          selectors.forEach(selector => {
            d3.select(selector).on("click", null);
          });
        }
        function place(selector) { //放置
          if (selector.indexOf("dc") > -1) {
            vm.dcData.push({x: d3.event.x-vm.leftMargin-vm.menuLeftMargin-d3.select(selector).attr("width")/2, y: d3.event.y-vm.topMargin-d3.select(selector).attr("height")/2, name: "newDc"});
          } else if (selector.indexOf("cab") > -1) {
            vm.cabData.push({x: d3.event.x-vm.leftMargin-vm.menuLeftMargin-d3.select(selector).attr("width")/2, y: d3.event.y-vm.topMargin-d3.select(selector).attr("height")/2, name: "newCabinet"});
          } else if (selector.indexOf("device") > -1) {
            vm.deviceData.push({x: d3.event.x-vm.leftMargin-vm.menuLeftMargin-d3.select(selector).attr("width")/2, y: d3.event.y-vm.topMargin-d3.select(selector).attr("height")/2, name: "newDevice"});
          }
        }
        function menuStartListener(selector) {
          let initX = d3.select(selector).attr("x");
          let initY = d3.select(selector).attr("y");
          d3.select(selector).on("click", function() {
            closeListener(); //某个菜单项触发后，暂时关闭菜单点击监听
            menuMoveListener(selector); //让被触发的菜单项跟随鼠标移动
            menuEndListener(selector, initX, initY); //再次点击时放置
          });
        }
        function menuMoveListener(selector) {
          d3.select("#canvas").on("mousemove", function() {
            d3.select(selector).attr("x", d3.event.x-vm.leftMargin-d3.select(selector).attr("width")/2+vm.connectionPointIncreasedWidth/2).attr("y", d3.event.y-vm.topMargin-d3.select(selector).attr("height")/2+vm.connectionPointIncreasedHeight/2);
          });
        }
        function menuEndListener(selector, initX, initY) {
          setTimeout(() => {
            d3.select("#canvas").on("click", function() {
              d3.select(selector).attr("x", initX).attr("y", initY); //临时图标归位
              place(selector); //放置
              d3.select("#canvas").on("mousemove", null);
              d3.select("#canvas").on("click", null);
              openListener(); //放置后重新打开菜单点击监听
            });
          }, 10);
        }
      },
      menuLineEvent() {
        d3.selectAll(".straight-line").on("click", function() {

        });
      }
    },
    mounted() {
      this.init();
    }
  }
</script>
<style lang="scss">
.topo {
  .menu-item-box {
    fill: transparent;
  }
  .menu-item-box:hover {
    fill: white;
    filter: url(#menuItemHover);
  }
  .temp:hover {
    cursor: pointer;
  }
  .item-name {
    font-size: 13px;
    text-anchor: middle;
    fill: #333;
  }
  .line-shape {
    stroke: #333;
    stroke-width: 1;
  }
  .connection-point {
    stroke: transparent;
    stroke-width: 0;
    fill: transparent;
  }
  .connection-point.connection-point-hover {
    stroke: #aaa;
    stroke-width: 1;
    fill: transparent;
  }
}
</style>
