<template>
  <div ref="box" class="box-hexagon" v-clickoutside="hexagonSvgClearScale" v-if="boxhexagonShow">
    <!--<div class="hexagon-text" :style="{top:hexagonTextPos.top,left:hexagonTextPos.left}" v-show="hexagonTextPos.show">-->
    <!--<span v-if="hexagonTextPos.data">-->
    <!--{{hexagonTextPos.data?hexagonTextPos.data.alertName:''}}-->
    <!--{{hexagonTextPos.data?hexagonTextPos.data.nums:''}}-->
    <!--</span>-->
    <!--</div>-->
    <div :id="hexagonSvgID">

    </div>
  </div>
</template>

<script>
  import {SVG} from '@svgdotjs/svg.js'
  import '@svgdotjs/svg.panzoom.js'
  import {getHexagon,setHexagon,delHexagon} from "../js/common";

  function PolylineOver(){
    this.stroke({color:'#909090'})
  }

  function PolylineOut(){
    this.stroke({color:'#DADADA'})
  }

  function hexagonPoint(x,y,edge){ // 根据左上角坐标点生成六边的六个点的坐标 通过 svg画出
    return new Promise(resolve=>{
      let arr;
      let x1,x2,x3,x4,x5,x6;
      let y1,y2,y3,y4,y5,y6;
      let MathSqrt3=Math.sqrt(3);
      x1=x;
      y1=y+edge/2;
      x2=x+MathSqrt3*edge/2;
      y2=y;
      x3=x+MathSqrt3*edge;
      y3=y+edge/2;
      x4=x+MathSqrt3*edge;
      y4=y+edge/2+edge;
      x5=x+MathSqrt3*edge/2;
      y5=y+edge*2;
      x6=x;
      y6=y+edge/2+edge;
      arr=[{x:x1,y:y1},{x:x2,y:y2},{x:x3,y:y3},{x:x4,y:y4},{x:x5,y:y5},{x:x6,y:y6}];
      let svgStrPoint='';
      arr.forEach((item)=>{
        svgStrPoint+=item['x']+','+item['y']+' '
      });
      let center=[x+MathSqrt3*edge/2,y+edge];
      resolve({
        point:arr,
        svgStrPoint,
        center
      })
    })
  }

  function midpoint(point1,point2){//计算中点
    return {
      x:(point1.x+point2.x)/2,
      y:(point1.y+point2.y)/2,
    }
  }

  function borderMove(left,top,borderSize,type,svgPolyline){//left,top, 坐标 borderSize 长度,type 外层边框线从哪走到那
    let point=[null,null];
    let MathSqrt3=Math.sqrt(3);
    let arr=svgPolyline.array();
    switch(type){
      case 1: //从左到右的斜上方运动
        point[0]=left+MathSqrt3*borderSize/2;
        point[1]=top-borderSize/2;
        break;
      case 2: //从左到右的斜下方运动
        point[0]=left+MathSqrt3*borderSize/2;
        point[1]=top+borderSize/2;
        break;
      case 3: //从上到下的正下方运动
        point[0]=left;
        point[1]=top+borderSize;
        break;
      case 4: //从右到左的斜下方运动
        point[0]=left-MathSqrt3*borderSize/2;
        point[1]=top+borderSize/2;
        break;
      case 5: //从右到左的斜上方运动
        point[0]=left-MathSqrt3*borderSize/2;
        point[1]=top-borderSize/2;
        break;
      case 6: //从右到左的斜上方运动
        point[0]=left;
        point[1]=top-borderSize;
        break;
    }
    arr.push(point);
    svgPolyline.plot(arr);
    return point
  }

  export default {
    name:"hexagonFigureSvg",
    props:{
      hexData:{},//数据
      hexagonSvgID:{//在同一个页面创建多个实例时 需要通过id区分
        type:String,
        default:'hexagonSvg',
      },
      col:{},//列数
      colorFrom:{//通过什么决定颜色
        type:String,
        default:'',
      },
      infoSet:{// 设置六边形内部内容  参数 group 对应六边形所在的组。allHexagonRect吧所有文本框放入，方便控制显示隐藏。data 六边形的相关数 data.center 中心点。that 子组件实例
        type:Function,
      },
      colorSet:{ //设置方块对应颜色 参数 item 当前item的数据
        type:Function,
        default:()=>{
          return {color:'#99D7C2',hoverColor:'#B2ECD9'}
        }
      },
      infoShow:{// 设置六边形内部内容 放大显示时的样式 参数 allHexagonRect
        type:Function,
      },
      infoHide:{// 设置六边形内部内容 缩小显示时的样式 参数 allHexagonRect
        type:Function,
      },
      hexagonEdgeProp:{ // 边框长度
        type:Number,
        default:90,
      },
      magnifyRate:{//放大倍率
        type:Number,
        default:1,
      },
      isClickRate:{ // 是否支持点击放大
        type:Boolean,
        default:true,
      },
      isPanning:{ // 是否支持移动
        type:Boolean,
        default:true,
      },
      isPinchZoom:{ //是否支持手指缩放
        type:Boolean,
        default:false,
      },
      isWheelZoom:{ //是否支持手指缩放
        type:Boolean,
        default:false,
      },
      zoomFactor:{ //鼠标滚轮放大倍数
        type:Number,
        default:0.5,
      },
      zoomMin:{//最小倍数
        type:Number,
        default:0.2,
      },
      zoomMax:{//最小倍数
        type:Number,
        default:5,
      },
      from:{
        type:String,
        default:'asset',
      }
    },
    watch:{
      hexData:{
        immediate:false,
        deep:true,
        handler(n){
          this.init();
        }
      },
      col:{ // 列数
        immediate:false,
        deep:true,
        handler(){
          this.init();
        }
      },
      hexagonEdgeProp:{
        immediate:false,
        deep:true,
        handler(n){
        }
      }
    },
    data(){
      return {
        allHexagon:[],
        allGroup:[],
        // col:5,
        row:5,
        boxPadLeft:360,
        boxPadTop:180,
        hexagonData:[],
        textAll:[],
        hexSize:'',
        MathSqrt3:Math.sqrt(3),
        hexagonTextPos:{
          top:0,
          left:0,
          show:false,
          data:null
        },
        boxhexagonShow:false,
        pan:false,//是否移动
        defaultColor:{color:'#99D7C2',hoverColor:'#B2ECD9'},
        viewBox:null,
        isShowHover:true,//是否显示hover块
        timer:null,// 定时器用来处理单击双击的冲突
        firstInit:true,//优化刚加载时的多次点击造成放大缩小功能的不正常
        defaultRate:0.33,// 默认倍率 最小0.2
        defaultBoxWidth:2288,
        hexagonEdge:JSON.stringify(this.hexagonEdgeProp),
        fontSize:14,
      }
    },
    computed:{
      interspace(){
        return (this.hexagonEdge*this.MathSqrt3/5)*0.5;
      }
    },
    created(){
    },
    mounted(){
      // this.init()

    },
    methods:{
      init(){ //创建svg实例
        this.boxhexagonShow=false;
        this.hexagonEdge=this.hexagonEdgeProp;
        this.clearData().then(()=>{
          this.boxhexagonShow=true;
          this.$nextTick(()=>{
            this.hexagonData=JSON.parse(JSON.stringify(this.hexData));
            let box=`#${this.hexagonSvgID}`;
            let hexagonSvg=SVG().addTo(box).size('100%','100%')
              .panZoom({
                zoomMin:this.zoomMin,
                zoomMax:this.zoomMax,
                zoomFactor:this.zoomFactor,
                pinchZoom:this.isPinchZoom,
                wheelZoom:this.isWheelZoom,
                panning:this.isPanning
              })
              .attr('id','SvgHex')
              .attr('class',this.hexagonSvgID)
              .attr('viewBox',`0 0 ${this.$refs.box.offsetWidth} ${this.$refs.box.offsetHeight}`); //svg实例
            hexagonSvg.on('click',this.hexagonSvgClearScale);
            hexagonSvg.on('panStart',this.hexagonSvgPanStart);
            hexagonSvg.on('panEnd',this.hexagonSvgPanEnd);
            let Rate=(this.$refs.box.offsetWidth/this.defaultBoxWidth);
            Rate=(Rate>0.2?Rate:0.2);
            this.hexagonEdge=(this.hexagonEdge/this.defaultRate)*Rate;
            this.fontSize=(this.fontSize/this.defaultRate)*Rate;
            setHexagon(this.hexagonSvgID,{
              hexagonSvg:hexagonSvg,
              svgPolyline:null,
              allHexagonRect:[],
              allHexagonText:[],
              hover:null
            })
            this.getPadding().then(()=>{
              getHexagon(this.hexagonSvgID).svgPolyline=getHexagon(this.hexagonSvgID).hexagonSvg.polyline().fill('none').stroke({
                color:'#DADADA',
                width:3,
                linecap:'round',
                linejoin:'round'
              });
              this.getDataPoint();
            });//获取到上方和左方的距离;
            setTimeout(()=>{
              this.firstInit=false;
            },500)
          })
        });
      },
      getPadding(){//确定到上方和下方的距离 保持居中
        return new Promise(resolve=>{
          let hexagonWidth=this.MathSqrt3*this.hexagonEdge+this.interspace;
          let hexagonHeight=this.hexagonEdge*2+this.interspace;
          let row=parseInt((this.hexagonData.length)/(this.col*2-1))*2;//行数是总数除2倍列数-1的整数部分 加上根据余数的判断
          let dolNum=(this.hexagonData.length)%(this.col*2-1)
          if(dolNum>0&&dolNum<=this.col){ //余数的判断
            row+=1
          }else if(dolNum>0&&dolNum>this.col){
            row+=2
          }
          this.row=row;
          if(this.hexagonData.length-1<=this.col){
            // boxPadLeft:200, boxPadTop:75,
            this.boxPadLeft=(this.$refs.box.offsetWidth-this.hexagonData.length*hexagonWidth)/2;
            this.boxPadTop=(this.$refs.box.offsetHeight-hexagonHeight)/2; //只有一行是 到上方距离应该是两倍边长
          }else{
            this.boxPadLeft=(this.$refs.box.offsetWidth-this.col*hexagonWidth)/2;
            this.boxPadTop=(this.$refs.box.offsetHeight-(hexagonHeight+(this.row-1)*hexagonHeight*3/4))/2; // 大于一行时 为一行的行高 + 3/2的行高
          }
          resolve();
        })
      },
      getDataPoint(){ // 确定所有坐标点的位置
        let col=this.col;//确定列数
        let row=this.row;//确定列数
        let paddingTop=this.boxPadTop; // 到上方的距离
        let paddingLeft=this.boxPadLeft; //整体到左侧的距离
        let arrIndex=0;
        this.hexSize=this.MathSqrt3*this.hexagonEdge/2;
        for(let i=0; i<row; i++){// 确定 所有 坐标点
          if(arrIndex>this.hexagonData.length-1){
            break
          }
          for(let j=0; j<col; j++){
            if(arrIndex>this.hexagonData.length-1){
              break
            }
            if(i===0){
              this.hexagonData[arrIndex].left=j*(this.hexSize*2+this.interspace)+paddingLeft;
              this.hexagonData[arrIndex].top=i*(this.hexSize*2)+paddingTop;
              this.hexagonData[arrIndex].sub=i+'-'+j
            }else if(i%2===0){
              // if(i===2&&( j===1 || j==2)){
              //   this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace)+ paddingLeft;
              //   this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2 - this.hexSize*2*1/8)+ paddingTop;
              // }else{
              //   continue;
              // }
              this.hexagonData[arrIndex].left=j*(this.hexSize*2+this.interspace)+paddingLeft;
              this.hexagonData[arrIndex].top=i*(this.hexSize*2+this.interspace/2*this.MathSqrt3-this.hexSize*2/8)+paddingTop;
              this.hexagonData[arrIndex].sub=i+'-'+j
            }else{
              if(j===col-1){
                break
              }
              // if(i!==3){
              //   this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace ) + this.hexSize*2/2 + this.interspace/2+ paddingLeft;
              //   this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2 - this.hexSize*2*1/8) + paddingTop;
              // } else if(i==3&&(j===1)){
              //   this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace ) + this.hexSize*2/2 + this.interspace/2+ paddingLeft;
              //   this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2 - this.hexSize*2*1/8) + paddingTop;
              // }else{
              //   continue;
              // }
              this.hexagonData[arrIndex].left=j*(this.hexSize*2+this.interspace)+this.hexSize*2/2+this.interspace/2+paddingLeft;
              this.hexagonData[arrIndex].top=i*(this.hexSize*2+this.interspace/2*this.MathSqrt3-this.hexSize*2/8)+paddingTop;
              this.hexagonData[arrIndex].sub=i+'-'+j
            }
            arrIndex++;
          }
        }
        this.renderSomeHexagonAll();
      },
      renderSomeHexagonAll(){// 遍历所有数据 绘画六边形 之后画边框
        let arr=[]
        this.hexagonData.forEach(item=>{
          this.renderHexagon(item);
          arr.push(this.renderHexagon.bind(this,item))
        });
        Promise.all(arr).then(()=>{
          if(getHexagon(this.hexagonSvgID)&&getHexagon(this.hexagonSvgID).hexagonSvg){
            this.borderHex();
            getHexagon(this.hexagonSvgID).hexagonSvg.animate(300).zoom(this.defaultRate);
            let hoverRect=getHexagon(this.hexagonSvgID).hexagonSvg.group().addClass('hoverRect');
            hoverRect.rect();
            hoverRect.text('a');
            hoverRect.hide();
            getHexagon(this.hexagonSvgID).hover=hoverRect;
            setTimeout(()=>{
              if(getHexagon(this.hexagonSvgID)&&getHexagon(this.hexagonSvgID).hexagonSvg){
                this.viewBox=getHexagon(this.hexagonSvgID).hexagonSvg.attr('viewBox')
              }
            },300)
          }
        });
      },
      renderHexagon(item){ // 绘画六边形
        return new Promise(resolve=>{
          hexagonPoint(item.left,item.top,this.hexagonEdge).then(data=>{
            let color=this.colorSet?this.colorSet(item):this.defaultColor;
            let group=getHexagon(this.hexagonSvgID).hexagonSvg.group();
            let polygon=group.polygon(data.svgStrPoint).fill(color.color);
            polygon.data({
              ...data,
              ...item,
              ...color
            });
            group.on('mouseenter',this.hexagonOver.bind(this,group));
            group.on('mouseleave',this.hexagonOut.bind(this,group));
            group.on('click',this.hexagonSvgScale.bind(this,polygon.data('center'),item,data,group));

            this.allHexagon.push(polygon);
            this.allGroup.push(group);
            // 向六边形内 添加文本 本质是根据六边形的中心点确定各个文本位置
            if(this.infoSet){
              this.infoSet(group,getHexagon(this.hexagonSvgID).allHexagonRect,getHexagon(this.hexagonSvgID).allHexagonText,data,item,this.fontSize,this);
            }
            resolve();
          });
        })
      },
      hexagonOver(that,e){// 移入六边形
        let color=that.first().data('hoverColor');
        that.first().timeline().unschedule(that.first().animate());
        that.timeline().unschedule(that.first().animate());
        that.first().animate(100).stroke({width:3,color:'#909090'}).fill(color);
        that.animate(100).transform({scale:1.1});
        that.parent().find('polyline').stroke({color:'#909090'});
        let hover=that.parent().find('.hoverRect');

        if(this.isShowHover&&hover&&this.from){
          let center=that.first().data('center');
          let str=this.from==='asset'?that.first().data('host'):that.first().data('module');
          str+='';
          hover.show();
          hover.get(1).attr(
            {
              x:center[0]-(str.length*20+30)/2,
              y:center[1]-this.hexagonEdge-76,
            }
          ).fill({ color: '#fff',weight:400}).text(str).font({size:36});
          let textPaddingWidth=((str.length*20+30)-hover.get(1).bbox()[0].width)/2;
          hover.get(1).attr(
            {
              x:center[0]-(str.length*20+30)/2+textPaddingWidth,
              y:center[1]-this.hexagonEdge-76,
            }
          );
          hover.get(0).attr(
            {
              x:center[0]-(str.length*20+30)/2,
              y:center[1]-this.hexagonEdge-80,
            }
          ).fill({ color: `rgba(0,0,0,0.3)`}).size((str.length*20+30),72).attr({ rx:"10",ry:"10"});
        }
      },
      hexagonOut(that){// 移出六边形
        let color=that.first().data('color');
        that.first().timeline().unschedule(that.first().animate());
        that.timeline().unschedule(that.first().animate());
        that.first().animate(100).stroke({width:0,color:'#909090'}).fill(color);
        that.animate(100).transform({scale:1});
        that.parent().find('polyline').stroke({color:'#DADADA'});
        let hover=that.parent().find('.hoverRect');
        if(hover){
          hover.hide();
        }
      },
      hexagonSvgScale(center,item1,data,group,e){
        window.event? window.event.cancelBubble = true:e.stopPropagation();
        if(this.timer){
          clearTimeout(this.timer);
          this.timer=null;
        }
        this.group=group;
        this.group.on('dblclick',this.hexagonSvgClearScale);
        if(!this.pan&&this.isClickRate){
          getHexagon(this.hexagonSvgID).hexagonSvg.animate(300).zoom(this.magnifyRate,{x:center[0],y:center[1]});
          if(this.infoShow){
            this.infoShow(getHexagon(this.hexagonSvgID).allHexagonRect,getHexagon(this.hexagonSvgID).allHexagonText)
          }
          this.isShowHover=false;
        }
        let hover=getHexagon(this.hexagonSvgID).hexagonSvg.find('.hoverRect');
        if(hover){
          hover.hide();
        }
      },
      hexagonSvgClearScale(e){
        window.event? window.event.cancelBubble = true:e.stopPropagation();
        if(this.firstInit){return}
        if(this.group){
          this.group.off('dblclick',this.hexagonSvgClearScale);
          this.group=null;
        }
        if(!this.pan&&this.isClickRate){
          getHexagon(this.hexagonSvgID).hexagonSvg.animate(300).zoom(this.defaultRate).attr('viewBox',this.viewBox);
          if(this.infoHide){
            this.infoHide(getHexagon(this.hexagonSvgID).allHexagonRect,getHexagon(this.hexagonSvgID).allHexagonText)
          }
          this.timer=setTimeout(()=>{
            this.isShowHover=true;
          },100)
          window.getSelection().empty();//取消选中文字
        }
      },
      hexColorToRgb(color){
        let reg=/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 把颜色值变成小写
        if(reg.test(color)){
          // 如果只有三位的值，需变成六位，如：#fff => #ffffff
          if(color.length===4){
            let colorNew="#";
            for(let i=1; i<4; i+=1){
              colorNew+=color.slice(i,i+1).concat(color.slice(i,i+1));
            }
            color=colorNew;
          }
          // 处理六位的颜色值，转为RGB
          let colorChange=[];
          for(let i=1; i<7; i+=2){
            colorChange.push(parseInt("0x"+color.slice(i,i+2)));
          }
          return colorChange.join(",");
        }else{
          return color;
        }
      },
      hexagonSvgPanStart(ev){ // 实例移动开始 解绑点击函数
        ev.preventDefault();
        setTimeout(()=>{ // 设置延时 解决移动后的缩放问题
          this.pan=true;
        },100)
      },
      hexagonSvgPanEnd(ev){ // 实例移动结束 重新绑定点击函数
        ev.preventDefault();
        setTimeout(()=>{ // 设置延时 解决移动后的缩放问题
          this.pan=false;
        },100)
        // if(this.isShowHover&&getHexagon(this.hexagonSvgID).hexagonSvg){ // 记录移动位置 对双击事件有一定影响 暂时关闭 后续优化
        //   this.viewBox=getHexagon(this.hexagonSvgID).hexagonSvg.attr('viewBox');
        // }
      },
      borderHex(){//外层边框 数组点
        let length=this.allHexagon.length;
        if(length==0){//为0 调出
          return
        }
        let k={x:-this.interspace,y:-(this.interspace*2)*this.MathSqrt3/6};//边框对起点的偏移量
        let item=this.allHexagon[0].data('point')[0];
        let endItemSub=this.allHexagon[length-1].data('sub').split('-');
        let borderCol=endItemSub[1];
        let borderRow=endItemSub[0];
        let borderPoint=[item.x+k.x,item.y+k.y];
        let borderSize=this.hexagonEdge*1.2;
        getHexagon(this.hexagonSvgID).svgPolyline.plot([borderPoint]);
        //先从左到右划线 应该是 col的长度
        let borderColTop=0;
        if(borderRow==0){
          borderColTop=borderCol;
        }else{
          borderColTop=this.col-1;
        }
        for(let i=0; i<=borderColTop*2; i++){
          if(i===1){
            borderSize=this.hexagonEdge*1.1
          }
          if(i%2===0){
            borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,1,getHexagon(this.hexagonSvgID).svgPolyline);
          }else{
            borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,2,getHexagon(this.hexagonSvgID).svgPolyline);
          }
        }
        borderSize=this.hexagonEdge*1.2
        // 从上到下 应该是row的长度 分情况
        let borderRowRight=0;//右边循环次数
        // 情况1 borderCol<=this.col && row==0时
        if((borderCol<=this.col-1)&&borderRow==0){
          borderRowRight=3;
          for(let i=0; i<borderRowRight-1; i++){
            if(i===1){
              // borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2,,getHexagon(this.hexagonSvgID).svgPolylinetrue);
              borderSize=this.hexagonEdge*1.2
            }
            if(i===2){
              // borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2,,getHexagon(this.hexagonSvgID).svgPolylinetrue);
              borderSize=this.hexagonEdge*1.1
            }
            if(i%4===0){
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,2,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
        }
        // 情况2 border==this.col&& row>0时 且row 为奇数事
        if(borderCol==this.col-2&&borderRow>0&&borderRow%2==1){
          borderRowRight=2*(Number(borderRow)+1);
          for(let i=0; i<borderRowRight; i++){
            if(i%4===0){
              borderSize=this.hexagonEdge*1.1;
              if(i==0){
                borderSize=this.hexagonEdge*1.2;
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,2,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderSize=this.hexagonEdge*1.2;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderSize=this.hexagonEdge*1.03;
              if(i===borderRowRight-1){
                borderSize=this.hexagonEdge*1.1;
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
        }
        // 情况3 borderCol==this.col && row>0 且 row 为偶数事
        if(borderCol==this.col-1&&borderRow>0&&borderRow%2==0){
          borderRowRight=2*(Number(borderRow)+1)+1;
          for(let i=0; i<borderRowRight-1; i++){
            if(i%4===0){
              borderSize=this.hexagonEdge*1.1
              if(i==0){
                borderSize=this.hexagonEdge*1.2
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,2,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderSize=this.hexagonEdge*1.2;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderSize=this.hexagonEdge*1.03;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
        }
        // 情况4 border<this.col&& row>0时 且row 为奇数事
        if(borderCol<this.col-2&&borderRow>0&&borderRow%2==1){
          borderRowRight=2*(Number(borderRow-1)+1);
          for(let i=0; i<borderRowRight; i++){
            if(i%4===0){
              borderSize=this.hexagonEdge*1.1
              if(i==0){
                borderSize=this.hexagonEdge*1.2
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,2,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderSize=this.hexagonEdge*1.2;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderSize=this.hexagonEdge*1.03;
              if(i===borderRowRight-1){
                borderSize=this.hexagonEdge*1.1;
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }//向下移动
          borderSize=this.hexagonEdge*1.2
          for(let i=0; i<(this.col-borderCol-1)*2-1; i++){//向左移动
            if(i===1){
              borderSize=this.hexagonEdge*1.1
            }
            if(i==(this.col-borderCol-1)*2-2){
              borderSize=this.hexagonEdge
            }
            if(i%2===0){
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else{
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,5,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
          borderSize=this.hexagonEdge*1.1
          borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
        }
        // 情况5 borderCol<this.col && row>0 且 row 为偶数事
        if(borderCol<this.col-1&&borderRow>0&&borderRow%2==0){
          borderRowRight=2*(Number(borderRow-1)+1)+1;
          for(let i=0; i<borderRowRight-1; i++){
            if(i%4===0){
              borderSize=this.hexagonEdge*1.1
              if(i==0){
                borderSize=this.hexagonEdge*1.2
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,2,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderSize=this.hexagonEdge*1.2;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderSize=this.hexagonEdge*1.03;
              if(i===borderRowRight-2){
                borderSize=this.hexagonEdge*1.15;
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
          borderSize=this.hexagonEdge*1.2
          for(let i=0; i<(this.col-borderCol-1)*2-1; i++){//向左移动
            if(i==1){
              borderSize=this.hexagonEdge*1.1
            }
            if(i==(this.col-borderCol-1)*2-2){
              borderSize=this.hexagonEdge*1
            }
            if(((Number(borderCol)+2)==this.col)&&(i==0)){
              borderSize=this.hexagonEdge*1.1
            }
            if(i%2===0){
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
            }else{
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,5,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
          borderSize=this.hexagonEdge*1.1
          borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,3,getHexagon(this.hexagonSvgID).svgPolyline);
        }
        // 从右到左 就是结束时的列数
        borderSize=this.hexagonEdge*1.2
        for(let i=0; i<=borderCol*2+1; i++){
          if(i===1){
            // borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2,,getHexagon(this.hexagonSvgID).svgPolylinetrue);
            borderSize=this.hexagonEdge*1.1
          }
          if(i==borderCol*2+1){
            borderSize=this.hexagonEdge*1.2
          }
          if(i%2===0){
            borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,4,getHexagon(this.hexagonSvgID).svgPolyline);
          }else{
            borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,5,getHexagon(this.hexagonSvgID).svgPolyline);
          }
        }
        // 从下向上的移动
        // 分兩種情況
        borderSize=this.hexagonEdge*1.2;
        if(borderRow%2==1){
          for(let i=0; i<=borderRow*2; i++){
            if(i%4===0){
              borderSize=this.hexagonEdge*1.1;
              if(i!==0){
                borderSize=this.hexagonEdge*1.03;
              }
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,6,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,5,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderSize=this.hexagonEdge*1.2;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,6,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,1,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
        }
        if(borderRow%2==0){
          for(let i=0; i<=borderRow*2; i++){
            if(i%4===0){
              borderSize=this.hexagonEdge*1.2
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,6,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===1){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,1,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===2){
              borderSize=this.hexagonEdge*1.03;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,6,getHexagon(this.hexagonSvgID).svgPolyline);
            }else if(i%4===3){
              borderSize=this.hexagonEdge*1.1;
              borderPoint=borderMove(borderPoint[0],borderPoint[1],borderSize,5,getHexagon(this.hexagonSvgID).svgPolyline);
            }
          }
        }


        getHexagon(this.hexagonSvgID).svgPolyline.on('mouseover',PolylineOver)
        getHexagon(this.hexagonSvgID).svgPolyline.on('mouseout',PolylineOut);
      },
      clearData(){// 清除数据 以及解绑事件 防止内存崩溃
        if(getHexagon(this.hexagonSvgID)&&getHexagon(this.hexagonSvgID).hexagonSvg){
          this.allHexagon.forEach((item)=>{
            item.off('mouseover',this.hexagonOver);
            item.off('mouseout',this.hexagonOut);
            item.off('click',this.hexagonSvgScale);
            item.off('dblclick',this.hexagonSvgClearScale);
            item.clear();
          })
          this.allHexagon=[];
          this.hexagonData=[];
          getHexagon(this.hexagonSvgID).hexagonSvg.off('click',this.hexagonSvgClearScale);
          getHexagon(this.hexagonSvgID).hexagonSvg.off('panStart',this.hexagonSvgPanStart);
          getHexagon(this.hexagonSvgID).hexagonSvg.off('panEnd',this.hexagonSvgPanEnd);
          getHexagon(this.hexagonSvgID).hexagonSvg=null;  //Svg的实例
          getHexagon(this.hexagonSvgID).svgPolyline=null;// Svg hexagon的边框
          delHexagon(this.hexagonSvgID)
        }
        return new Promise(resolve=>{
          resolve()
        })
      },

    },
    beforeDestroy(){
      this.clearData();
      if(getHexagon(this.hexagonSvgID)){
        getHexagon(this.hexagonSvgID).allHexagonRect=null;//文本框
        getHexagon(this.hexagonSvgID).allHexagonText=null;// 文本内容
      }
      // clearTimeout(this.timer)
    }
  }
</script>

<style scoped>
  .box-hexagon, #hexagonSvg {
    width: 100%;
    height: 100%;
    position: relative;
    min-width: 200px;
    min-height: 200px;
  }

  .hexagon-text {
    position: absolute;
    z-index: 1;
    font-size: 10px;
  }
</style>
<style>
  #SvgHex {
    transition: transform .25s linear;
    transform-origin: 0 0;
  }

  #SvgHex.hexagonSvgBox {
    transition: .25s linear;
  }
</style>
