import * as d3 from "d3";
import i18n from "../../common/i18n";
import {randomcolor} from "../../common/js/radomcolor/randomcolor";

export function CHART_TYPE(){}
CHART_TYPE.LINE='line'
CHART_TYPE.AREA='area'
CHART_TYPE.STACK_AREA='stackArea'
CHART_TYPE.BAR='bar'
CHART_TYPE.STACK_BAR='stackBar'

export function Bar(chart){
  this.group=null;
  let dataset=chart.datas;
  let svg=chart.svg;
  let xScale=chart.xScale;
  let xScale1=chart.xScale1;
  let yScale=chart.yScale;
  let colors=chart.colors;
  let legends=chart.options.legends;
  let singleFlag=legends.find(item=>{return item.isGray==true})
  let state='multi';
  let colorScale=d3.scaleOrdinal()
    .domain(chart.options.height - chart._foot_height,chart._head_height)
    .range(colors)

  this.init=function(index){
    /*let data=dataset.map((item,i)=>{
      return item[index];
    })*/
    let data=dataset[index]
    let time=data[0][0]
    let $self=this;
    let timeScale=xScale(time);
    if(!timeScale){
      return;
    }
    this.data=data;
    this.group=svg.append('g').attr("clip-path","url(#"+chart._clipSelector+")")
      .append('g')
      .attr('transform','translate('+timeScale+',0)')
      this.rects=[];
      data.forEach((d,i)=>{
        let rect=this.group.append('g').attr('fill',legends[i].isGray?'none':colors[i])
          .append('rect')
          .attr('class','event-echo-unit')
          .attr('y',yScale(d[1]))
          .on('legend-single-show',function(){
            state='single'
            let legend=chart.options.legends[i];
            let event=d3.event;
            let name=event.detail?event.detail.name:""
            if(legend.name == name){
              if(chart._type == CHART_TYPE.BAR){
                rect.transition().duration(chart.options.duration)
                  .attr('x',xScale1(0))
                  .attr('width',xScale.bandwidth())
                  .attr('fill',colors[i])
              }else{
                rect.transition().duration(chart.options.duration)
                  .attr('fill',colors[i])
                  .attr('height', yScale(chart.minMax.min) - yScale(d[1]))
              }

              legend.isGray=false;
            }else{
              if(chart._type == CHART_TYPE.BAR){
                rect.attr('fill','none').attr('x',xScale1(i)).attr('width',xScale1.bandwidth())
              }else{
                rect.attr('fill','none')
              }
              legend.isGray=true;
            }
          })
          .on('legend-all-show',function(){
            state='multi'
            if(chart._type == CHART_TYPE.BAR){
              rect.transition().duration(chart.options.duration)
                .attr('fill',colors[i]).attr('x',xScale1(i)).attr('width',xScale1.bandwidth())
            }else{
              rect.transition().duration(chart.options.duration)
                .attr('fill',colors[i])
                .attr('height',function(){
                    if(i==0){
                      return yScale(chart.minMax.min) - yScale(d[1])
                    }else{
                      let before=data[i-1];
                      return yScale(before[1]) - yScale(d[1])
                    }
                })
            }
            chart.options.legends.forEach(item=>{item.isGray=false})
          })

          if(chart._type==CHART_TYPE.BAR){
            rect.attr('x',xScale1 (i) )
                .attr('width',xScale1.bandwidth()<=0?0.1:xScale1.bandwidth())
                .attr('height', yScale(chart.minMax.min) - yScale(d[1]))
          }else{
            rect.attr('width',xScale.bandwidth())
                .attr('height',function(){
                    if(i==0){
                      return yScale(chart.minMax.min) - yScale(d[1])
                    }else{
                      if(singleFlag){
                        return yScale(chart.minMax.min) - yScale(d[1])
                      }else{
                        let before=data[i-1];
                        return yScale(before[1]) - yScale(d[1])
                      }
                    }
                })
          }
        this.rects.push(rect)
      })
  }
  this.scale = function(index, _duration, transform) {
    if(!this.data){
      return;
    }
    let data=this.data;
    let time=data[0][0]
    let $self=this;
    let timeScale=xScale(time);

    if(!timeScale){
      return;
    }
    if(this.group){
      this.group.attr('transform','translate('+timeScale+',0)')
      if(chart._type == CHART_TYPE.BAR){
        if(state == 'single'){
          this.rects.forEach((rect,i)=>{
            rect.attr('x',xScale1(0))
              .attr('width',xScale.bandwidth())
          })
        }else{
          this.rects.forEach((rect,i)=>{
            rect.attr('x',xScale1(i))
              .attr('width',xScale1.bandwidth())
          })
        }
      }else{
        this.rects.forEach((rect,i)=>{
          rect.attr('x',xScale1(0))
            .attr('width',xScale.bandwidth())
        })
      }
    }
  }
}
export function Line(chart) {
  this.group = null;
  this.path = null;
  let state = 'multi'//区分是显示单条还是全部显示
  let dataset=chart.datas;
  let svg=chart.svg;
  let xScale=chart.xScale;
  let yScale=chart.yScale;
  let lineColor=chart.colors;
  let legends=chart.options.legends;
  let singleFlag=legends.find(item=>{return item.isGray == true})
  const dispatch=chart.dispatch;

  this.init = function(id) {
    let arr = dataset[id];
    let legend=chart.options.legends[id];
    this.group = svg.append("g");
    let $self=this;
    let line = d3.line()
      .x(function(d, i) {
        return xScale(d[0]);
      })
      .y(function(d) {
        return yScale(d[1]);
      })
      .curve(d3.curveCatmullRom.alpha(0.3)); //折线曲度

    let areaForStack = d3.area()
      .x(function(d, i) {
        return xScale(d[0]);
      })
      // .y0(chart.height - chart._foot_height)
      .y0(function(d,i){
        if(id==0){
          return chart.options.height - chart._foot_height
        }else{
          if(singleFlag){
            return chart.options.height - chart._foot_height
          }else{
            return  yScale(dataset[id-1][i][1])
          }
        }
      })
      .y1(function(d) {
        return yScale(d[1])
      })
      .curve(d3.curveCatmullRom.alpha(0.3)); //折线曲度

    let areaForNormal=d3.area()
      .x(function(d, i) {
        return xScale(d[0]);
      })
      .y0(chart.options.height - chart._foot_height)
      .y1(function(d) {
        return yScale(d[1])
      })
      .curve(d3.curveCatmullRom.alpha(0.3)); //折线曲度
    //添加折线
    this.path = this.group.append("path")
      .attr("clip-path","url(#"+chart._clipSelector+")")
      .attr("d", line(arr))
      .attr('class','event-echo-unit chart-line')
      .style("fill", 'none')
      .style("stroke-width", 1)
      .style("stroke", legends[id].isGray?'none':lineColor[id])
      .style("stroke-opacity", 0.9)
      .on('legend-single-show',function(d,i,group){
        let event=d3.event;
        state='single'
        let name=event.detail?event.detail.name:""
        if(legend.name != name){
          $self.group
            .transition()
            .duration(chart.options.duration)
            .style('opacity','0')
          legend.isGray=true;
        }else{
          $self.group.transition()
            .duration(chart.options.duration).style('opacity','1')
          legend.isGray=false;
          if(chart.currentTransform){
            $self.scale(id,chart.options.duration,chart.currentTransform)
          }else{
            $self.group.select('.chart-area').attr('d',areaForNormal(arr))
          }
        }
      })
      .on('legend-all-show',function(){
        let event=d3.event;
        state='multi'
        $self.group.transition()
          .duration(chart.options.duration).style('opacity','1')
        chart.options.legends.forEach(item=>{
          item.isGray=false;
        })
        if(chart.currentTransform){
          $self.scale(id,chart.options.duration,chart.currentTransform)
        }else{
          $self.group.select('.chart-area').attr('d',areaForStack(arr))
        }
      })
    if(chart._type==CHART_TYPE.AREA||chart._type == CHART_TYPE.STACK_AREA){
      this.area=this.group.append('path')
        .attr("clip-path", "url(#"+chart._clipSelector+")")
        .attr('class','chart-area')
        .style('fill',legends[id].isGray?'none':lineColor[id])
        .style("stroke", 'none')
        .style('opacity','.1')
      if(chart._type == CHART_TYPE.AREA){
        this.area.attr('d',areaForNormal(arr))
      }else{
        this.area.attr('d',areaForStack(arr))
      }
    }
  };

  this.scale = function(id, _duration, transform) {

    let arr = dataset[id];

    let line = d3.line()
      .x(function(d, i) {
        return transform.applyX(xScale(d[0]))
      })
      .y(function(d) {
        return yScale(d[1]);
      })
    let areaForNormal=d3.area()
      .x(function(d, i) {
        return transform.applyX(xScale(d[0]))
      })
      .y0(chart.options.height - chart._foot_height)
      .y1(function(d) {
        return yScale(d[1])
      })

    let areaForStack=d3.area()
      .x(function(d, i) {
        return transform.applyX(xScale(d[0]))
      })
      .y0(function(d,i){
        if(id==0){
          return chart.options.height - chart._foot_height
        }else{
          return  yScale(dataset[id-1][i][1])
        }
      })
      .y1(function(d) {
        return yScale(d[1])
      })

    //添加折线
    this.group.select(".chart-line")
      .attr("d", line(arr))
      .style("fill", "none")
      .style("stroke-width", 1)
      .style("stroke", legends[id].isGray?'none':lineColor[id])
      .style("stroke-opacity", 0.9);
    if(chart._type == CHART_TYPE.AREA||chart._type == CHART_TYPE.STACK_AREA){
      let area=this.group.select(".chart-area")
        .style('fill',legends[id].isGray?'none':lineColor[id])
        .style("stroke", 'none')
        .style('opacity','.1')
      if(state == 'single'){
        area.attr("d", areaForNormal(arr))
      }else if(state == 'multi'){
        if(chart._type == CHART_TYPE.STACK_AREA) {
          area.attr("d", areaForStack(arr))
        }else {
          area.attr("d", areaForNormal(arr))
        }
      }
    }
  }
}

export function tooltipFormatter(target,params){
  target.selectAll('div')
    .data(params)
    .enter()
    .append('div')
    .html(function(d,i){
      if(!d.legend.isGray){
        return `<div style="white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;display: flex; justify-content: space-between; min-width: 150px; max-width: 600px; line-height: 18px; font-size: 12px;">
                            <div style="max-width: 500px;white-space:nowrap;overflow-x:hidden;text-overflow:ellipsis;"><span style='display:inline-block;margin-right:5px;border-radius:10px;width:15px;height:5px;background-color: ${d.color};}'></span>${d.legend.alias?d.legend.alias:d.legend.name}:  </div>
                            <div style="padding-left: 10px;">${d.value}</div>
                         </div>`
      }
    })
}
