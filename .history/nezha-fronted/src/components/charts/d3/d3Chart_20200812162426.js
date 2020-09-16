import * as d3 from "d3";
import './d3Chart.scss'
import {randomcolor} from "../../common/js/radomcolor/randomcolor";
import i18n from "../../common/i18n";
import chartDataFormat from "../chartDataFormat";
import {Bar, CHART_TYPE} from "./d3Util";
import {Line} from "./d3Util";
import {tooltipFormatter} from "./d3Util";
import {getUUID} from "../../common/js/common";

export function D3LineChart(selector,option){
  return {
    options:{
      selector:selector, //选择器
      type:option.type,
      toolbox:{
        show:true,
        width:100,
        height:25,
        stack:{
          title:i18n.t('overall.toolBox.stack'),
          backTitle:i18n.t('overall.toolBox.stackBack'),
          show:true,
        }
      },
      width:option.width,
      height:option.height,
      timeFormat:option.timeFormat?option.timeFormat:'%Y-%m-%d',
      datas:option.datas,
      legends:option.legends,
      title:option.title?option.title:'',
      subTitle:option.subTitle?option.subTitle:'',
      colors:option.colors,
      padding:option.padding?option.padding:{top:40,left:40,bottom:40,right:20},
      duration:option.duration?option.duration:800,
      showXAxisTick:option.showXAxisTick?option.showXAxisTick:false,
      showYAxisTick:option.showYAxisTick?option.showYAxisTick:false,
      tooltipFormatter:option.tooltipFormatter,
      unit:option.dataFormatter?option.dataFormatter:9,
    },


    init:function(){
      //定义画布
      if(option){
        this.initOption();
      }
      this.dealData();
      this.drawChart();
    },
    createSvg:function(){
      let $self=this;
      this.svg=d3.select(this.options.selector)
        .append('svg')
        .attr('width',this.options.width)
        .attr('height',this.options.height)
        .on('mouseover',function(){
          if ($self.tooltip) $self.tooltip.style('display', null);
          if ($self.tooltipLine) $self.tooltipLine.attr('stroke', 'orange');
          $self.svg.style('cursor','crosshair')
        })
        .on('mouseout', removeTooltip);

      function removeTooltip() {
        if ($self.tooltip) $self.tooltip.style('display', 'none');
        if ($self.tooltipLine) $self.tooltipLine.attr('stroke', 'none');
      }
    },
    drawChart(){
      this.createSvg();

      this.drawTitle();

      this.createDefs()

      this.creatScale();
      // if(this.type!==CHART_TYPE.BAR&&this.type!==CHART_TYPE.STACK_BAR){
      this.createXInnerBar();
      // }

      this.createYInnderBar();
      this.createXAxis();
      this.createYAxis();

      // this.createLegends();
      if(this._type!==CHART_TYPE.BAR && this._type!==CHART_TYPE.STACK_BAR){
        this.drawLines();
      }else{
        this.drawBars();
      }

      this.createZoom()

      this.drawToolbox();

      this.drawTooltipContainor()

    },
    initOption:function(){
      let $self=this;
      if(this.options.type){
        this._type=this.options.type
      }else{
        this._type =CHART_TYPE.LINE
      }

      this._timeFormat=d3.timeFormat(this.options.timeFormat)
      this._head_height=this.options.padding.top
      this._foot_height=this.options.padding.bottom
      this.currentLineNum=this.options.datas.length;
      this._dataFormatter=chartDataFormat.getUnit(this.options.unit).compute;

      if(this.options.toolbox){
        this.options.toolbox=this.options.toolbox;
      }

      if(!this.options.colors || this.options.colors.length<this.currentLineNum){
        this.colors=[];
        for(let i=0;i<this.currentLineNum;i++){
          this.colors.push(randomcolor())
        }
      }else{
        this.colors=this.options.colors;
      }
    },
    dealData:function(){
      this.datas=JSON.parse(JSON.stringify(this.options.datas))
      if(this._type == CHART_TYPE.STACK_AREA){

        this._stackSourceData=JSON.parse(JSON.stringify(this.datas));//保存转换之前的数据

        this.datas.forEach((d,i)=>{
          if(i!=0){
            let stackData=this.datas[i-1];
            d.forEach((t,j)=>{
              let pre=stackData[j]

              t[1]=t[1]+pre[1]
            })
          }
        })
      }

      if(this._type == CHART_TYPE.BAR ||this._type == CHART_TYPE.STACK_BAR){
        this._pastSourceData=JSON.parse(JSON.stringify(this.datas));
        this.datas=[];
        for(let i=0;i<this._pastSourceData[0].length;i++){
          let data=this._pastSourceData.map(item=>{
            return item[i]
          })
          this.datas.push(data)
        }
      }

      if(this._type == CHART_TYPE.STACK_BAR){
        this._stackSourceData=JSON.parse(JSON.stringify(this.datas));//保存转换之前的数据
        this.datas.forEach(data=>{
          data.map((item,i)=>{
            if(i != 0){
              let before=data[i-1]
              item[1]+=before[1];
            }
            return item;
          })
        })
      }
      /*if(this.type == CHART_TYPE.BAR||this.type == CHART_TYPE.STACK_BAR){
        this.minMax=getBarDataMinMax(this.datas)
      }else{

      }*/
      this.minMax=getMinMax(this.datas);
      if(this.options.padding.left < computeDistance(this._dataFormatter(this.minMax.max,null,-1,3)+'')){
        this.options.padding.left = computeDistance(this._dataFormatter(this.minMax.max,null,-1,3)+'')
      }
    },
    drawTitle:function(){
      //添加标题
      if (this.options.title != "") {
        this.svg.append("g")
          .append("text")
          .text(this.options.title)
          .attr("class", "title")
          .attr("x", this.options.width / 2)
          .attr("y", this._head_height);
        this._head_height += 30;
      }
      //添加副标题
      if (this.options.subTitle != "") {
        this.svg.append("g")
          .append("text")
          .text(this.options.subTitle)
          .attr("class", "subTitle")
          .attr("x", this.options.width / 2)
          .attr("y", this._head_height);

        this._head_height += 20;
      }
    },
    drawTooltipContainor:function(){
      this.tooltip = d3.select('body')
        .append('div')
        .attr('id',this.options.selector+'-'+'tooltip')
        .attr('style',"position: absolute;z-index:9999; background-color: rgba(221,228,237,1);border-color:rgba(221,228,237,1); padding: 5px; display: none; left: 983px; top: 89px;")
      this.tooltipLine = this.svg.append('line');
      this.dotBox = this.svg.append('g')
      /* .selectAll()
       .data(this.datas)
       .enter()
       .append('circle')
       .attr("cx", 0)
       .attr("cy", 0)
       .attr("r", 3)
       .attr("fill", function(d,i){
         return $self.colors[i]
       })
       .transaction()*/
    },
    creatScale:function(){
      let t_max_min = d3.extent(this.datas[0], function(d) {
        return d[0];
      });
      if(t_max_min[1]-t_max_min[0]>7*24*60*60*1000){ //时间大于7天不显示小时分钟
        this._timeFormat=d3.timeFormat('%Y-%m-%d')
      }else if(t_max_min[1]-t_max_min[0]>24*60*60*1000){//时间大于一天小于7天，不显示秒
        this._timeFormat=d3.timeFormat('%m-%d %H:%M')
      }
      this.xTicks = Math.min(this.datas[0].length,10)

      //横坐标轴比例尺
      this.xScale = d3.scaleTime()
        .domain(t_max_min)
        .range([this.options.padding.left, this.options.width - this.options.padding.right]);

      if(this._type == CHART_TYPE.BAR||this._type == CHART_TYPE.STACK_BAR){

        t_max_min = d3.extent(this._pastSourceData[0], function(d) {
          return d[0];
        });

        //辅助比例尺 用于确定鼠标当前对应的x轴位置
        this._assistScale = d3.scaleTime()
          .domain(t_max_min)
          .range([this.options.padding.left, this.options.width - this.options.padding.right]);

        //数据量过大时，渲染出的元素width会为0，导致无法显示
        // let interval=Number.parseInt(this.datas.length/Number.parseInt((this.options.width-this.options.padding.left-this.options.padding.right)/37+''))
        let domain=this.datas.map(item=>{return item[0][0]});

        //以每一个小rect宽度为0.1计算,一条数据对应0.1*this.datas[0].length
        let svgWidth=this.svg.node().clientWidth;
        let parentRectWidth=0.1*this.datas[0].length;

        let rectNum=Number.parseInt(svgWidth/parentRectWidth);

        console.log('rect ')


        // if(this.datas.length/interval>1){
        //   domain=domain.filter((item,index)=>{return index%interval==0})
        // }
        this._barXAxisDomain=domain;
        this.xScale=d3.scaleBand()
          .domain(domain)
          .range([this.options.padding.left, this.options.width - this.options.padding.right])
          .paddingInner(0.1)

        this.xScale1=d3.scaleBand()
          .domain(d3.range(this.options.legends.length))
          .rangeRound([0,this.xScale.bandwidth()])
      }

      let minMax=this.minMax
      //纵坐标轴比例尺
      this.yScale = d3.scaleLinear()
        .domain([minMax.min, Math.round(minMax.max*1.05)])
        .range([this.options.height - this._foot_height, this._head_height]);

    },
    createZoom:function(){
      let $self=this;
      this.zoom = d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([
          [this.options.padding.top, 0],
          [this.options.width - this.options.padding.right, this.options.height]
        ])
        .extent([
          [this.options.padding.top, 0],
          [this.options.width - this.options.padding.right, this.options.height]
        ])
        .on("zoom", zoomed);
      this.svg.call(this.zoom);

      function zoomed() {
        let t = d3.event.transform;
        $self.currentTransform=t;
        if($self._type != CHART_TYPE.BAR&&$self._type != CHART_TYPE.STACK_BAR){
          let xt = t.rescaleX($self.xScale);
          $self.svg.select('.bottom_axis').call($self.xAxis.scale(xt)).selectAll("text")
            .attr("transform", "translate(-10,10) rotate(-20)");

          if(!$self.options.showXAxisTick){
            let xAxis=$self.svg.select('.bottom_axis')
            xAxis.select('.domain').remove();
            xAxis.selectAll('.tick').select('line').remove()
          }

          $self.svg.select('.inner_line_x').call($self.xInner.scale(xt));

          for (let i = 0; i < $self.lines.length; i++) {
            let lineObject = $self.lines[i];

            lineObject.scale(i, 0, t);
          }
        }else{
          $self.xScale.range([$self.options.padding.left, $self.options.width - $self.options.padding.right].map(d=>d3.event.transform.applyX(d)))
          $self.xScale1.rangeRound([0,$self.xScale.bandwidth()])

          let xt = t.rescaleX($self._assistScale);
          $self.svg.select('.bottom_axis').call($self.xAxis.scale(xt)).selectAll("text")
            .attr("transform", "translate(-10,10) rotate(-20)");

          if(!$self.options.showXAxisTick){
            let xAxis=$self.svg.select('.bottom_axis')
            xAxis.select('.domain').remove();
            xAxis.selectAll('.tick').select('line').remove()
          }
          for (let i = 0; i < $self.bars.length; i++) {
            let barObject = $self.bars[i];

            barObject.scale(i, 0, t);
          }
        }
      }
    },
    createDefs:function(){ //创建遮罩
      this._clipSelector=getUUID()+'-clip';
      this.svg.append("defs").append("clipPath")
        .attr("id", this._clipSelector)
        .append("rect")

        .attr('x', this.options.padding.left)
        .attr('y', 0)
        .attr("width", this.options.width - this.options.padding.left - this.options.padding.right)
        .attr("height", this.options.height);
    },
    createXInnerBar:function(){

      let xInner = d3.axisBottom()
        .scale(this.xScale)
        .tickSize(-(this.options.height - this._head_height - this._foot_height), 0, 0)
        .tickFormat("")
        .ticks(this.xTicks);
      if(this._type == CHART_TYPE.BAR||this._type == CHART_TYPE.STACK_BAR){
        xInner.scale(this._assistScale)
      }
      this.xInner=xInner;
      //添加横轴网格线
      let xInnerBar = this.svg.append("g")
        .attr("class", "inner_line inner_line_x")
        .attr("transform", "translate(0," + (this.options.height - this._foot_height) + ")")
        .call(xInner);
    },
    createYInnderBar:function(){
      //定义纵轴网格线
      let yInner = d3.axisLeft()
        .scale(this.yScale)
        .tickSize(-(this.options.width - this.options.padding.left - this.options.padding.right), 0, 0)
        .tickFormat("")
        .ticks(10);
      this.yInner=yInner
      //添加纵轴网格线
      let yInnerBar = this.svg.append("g")
        .attr("class", "inner_line inner_line_y")
        .attr("transform", "translate(" + this.options.padding.left + ",0)")
        .call(yInner);
    },
    createXAxis:function(){
      let $self=this;
      //定义横轴
      let xAxis = d3.axisBottom()
        .scale(this.xScale)
        .ticks(this.xTicks)
        .tickFormat($self._timeFormat)
      if(this._type == CHART_TYPE.BAR||this._type == CHART_TYPE.STACK_BAR){
        xAxis.scale(this._assistScale)
      }
      this.xAxis=xAxis
      //添加横坐标轴
      let xBar = this.svg.append("g")
        .attr("class", "bottom_axis")
        .attr("transform", "translate(0," + (this.options.height - this._foot_height) + ")")
        .call(xAxis).selectAll("text")
        .attr("transform", "translate(-10,8) rotate(-20)")

      if(!this.options.showXAxisTick){
        let xAxis=this.svg.select('.bottom_axis')
        xAxis.select('.domain').remove();
        xAxis.selectAll('.tick').select('line').remove()
      }
    },
    createYAxis:function(){
      let dataFormatter=this._dataFormatter;
      let $self=this;
      //定义纵轴
      let yAxis = d3.axisLeft()
        .scale(this.yScale)
        .tickFormat(function(d,i,g){
          let yAxisVals=g.map(item=>{
            return item.__data__;
          })
          let dot = 0;
          let yAxisValsCopy=Object.assign([],yAxisVals)
          yAxisVals=yAxisValsCopy.map(item=>{
            return dataFormatter(item,null,-1,dot)
          })
          while(new Set(yAxisVals).size != yAxisVals.length){
            dot++;
            yAxisVals=yAxisValsCopy.map(item => {
              return dataFormatter(item,null,-1,dot)
            })
          }

          return yAxisVals[i];
        })
      this.yAxis=yAxis;
      //添加纵轴
      let yBar = this.svg.append("g")
        .attr("class", "left_axis")
        .attr("transform", "translate(" + this.options.padding.left + ",0)")
        .call(yAxis);

      if(!this.options.showYAxisTick){
        let yAxis=this.svg.select('.left_axis')
        yAxis.select('.domain').remove();
        yAxis.selectAll('.tick').select('line').remove()
      }
    },
    createLegends:function(){
      let $self=this;
      let legend = d3.select('#legendArea').attr('class','legend')
      let textGroup = legend.selectAll("div")
        .data(this.options.legends);

      textGroup.exit().remove();

      let legendItem=legend.selectAll("div")
        .data(this.options.legends)
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


      /*let rectGroup = legend.selectAll("rect")
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
      let $self=this;
      this.svg
        .on('mousemove', lineTooltip)

      let totalColor=randomcolor();
      function lineTooltip(){
        let x=d3.mouse($self.svg.node())[0];
        if(x<$self.options.padding.left||x>$self.options.width-$self.options.padding.right){
          return false;
        }
        if ($self.currentTransform)
          var time = $self.currentTransform.rescaleX($self.xScale).invert(d3.mouse($self.svg.node())[0]);
        else
          var time = $self.xScale.invert(d3.mouse($self.svg.node())[0]);

        drawTipLine(time)
        drawTipDot(time)
        let sum=0;
        let items=[];

        $self.tooltip.html(d3.timeFormat('%Y-%m-%d %H:%M:%S')(time))

        let tooltipDatas=$self._type == CHART_TYPE.STACK_AREA?$self._stackSourceData:$self.datas;

        tooltipDatas.forEach((d,i)=>{
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
            sum+=toolVal[1];
            items.push({legend:$self.options.legends[i],value:$self._dataFormatter(toolVal[1],null,-1,2),color:$self.colors[i]})
          }
        })
        if($self._type == CHART_TYPE.STACK_AREA){
          items.push({legend:{name:i18n.t('dashboard.panel.chartTotal'),isGray:false},value:$self._dataFormatter(sum,null,-1,2),color:totalColor})
        }
        tooltipFormatter($self.tooltip,items)

        let position=getTooltipPosition($self.tooltip);

        $self.tooltip
          .style('left', position.left + 'px')
          .style('top', position.top + 'px')
      }

      function drawTipLine(time){
        if ($self.currentTransform)
          $self.tooltipLine
            .style('stroke-width','1')
            .attr("clip-path", "url(#"+$self._clipSelector+")")
            .attr('x1', $self.currentTransform.applyX($self.xScale(time)))
            .attr('x2', $self.currentTransform.applyX($self.xScale(time)))
            .attr('y1', $self._head_height)
            .attr('y2', $self.options.height - $self._foot_height);
        else
          $self.tooltipLine
            .style('stroke-width','1')
            .attr("clip-path", "url(#"+$self._clipSelector+")")
            .attr('x1', $self.xScale(time))
            .attr('x2', $self.xScale(time))
            .attr('y1', $self._head_height)
            .attr('y2', $self.options.height - $self._foot_height);
      }
      function drawTipDot(time) {
        // if(chart.currentTransform){
        //
        // }else{
        //
        // }
      }

      for (let i = 0; i < this.currentLineNum; i++) {
        let newLine = new Line(this);
        newLine.init(i);
        this.lines.push(newLine);
      }
    },
    drawBars:function(){
      let $self=this;
      this.svg.on('mousemove', barTooltip)
      let totalColor=randomcolor();
      function barTooltip(){
        let x=d3.mouse($self.svg.node())[0];
        if(x<$self.options.padding.left||x>$self.options.width-$self.options.padding.right){
          return false;
        }

        if ($self.currentTransform)
          var time = $self.currentTransform.rescaleX($self._assistScale).invert(d3.mouse($self.svg.node())[0]);
        else
          var time = $self._assistScale.invert(d3.mouse($self.svg.node())[0]);
        // var time = assistScale.invert(d3.mouse($self.svg.node())[0]);

        let min=Math.abs(time-$self._barXAxisDomain[0]);
        let minIndex=0;
        $self._barXAxisDomain.forEach((item,i)=>{
          let temp=Math.min(min,Math.abs(time - item))
          if(min!==temp){
            min=temp;
            minIndex=i;
          }
        })
        let xAisVal=$self._barXAxisDomain[minIndex];
        drawTipLine(xAisVal)
        let tooltipArr=$self._type == CHART_TYPE.BAR?$self.datas:$self._stackSourceData
        let tooltipData=tooltipArr.find(item=>{return item[0][0] == xAisVal})

        $self.tooltip.html(d3.timeFormat('%Y-%m-%d %H:%M:%S')(xAisVal))


        let items=tooltipData.map((item,i)=>{
          return {legend:$self.options.legends[i],value:$self._dataFormatter(item[1],null,-1,2),color:$self.colors[i]}
        })
        if($self._type == CHART_TYPE.STACK_BAR){
          let totalData=d3.sum(tooltipData.map(item=>{return item[1]}))
          items.push({legend:{name:i18n.t('dashboard.panel.chartTotal'),isGray:false},value:$self._dataFormatter(totalData,null,-1,2),color:totalColor})
        }
        tooltipFormatter($self.tooltip,items)

        let position=getTooltipPosition($self.tooltip);

        $self.tooltip
          .style('left', position.left + 'px')
          .style('top', position.top + 'px')
      }
      function drawTipLine(time){
          $self.tooltipLine
            .style('stroke-width','1')
            .attr("clip-path", "url(#"+$self._clipSelector+")")
            .attr('x1', $self.xScale(time)+$self.xScale.bandwidth()/2)
            .attr('x2', $self.xScale(time)+$self.xScale.bandwidth()/2)
            .attr('y1', $self._head_height)
            .attr('y2', $self.options.height - $self._foot_height);
      }
      this.bars=[];
      for(let i=0;i < this.datas.length;i++){
        let newBar=new Bar(this);
        newBar.init(i)
        this.bars.push(newBar)
      }

    },
    reDrawChart:function(type,data){
      let $self=this;
      this.clearChart();
      $self._type=type?type:$self._type;
      this.dealData();
      this.drawChart();

    },
    drawToolbox:function(){
      if(this.options.toolbox.show){
        let $self=this;
        let toolbox=d3.select(this.options.selector).select('.toolbox')
        if(!toolbox.node()){
          toolbox=d3.select(this.options.selector)
            .append('div').attr('class','toolbox')
            .attr('style','position:absolute;top:'+(this._head_height-this.options.toolbox.height)+'px;left:'+(this.options.width-this.options.toolbox.width-this.options.padding.right)+'px;min-width:'+this.options.toolbox.width+'px;height:'+this.options.toolbox.height+'px;')
        }else{
          toolbox
            .attr('style','position:absolute;top:'+(this._head_height-this.options.toolbox.height)+'px;left:'+(this.options.width-this.options.toolbox.width-this.options.padding.right)+'px;min-width:'+this.options.toolbox.width+'px;height:'+this.options.toolbox.height+'px;')
          toolbox.selectAll('i').remove();
        }
        if(this.options.toolbox.stack.show){
          toolbox.append('i')
            .attr('class','nz-icon nz-icon-stack toolbox-stack')
            .attr('title',this.options.toolbox.stack.title)
            .on('click',function(){
              if($self._type == CHART_TYPE.LINE ||$self._type == CHART_TYPE.AREA){
                $self.backZoom={
                  type:$self._type,
                }
                $self.reDrawChart(CHART_TYPE.STACK_AREA)
                toolbox.select('.toolbox-stack').attr('title',$self.options.toolbox.stack.backTitle)
              }else if($self._type==CHART_TYPE.BAR){
                $self.backZoom={
                  type:$self._type,
                  data:JSON.parse(JSON.stringify($self._pastSourceData))
                }
                $self.reDrawChart(CHART_TYPE.STACK_BAR,$self._pastSourceData)
                toolbox.select('.toolbox-stack').attr('title',$self.options.toolbox.stack.backTitle)
              }else if($self._type == CHART_TYPE.STACK_AREA){
                if($self.backZoom){
                  $self.reDrawChart($self.backZoom.type,$self._stackSourceData)
                  toolbox.select('.toolbox-stack').attr('title',$self.options.toolbox.stack.title)
                }
              }else if($self._type == CHART_TYPE.STACK_BAR){
                if($self.backZoom){
                  $self.reDrawChart($self.backZoom.type,$self.backZoom.data)
                  toolbox.select('.toolbox-stack').attr('title',$self.options.toolbox.stack.title)
                }
              }
            })
        }
        /*if(this.toolbox.area.show){
          toolbox.append('i')
            .attr('class','nz-icon nz-icon-area')
            .attr('title',this.toolbox.area.title)
            .on('click',function(){
              if($self.type != CHART_TYPE.AREA){
                $self.reDrawChart(CHART_TYPE.AREA)
              }else{
                if($self.backZoom){
                  $self.reDrawChart($self.backZoom.type,$self.backZoom.data)
                }
              }
            })
        }*/

      }
    },
    dispatchAction(type,param){
      this.svg.selectAll('.event-echo-unit').dispatch(type,{detail:{name:param}})
    },
    clearChart:function(){
      d3.select(this.options.selector).selectAll('svg').remove();
      this.tooltip.remove();
      this.tooltipLine.remove();

    }
  }
}
//取得多维数组最大值
function getMaxdata(arr) {
  let maxdata = 0;
  for (let i = 0; i < arr.length; i++) {
    maxdata = d3.max([maxdata, d3.max(arr[i], function(d) {
      return d[1];
    })]);
  }
  return maxdata;
}

function getMinMax(arr){
  let temp=[];
  arr.forEach((item,i)=>{
    let minMax=d3.extent(item,function(d){return d[1]})
    temp=temp.concat(minMax)
  })
  let minMax=d3.extent(temp)
  return{min:minMax[0],max:minMax[1]}
}

function computeDistance(str){
  let width = 0;
  let html = document.createElement('span');
  html.innerText = str;
  html.className = 'getTextWidth';
  document.querySelector('body').appendChild(html);
  width = document.querySelector('.getTextWidth').offsetWidth;
  document.querySelector('.getTextWidth').remove();
  return Number((width+5));
}

function getTooltipPosition(tooltip){

  let x=d3.event.pageX
  let y=d3.event.pageY

  let tooltipWidth=tooltip.node().offsetWidth
  let tooltipHeight=tooltip.node().offsetHeight


  let windowWidth=document.body.offsetWidth;
  let windowHeight=document.body.offsetHeight;

  let left=x + 20;
  let top=y + 20;

  if(x+tooltipWidth+20>windowWidth){
    left=x - 20 - tooltipWidth;
  }

  if(y+tooltipHeight+20>windowHeight){
    top=y - 20 - tooltipHeight;
  }

  return {left:left,top:top}

}
