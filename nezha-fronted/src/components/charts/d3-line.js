import * as d3 from "d3";
import './d3-line.scss'
import {randomcolor} from "../common/js/radomcolor/randomcolor";

export function D3LineChart(selector,option){
  return {
    selector:selector, //选择器
    width:option.width,
    height:option.height,
    timeFormat:option.timeFormat?option.timeFormat:'%Y-%m-%d',
    _timeFormat:null,
    datas:option.datas,
    legends:option.legends,
    title:option.title?option.title:'',
    subTitle:option.subTitle?option.subTitle:'',
    colors:option.colors,
    padding:option.padding?option.padding:{top:40,left:40,bottom:40,right:20},
    duration:option.duration?option.duration:800,
    _head_height:0,
    _foot_height:0,
    currentLineNum:0,
    showXAxisTick:option.showXAxisTick?option.showXAxisTick:false,
    showYAxisTick:option.showYAxisTick?option.showYAxisTick:false,
    tooltipFormatter:option.tooltipFormatter,

    init:function(){
      //定义画布
      this.svg=d3.select(this.selector)
        .append('svg')
        .attr('width',this.width)
        .attr('height',this.height)
        .on('mousemove', drawTooltip)
        .on('mouseout', removeTooltip);

      this.initOption();
      this.constomAction();

      this.drawTitle();
      this.creatScale();
      this.createDefs();
      this.createXInnerBar();
      this.createYInnderBar();
      this.createXAxis();
      this.createYAxis();

      // this.createLegends();
      this.drawLines();

      this.createZoom()

      let $self=this;
      let oldToolVal=null;
      function removeTooltip() {
        if ($self.tooltip) $self.tooltip.style('display', 'none');
        if ($self.tooltipLine) $self.tooltipLine.attr('stroke', 'none');
      }
      function drawTipLine(time){
        if ($self.currentTransform)
          $self.tooltipLine
            .attr('stroke', 'black')
            .attr("clip-path", "url(#clip)")
            .attr('x1', $self.currentTransform.applyX($self.xScale(time)))
            .attr('x2', $self.currentTransform.applyX($self.xScale(time)))
            .attr('y1', $self._head_height)
            .attr('y2', $self.height - $self._foot_height);
        else

          $self.tooltipLine
            .attr('stroke', 'black')
            .attr("clip-path", "url(#clip)")
            .attr('x1', $self.xScale(time))
            .attr('x2', $self.xScale(time))
            .attr('y1', $self._head_height)
            .attr('y2', $self.height - $self._foot_height);
      }
      function drawTooltip(){
        var x=d3.mouse($self.svg.node())[0];
        if(x<$self.padding.left||x>$self.width-$self.padding.right){
          return false;
        }
        if ($self.currentTransform)
          var time = $self.currentTransform.rescaleX($self.xScale).invert(d3.mouse($self.svg.node())[0]);
        else
          var time = $self.xScale.invert(d3.mouse($self.svg.node())[0]);

        // drawTipLine(time)

        $self.tooltip.html(d3.timeFormat('%Y-%m-%d %H:%M:%S')(time))
          .style('display', 'block')
          .style('left', d3.event.pageX + 20 + 'px')
          .style('top', d3.event.pageY - 20 + 'px')
          .selectAll()
          .data($self.datas).enter()
          .append('div')
          .html(function(d, i,g) {
            let toolVal=d[0];
            let min=Math.abs(+toolVal[0] - +time )
            d.forEach(item=>{
              let temp=Math.abs(+item[0] - +time)
              if(temp - min < 0){
                min=temp;
                toolVal=item;
              }
            })
            if(toolVal){
              oldToolVal=toolVal;
              let legend=$self.legends[i];
              if(!legend.isGray){
                return `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">
                            <div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${$self.colors[i]};}'></span>${legend.alias?legend.alias:legend.name}:  </div>
                            <div style="padding-left: 10px;">${toolVal[1]}</div>
                         </div>`
              }
            }
          });
      }
    },
    initOption:function(){
      this._timeFormat=d3.timeFormat(this.timeFormat)
      this._head_height=this.padding.top
      this._foot_height=this.padding.bottom
      this.currentLineNum=this.datas.length;
      this.tooltip = d3.select('body')
                        .append('div')
                        .attr('style',"position: absolute; background-color: rgba(221,228,237,1);border-color:rgba(221,228,237,1); padding: 5px; display: none; left: 983px; top: 89px;")
      this.tooltipLine = this.svg.append('line');

      this.minMax=getMinMax(this.datas);

      if(this.padding.left < computeDistance(this.minMax.max+'')){
        this.padding.left = computeDistance(this.minMax.max+'')
      }

      if(!this.colors || this.colors.length<this.currentLineNum){
        this.colors=[];
        for(let i=0;i<this.currentLineNum;i++){
          this.colors.push(randomcolor())
        }
      }
    },
    constomAction:function(){
      // this.dispatch=d3.dispatch('line-show','line-hide','line-toggle')
    },
    drawTitle:function(){
      //添加标题
      if (this.title != "") {
        this.svg.append("g")
          .append("text")
          .text(this.title)
          .attr("class", "title")
          .attr("x", this.width / 2)
          .attr("y", this._head_height);
        this._head_height += 30;
      }
      //添加副标题
      if (this.subTitle != "") {
        this.svg.append("g")
          .append("text")
          .text(this.subTitle)
          .attr("class", "subTitle")
          .attr("x", this.width / 2)
          .attr("y", this._head_height);

        this._head_height += 20;
      }
    },
    creatScale:function(){
      let minMax=this.minMax
      let t_max_min = d3.extent(this.datas[0], function(d) {
        return d[0];
      });
      this.xTicks = Math.min(this.datas[0].length,10)

      //横坐标轴比例尺
      this.xScale = d3.scaleTime()
        .domain(t_max_min)
        .range([this.padding.left, this.width - this.padding.right]);

      //纵坐标轴比例尺
      this.yScale = d3.scaleLinear()
        .domain([minMax.min, Math.round(minMax.max*1.05)])
        .range([this.height - this._foot_height, this._head_height]);

    },
    createZoom:function(){
      let $self=this;
      this.zoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([
          [this.padding.top, 0],
          [this.width - this.padding.right, this.height]
        ])
        .extent([
          [this.padding.top, 0],
          [this.width - this.padding.right, this.height]
        ])
        .on("zoom", zoomed);
      this.svg.call(this.zoom);

      function zoomed() {
        let t = d3.event.transform;
        $self.currentTransform=t;
        let xt = t.rescaleX($self.xScale);
        $self.svg.select('.bottom_axis').call($self.xAxis.scale(xt)).selectAll("text")
          .attr("transform", "translate(-10,20) rotate(-20)");

        $self.svg.select('.inner_line_x').call($self.xInner.scale(xt));

        for (var i = 0; i < $self.lines.length; i++) {
          var lineObject = $self.lines[i];

          lineObject.scale(i, 0, t);
        }
      }
    },
    createDefs:function(){ //创建遮罩
      this.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")

        .attr('x', this.padding.left)
        .attr('y', 0)
        .attr("width", this.width - this.padding.left - this.padding.right)
        .attr("height", this.height);
    },
    createXInnerBar:function(){
      var xInner = d3.axisBottom()
        .scale(this.xScale)
        .tickSize(-(this.height - this._head_height - this._foot_height), 0, 0)
        .tickFormat("")
        .ticks(this.xTicks);
      this.xInner=xInner;
      //添加横轴网格线
      var xInnerBar = this.svg.append("g")
        .attr("class", "inner_line inner_line_x")
        .attr("transform", "translate(0," + (this.height - this._foot_height) + ")")
        .call(xInner);
    },
    createYInnderBar:function(){
      //定义纵轴网格线
      var yInner = d3.axisLeft()
        .scale(this.yScale)
        .tickSize(-(this.width - this.padding.left - this.padding.right), 0, 0)
        .tickFormat("")
        .ticks(10);
      this.yInner=yInner
      //添加纵轴网格线
      var yInnerBar = this.svg.append("g")
        .attr("class", "inner_line inner_line_y")
        .attr("transform", "translate(" + this.padding.left + ",0)")
        .call(yInner);
    },
    createXAxis:function(){
      let $self=this;
      //定义横轴
      var xAxis = d3.axisBottom()
        .scale(this.xScale)
        .ticks(this.xTicks)
        .tickFormat($self._timeFormat)
      this.xAxis=xAxis
      //添加横坐标轴
      var xBar = this.svg.append("g")
        .attr("class", "bottom_axis")
        .attr("transform", "translate(0," + (this.height - this._foot_height) + ")")
        .call(xAxis).selectAll("text")
        .attr("transform", "translate(-10,8) rotate(-20)")

      if(!this.showXAxisTick){
        let xAxis=this.svg.select('.bottom_axis')
        xAxis.select('.domain').remove();
        xAxis.selectAll('.tick').select('line').remove()
      }
    },
    createYAxis:function(){
      //定义纵轴
      var yAxis = d3.axisLeft()
        .scale(this.yScale)
      this.yAxis=yAxis;
      //添加纵轴
      var yBar = this.svg.append("g")
        .attr("class", "left_axis")
        .attr("transform", "translate(" + this.padding.left + ",0)")
        .call(yAxis);
      if(!this.showYAxisTick){
        let yAxis=this.svg.select('.left_axis')
        yAxis.select('.domain').remove();
        yAxis.selectAll('.tick').select('line').remove()
      }
    },
    createLegends:function(){
      let $self=this;
      let legend = d3.select('#legendArea').attr('class','legend')
      var textGroup = legend.selectAll("div")
        .data(this.legends);

      textGroup.exit().remove();

      let legendItem=legend.selectAll("div")
        .data(this.legends)
        .enter()
        .append("div")
        .attr("class", "legend-item")

      legendItem.append('span')
        .attr('class','legend-shape')
        .style('background',function(d,i){
          return $self.colors[i]
        })

      legendItem.append('span')
        .text(function(d,i){
          return d.name
        })


      /*var rectGroup = legend.selectAll("rect")
        .data(this.legends);

      rectGroup.exit().remove();

      legend.selectAll("rect")
        .data(this.legends)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return i * 100 - 20;
        })
        .attr("y", -10)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", function(d, i) {
          return $self.colors[i];
        });*/

      // legend.attr("transform", "translate(" + ((this.width - this.legends.length * 100) / 2) + "," + (this.height - 10) + ")");
    },
    drawLines:function(){
      this.lines=[];

      for (var i = 0; i < this.currentLineNum; i++) {
        var newLine = new CrystalLineObject(this);
        newLine.init(i);
        this.lines.push(newLine);
      }
    },
    dispatchAction(type,param){
      d3.selectAll('path[class="chart-line"]').dispatch(type,{detail:{name:param}})
    },
    drawChart() {
      var _duration = 1000;

      // this.svg.transition().duration(_duration).call(this.zoom.transform, d3.zoomIdentity);

      var t_max_min = d3.extent(this.datas[0], function(d) {
        return d[0];
      });

      var xTicks = Math.min(this.datas[0].length, 10)

      //设置线条动画起始位置
      var lineObject ;

      for (var i = 0; i < this.datas.length; i++) {
        if (i < this.currentLineNum) {
          //对已有的线条做动画
          lineObject = this.lines[i];
          lineObject.movieBegin(i);
        } else {
          //如果现有线条不够，就加上一些
          var newLine = new CrystalLineObject(this);
          newLine.init(i);
          this.lines.push(newLine);
        }
      }

      //删除多余的线条，如果有的话
      if (this.datas.length < this.currentLineNum) {
        for (var i = this.datas.length; i < this.currentLineNum; i++) {
          lineObject = this.lines[i];
          lineObject.remove();
        }
        this.lines.splice(this.datas.length, this.currentLineNum - this.datas.length);
      }

      var maxdata = getMaxdata(this.datas);
      var newLength = this.datas[0].length;

      this.zoom.scaleExtent([1, 20]);
      this.svg.call(this.zoom);

      //横轴数据动画
      this.xScale.domain(d3.extent(this.datas[0], function(d) {
        return d[0];
      }));
      this.xAxis.scale(this.xScale).ticks(xTicks).tickFormat(this.timeFormat);
      this.svg.select('.bottom_axis').transition().duration(_duration).call(this.xAxis).selectAll("text")
        .attr("transform", "translate(-10,20) rotate(-20)");

      this.xBar.selectAll("text").text(function(d) {
        return this.xMarks[d];
      });
      this.xInner.scale(this.xScale).ticks(newLength);
      this.xInnerBar.transition().duration(_duration).call(this.xInner);

      //纵轴数据动画
      this.yScale.domain([0, maxdata]);
      this.yBar.transition().duration(_duration).call(this.yAxis);
      this.yInnerBar.transition().duration(_duration).call(this.yInner);

      //开始线条动画
      for (var i = 0; i < lines.length; i++) {
        lineObject = this.lines[i];
        lineObject.reDraw(i, _duration);
      }

      this.currentLineNum = this.datas.length;
      this.dataLength = newLength;
    }
  }
}
//取得多维数组最大值
function getMaxdata(arr) {
  var maxdata = 0;
  for (var i = 0; i < arr.length; i++) {
    maxdata = d3.max([maxdata, d3.max(arr[i], function(d) {
      return d[1];
    })]);
  }
  return maxdata;
}

function getMinMax(arr){
  let min=0,max=0;
  for(let i =0;i<arr.length;i++){
    max=d3.max([max,d3.max(arr[i],d=>{return d[1]})])
    min=d3.min([min,d3.min(arr[i],d=>{return d[1]})])
  }
  return{min:min,max:max}
}
function computeDistance(str){
  var width = 0;
  var html = document.createElement('span');
  html.innerText = str;
  html.className = 'getTextWidth';
  document.querySelector('body').appendChild(html);
  width = document.querySelector('.getTextWidth').offsetWidth;
  document.querySelector('.getTextWidth').remove();
  return Number((width+5));
}

function CrystalLineObject(chart) {
  this.group = null;
  this.path = null;
  this.oldData = [];
  let dataset=chart.datas;
  let svg=chart.svg;
  let xScale=chart.xScale;
  let yScale=chart.yScale;
  let lineColor=chart.colors;
  const dispatch=chart.dispatch;

  this.init = function(id) {
    var arr = dataset[id];
    let legend=chart.legends[id];
    this.group = svg.append("g");
    let $self=this;
    var line = d3.line()
      .x(function(d, i) {
        return xScale(d[0]);
      })
      .y(function(d) {
        return yScale(d[1]);
      })
      .curve(d3.curveCatmullRom.alpha(0.3)); //折线曲度

    //添加折线
    this.path = this.group.append("path")
      .attr("d", line(arr))
      .attr('class','chart-line')
      .style("fill", "none")
      .style("stroke-width", 1)
      .attr("clip-path", "url(#clip)")
      .style("stroke", lineColor[id])
      .style("stroke-opacity", 0.9)
      .on('line-single-show',function(d,i,group){
        let event=d3.event;
        let name=event.detail?event.detail.name:""
        if(legend.name != name){
          $self.group
            .transition()
            .duration(chart.duration)
            .style('opacity','0')
          legend.isGray=true;
        }else{
          $self.group.transition()
            .duration(chart.duration).style('opacity','1')
          legend.isGray=false;
        }
      })
      .on('line-all-show',function(){
        $self.group.transition()
          .duration(chart.duration).style('opacity','1')
        chart.legends.forEach(item=>{
          item.isGray=false;
        })
      })

    //添加系列的小圆点
   /* this.group.selectAll("circle")
      .data(arr)
      .enter()
      .append("circle")
      .attr("clip-path", "url(#clip)")
      .attr("cx", function(d, i) {
        return xScale(d[0]);
      })
      .attr("cy", function(d) {
        return yScale(d[1]);
      })
      .attr("r", 5)
      .attr("fill", lineColor[id]);*/
    this.oldData = arr;
  };

  this.scale = function(id, _duration, transform) {
    var arr = dataset[id];

    var line = d3.line()
      .x(function(d, i) {

        return transform.applyX(xScale(d[0]))
      })
      .y(function(d) {
        return yScale(d[1]);
      })

    //添加折线
    this.group.select("path")
      .attr("d", line(arr))
      .style("fill", "none")
      .style("stroke-width", 1)
      .style("stroke", lineColor[id])
      .style("stroke-opacity", 0.9);

    this.group.selectAll("circle")
      .attr("cx", function(d, i) {
        return transform.applyX(xScale(d[0]));
      })
      .attr("cy", function(d) {
        return yScale(d[1]);
      })

  }

  //动画初始化方法
  this.movieBegin = function(id) {
    var arr = dataset[id];
    //补足/删除路径
    var olddata = this.oldData;
    var line = d3.line()
      .x(function(d, i) {
        if (i >= olddata.length) return chart.width - chart.padding.left;
        else return xScale(d[0]);
      })
      .y(function(d, i) {
        if (i >= olddata.length) return chart.height - chart._foot_height;
        else return yScale(olddata[i].value);
      });

    //路径初始化
    this.path.attr("d", line(arr));

    //截断旧数据
    var tempData = olddata.slice(0, arr.length);
    /*var circle = this.group.selectAll("circle").data(tempData);

    //删除多余的圆点
    circle.exit().remove();*/

    //圆点初始化，添加圆点,多出来的到右侧底部
    /*this.group.selectAll("circle")
      .data(arr)
      .enter()
      .append("circle")
      .attr("cx", function(d, i) {
        if (i >= olddata.length) return chart.width - chart.padding;
        else return xScale(d[0]);
      })
      .attr("cy", function(d, i) {
        if (i >= olddata.length) return chart.height - chart._foot_height;
        else return yScale(d[1]);
      })
      .attr("r", 5)
      .attr("fill", lineColor[id]);*/

    this.oldData = arr;
  };

  //重绘加动画效果
  this.reDraw = function(id, _duration) {
    var arr = dataset[id];
    var line = d3.line()
      .x(function(d, i) {
        return xScale(d[0]);
      })
      .y(function(d) {
        return yScale(d[1]);
      });

    //路径动画
    this.path.transition().duration(_duration).attr("d", line(arr));

    //圆点动画
   /* this.group.selectAll("circle")
      .transition()
      .duration(_duration)
      .attr("cx", function(d, i) {
        return xScale(d[0]);
      })
      .attr("cy", function(d) {
        return yScale(d[1]);
      })*/
  };

  //从画布删除折线
  this.remove = function() {
    this.group.remove();
  };

}
