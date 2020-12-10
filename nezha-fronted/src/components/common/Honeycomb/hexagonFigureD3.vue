<template>
  <div ref="box" class="box-hexagon" v-clickoutside="hexagonSvgClearScale" v-if="boxhexagonShow">
    <!--<div class="hexagon-text" :style="{top:hexagonTextPos.top,left:hexagonTextPos.left}" v-show="hexagonTextPos.show">-->
      <!--<span v-if="hexagonTextPos.data">-->
        <!--{{hexagonTextPos.data?hexagonTextPos.data.alertName:''}}-->
        <!--{{hexagonTextPos.data?hexagonTextPos.data.nums:''}}-->
      <!--</span>-->
    <!--</div>-->
    <div id="hexagonSvg">

    </div>
  </div>
</template>

<script>
  import {SVG} from '@svgdotjs/svg.js'
  import '@svgdotjs/svg.panzoom.js'
  let hexagonSvg=null;  //Svg的实例
  let domSvg=null; //Svg的dom 用来控制缩放
  let svgPolyline=null // Svg hexagon的边框
  let allHexagonText=[];
  function hexagonEnter(){// 移入六边形
    let level=this.first().data('level');
    let color =  level==='P1'?'#FFCDCD':(level==='P2'?'#FFE0B8':'#B2ECD9');
    this.first().animate(100).stroke({width:3,color: '#909090'}).fill(color);
    this.animate(100).transform({scale: 1.1});
    svgPolyline.animate(100).stroke({ color: '#909090'})
  }

  function hexagonLeave(){// 移出六边形
    let level=this.first().data('level');
    let color = level ==='P1'?'#FAAFAF':(level==='P2'?'#FFCF92':'#99D7C2');
    this.first().animate(100).stroke({width:0,color: '#909090'}).fill(color);
    this.animate(100).transform({scale: 1});
    svgPolyline.animate(100).stroke({ color: '#DADADA'})
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

  function borderMove(left,top,borderSize,type){//left,top, 坐标 borderSize 长度,type 外层边框线从哪走到那
    let point=[null,null];
    let MathSqrt3=Math.sqrt(3);
    let arr = svgPolyline.array();
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
      hexData:{},
      col:{},
      length:{}
    },
    watch:{
      hexData:{
        immediate: false,
        deep: true,
        handler() {
          this.init();
        }
      },
      col:{
        immediate: false,
        deep: true,
        handler() {
          this.init();
        }
      },
      length:{
        immediate: false,
        deep: true,
        handler() {
          this.init();
        }
      },

    },
    data(){
      return {
        allHexagon:[],
        allGroup:[],
        hexagonEdge:90,
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
        timer:null,
        boxhexagonShow:false,
        pan:false,//是否移动
      }
    },
    computed:{
      interspace(){
        return (this.hexagonEdge*this.MathSqrt3/5)*0.5;
      }
    },
    mounted(){
      // this.init()
    },
    methods:{
      init(){ //创建svg实例
       this.boxhexagonShow=false;
       this.clearData();
       setTimeout(()=>{
         this.boxhexagonShow=true;
         this.$nextTick(()=>{
           this.hexagonData = JSON.parse(JSON.stringify(this.hexData.concat(this.hexData,this.hexData)));
           localStorage.setItem('hexagonData',JSON.stringify(this.hexData.concat(this.hexData,this.hexData,this.hexData,this.hexData,this.hexData,this.hexData)));
           this.hexagonData = JSON.parse(localStorage.getItem('hexagonData'));
           this.hexagonData=this.hexagonData.slice(0,this.length);
           hexagonSvg=SVG().addTo('#hexagonSvg').size('100%','100%')
             .panZoom({zoomMin:0.5,zoomMax:3,zoomFactor:0.3,pinchZoom:false,wheelZoom:false})
             .attr('id','SvgHex')
             .attr('viewBox',`0 0 ${this.$refs.box.offsetWidth} ${this.$refs.box.offsetHeight}`); //svg实例
           domSvg=document.getElementById('SvgHex');//svg dom
           hexagonSvg.on('click',this.hexagonSvgClearScale);
           hexagonSvg.on('panStart',this.hexagonSvgPanStart);
           hexagonSvg.on('panEnd',this.hexagonSvgPanEnd);
           this.getPadding().then(()=>{
             this.getDataPoint();
           });//获取到上方和左方的距离;
         })
       },100)
      },
      getPadding(){//确定到上方和下方的距离 保持居中
         return new Promise(resolve=>{
           let hexagonWidth = this.MathSqrt3*this.hexagonEdge+this.interspace;
           let hexagonHeight = this.hexagonEdge*2+this.interspace;
           if(this.hexagonData.length<this.col){
             // boxPadLeft:200, boxPadTop:75,
             this.boxPadLeft=(this.$refs.box.offsetWidth-this.hexagonData.length*hexagonWidth)/2;
             this.boxPadTop=(this.$refs.box.offsetHeight - hexagonHeight)/2
           }else{
             this.boxPadLeft=(this.$refs.box.offsetWidth-this.col*hexagonWidth)/2;
             this.boxPadTop=(this.$refs.box.offsetHeight - hexagonHeight*(Math.round(this.hexagonData.length/(this.col*2-1))+1))/2
           }
           this.row=(Math.round(this.hexagonData.length/(this.col*2-1))+1)*2
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
        for(let i=0;i<row;i++){// 确定 所有 坐标点
          if(arrIndex>this.hexagonData.length-1){break}
          for(let j=0;j<col;j++){
            if(arrIndex>this.hexagonData.length-1){break}
            if(i===0){
              this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace)+ paddingLeft;
              this.hexagonData[arrIndex].top=i*(this.hexSize*2) + paddingTop;
              this.hexagonData[arrIndex].sub=i+'-'+j
            } else if(i%2===0) {
              // if(i===2&&( j===1 || j==2)){
              //   this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace)+ paddingLeft;
              //   this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2 - this.hexSize*2*1/8)+ paddingTop;
              // }else{
              //   continue;
              // }
              this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace)+ paddingLeft;
              this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2*this.MathSqrt3 - this.hexSize*2/8)+ paddingTop;
              this.hexagonData[arrIndex].sub=i+'-'+j
            }else{
              if(j===col-1) {break}
              // if(i!==3){
              //   this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace ) + this.hexSize*2/2 + this.interspace/2+ paddingLeft;
              //   this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2 - this.hexSize*2*1/8) + paddingTop;
              // } else if(i==3&&(j===1)){
              //   this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace ) + this.hexSize*2/2 + this.interspace/2+ paddingLeft;
              //   this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2 - this.hexSize*2*1/8) + paddingTop;
              // }else{
              //   continue;
              // }
              this.hexagonData[arrIndex].left=j*(this.hexSize*2 + this.interspace ) + this.hexSize*2/2 + this.interspace/2+ paddingLeft;
              this.hexagonData[arrIndex].top=i*(this.hexSize*2 + this.interspace/2*this.MathSqrt3 - this.hexSize*2/8) + paddingTop;
              this.hexagonData[arrIndex].sub=i+'-'+j
            }
            arrIndex++;
          }
        }
        this.renderSomeHexagonAll();
      },
      renderSomeHexagonAll(){// 遍历所有数据 绘画六边形 之后画边框
        this.hexagonData.forEach(item=>{
          this.renderHexagon(item)
        });
        setTimeout(()=>{
          this.borderHex();
          hexagonSvg.zoom(0.33)
        })
      },
      renderHexagon(item){ // 绘画六边形
       hexagonPoint(item.left,item.top,this.hexagonEdge).then(data=>{
         let color = item.level==='P1'?'#FAAFAF':(item.level==='P2'?'#FFCF92':'#99D7C2');
         let gruop=hexagonSvg.group();
         let polygon=gruop.polygon(data.svgStrPoint).fill(color);
         // let polygon=gruop.polygon(data.svgStrPoint).attr('class',item.level+' hexagon_child_child').attr('style','fill:lime;stroke:purple;stroke-width:1');
         polygon.data({
           ...data,
           ...item
         });
         gruop.on('mouseenter',hexagonEnter);
         gruop.on('mouseleave',hexagonLeave);
         gruop.on('click',this.hexagonSvgScale.bind(this, polygon.data('center'),item,data));
         this.allHexagon.push(polygon);
         this.allGroup.push(gruop)
         // 向六边形内 添加文本 本质是根据六边形的中心点确定各个文本位置
         let rgbColor='0,0,0';
         let rect1=gruop.rect(this.hexagonEdge, this.hexagonEdge/3)
           .attr({
             x: data.center[0]-this.hexagonEdge/2,
             y: data.center[1]-this.hexagonEdge/2
           }).fill({ color: `rgba(${rgbColor},0)`}).data({level:item.level,color:rgbColor});
         gruop.text()
         allHexagonText.push(rect1);
         let rect2=gruop.rect(this.hexagonEdge, this.hexagonEdge/3
         ).attr({
           x: data.center[0]-this.hexagonEdge/2,
           y: data.center[1]-this.hexagonEdge/2 + this.hexagonEdge/3 +5
         }).fill({ color: `rgba(${rgbColor},0)`}).data({level:item.level,color:rgbColor});
         allHexagonText.push(rect2);
         let rect3=gruop.rect(this.hexagonEdge, this.hexagonEdge/3)
           .attr({
             x: data.center[0]-this.hexagonEdge/2,
             y: data.center[1]-this.hexagonEdge/2+ this.hexagonEdge/3*2 + 10
           }).fill({ color: `rgba(${rgbColor},0)`}).data({level:item.level,color:rgbColor});
         allHexagonText.push(rect3);
       });




      },
      hexagonSvgScale(center,item1,data,e){
        window.event? window.event.cancelBubble = true : e.stopPropagation();
       if(!this.pan){
         hexagonSvg.animate(300).zoom(1,{ x: center[0], y: center[1] });
         allHexagonText.forEach(item=>{
           let rgbColor = item.data('color')
           item.fill({ color: `rgba(${rgbColor},0.05)`})
         })
       }
      },
      hexagonSvgClearScale(){
        if(!this.pan){
          hexagonSvg.animate(300).zoom(0.33);
          allHexagonText.forEach(item=>{
            item.fill({ color: 'rgba(115,205,175,0)'})
          })
        }
      },
      hexColorToRgb(color){
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 把颜色值变成小写
        if (reg.test(color)) {
          // 如果只有三位的值，需变成六位，如：#fff => #ffffff
          if (color.length === 4) {
            let colorNew = "#";
            for (let i = 1; i < 4; i += 1) {
              colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
            }
            color = colorNew;
          }
          // 处理六位的颜色值，转为RGB
          let colorChange = [];
          for (let i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
          }
          return colorChange.join(",");
        } else {
          return color;
        }
      },
      hexagonSvgPanStart(ev){ // 实例移动开始 解绑点击函数
        ev.preventDefault();
        setTimeout(()=>{
          this.pan=true;
        },100)
      },
      hexagonSvgPanEnd(ev){ // 实例移动结束 重新绑定点击函数
        ev.preventDefault();
        setTimeout(()=>{
         this.pan=false;
       },100)
      },
      borderHex(){//外层边框 数组点
        let length = this.allHexagon.length;
        let k={x:-this.interspace,y:-(this.interspace*2)*this.MathSqrt3/6};//边框对起点的偏移量
        let item=this.allHexagon[0].data('point')[0];
        let endItemSub=this.allHexagon[length-1].data('sub').split('-');
        let borderCol=endItemSub[1];
        let borderRow=endItemSub[0];
        let borderPoint=[item.x+k.x,item.y+k.y];
        let borderSize = this.hexagonEdge*1.2;
        svgPolyline=hexagonSvg.polyline(borderPoint[0]+','+borderPoint[1]).fill('none').stroke({ color: '#DADADA', width: 1 , linecap: 'round', linejoin: 'round'});//边框 起点
        //先从左到右划线 应该是 col的长度
        let borderColTop=0;
        if(borderRow==0){
          borderColTop=borderCol;
        } else{
          borderColTop=this.col-1;
        }
       for(let i=0;i<=borderColTop*2;i++){
         if(i===1){
           borderSize = this.hexagonEdge*1.1
         }
         if(i%2===0){
           borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,1);
         }else{
           borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2);
         }
       }
        borderSize = this.hexagonEdge*1.2
       // 从上到下 应该是row的长度 分情况
        let borderRowRight=0;//右边循环次数
        // 情况1 borderCol<=this.col && row==0时
        if((borderCol<=this.col-1)&&borderRow==0){
          borderRowRight=3;
          for(let i=0;i<borderRowRight-1;i++){
            if(i===1){
              // borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2,true);
              borderSize = this.hexagonEdge*1.2
            }
            if(i===2){
              // borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2,true);
              borderSize = this.hexagonEdge*1.1
            }
            if(i%4===0){
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2);
            }else if(i%4===1){
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
            else if(i%4===2){
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else if(i%4===3){
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
          }
        }
        // 情况2 border==this.col&& row>0时 且row 为奇数事
        if(borderCol==this.col-2&&borderRow>0&&borderRow%2==1){
          borderRowRight=2*(Number(borderRow)+1);
          for(let i=0;i<borderRowRight;i++){
            if(i%4===0){
              borderSize = this.hexagonEdge*1.1;
              if(i==0){
                borderSize = this.hexagonEdge*1.2;
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2);
            }else if(i%4===1){
              borderSize = this.hexagonEdge*1.2;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
            else if(i%4===2){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else if(i%4===3){
              borderSize = this.hexagonEdge*1.03;
              if(i===borderRowRight-1){
                borderSize = this.hexagonEdge*1.1;
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
          }
        }
        // 情况3 borderCol==this.col && row>0 且 row 为偶数事
        if(borderCol==this.col-1&&borderRow>0&&borderRow%2==0){
          borderRowRight=2*(Number(borderRow)+1)+1;
          for(let i=0;i<borderRowRight-1;i++){
            if(i%4===0){
              borderSize = this.hexagonEdge*1.1
              if(i==0){
                borderSize = this.hexagonEdge*1.2
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2);
            }else if(i%4===1){
              borderSize = this.hexagonEdge*1.2;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
            else if(i%4===2){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else if(i%4===3){
              borderSize = this.hexagonEdge*1.03;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
          }
        }
        // 情况4 border<this.col&& row>0时 且row 为奇数事
        if(borderCol<this.col-2&&borderRow>0&&borderRow%2==1){
          borderRowRight=2*(Number(borderRow-1)+1);
          for(let i=0;i<borderRowRight;i++){
            if(i%4===0){
              borderSize = this.hexagonEdge*1.1
              if(i==0){
                borderSize = this.hexagonEdge*1.2
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2);
            }else if(i%4===1){
              borderSize = this.hexagonEdge*1.2;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
            else if(i%4===2){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else if(i%4===3){
              borderSize = this.hexagonEdge*1.03;
              if(i===borderRowRight-1){
                borderSize = this.hexagonEdge*1.1;
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
          }//向下移动
          borderSize = this.hexagonEdge*1.2
          for(let i=0;i<(this.col-borderCol-1)*2-1;i++){//向左移动
            if(i===1){
              borderSize = this.hexagonEdge*1.1
            }
            if(i==(this.col-borderCol-1)*2-2){
              borderSize = this.hexagonEdge
            }
            if(i%2===0){
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else{
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,5);
            }
          }
          borderSize = this.hexagonEdge*1.1
          borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
        }
        // 情况5 borderCol<this.col && row>0 且 row 为偶数事
        if(borderCol<this.col-1&&borderRow>0&&borderRow%2==0){
          borderRowRight=2*(Number(borderRow-1)+1)+1;
          for(let i=0;i<borderRowRight-1;i++){
            if(i%4===0){
              borderSize = this.hexagonEdge*1.1
              if(i==0){
                borderSize = this.hexagonEdge*1.2
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2);
            }else if(i%4===1){
              borderSize = this.hexagonEdge*1.2;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
            else if(i%4===2){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else if(i%4===3){
              borderSize = this.hexagonEdge*1.03;
              if(i===borderRowRight-2){
                borderSize = this.hexagonEdge*1.15;
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
            }
          }
          borderSize = this.hexagonEdge*1.2
          for(let i=0;i<(this.col-borderCol-1)*2-1;i++){//向左移动
            if(i==1){
              borderSize = this.hexagonEdge*1.1
            }
            if(i==(this.col-borderCol-1)*2-2){
              borderSize = this.hexagonEdge*1
            }
            if(((Number(borderCol)+2)==this.col)&&(i==0)){
              borderSize = this.hexagonEdge*1.1
            }
            if(i%2===0){
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
            }else{
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,5);
            }
          }
          borderSize = this.hexagonEdge*1.1
          borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,3);
        }
        // 从右到左 就是结束时的列数
        borderSize = this.hexagonEdge*1.2
        for(let i=0;i<=borderCol*2+1;i++){
          if(i===1){
            // borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,2,true);
            borderSize = this.hexagonEdge*1.1
          }
          if(i==borderCol*2+1) {
            borderSize = this.hexagonEdge*1.2
          }
          if(i%2===0){
            borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,4);
          }else{
            borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,5);
          }
        }
        // 从下向上的移动
        // 分兩種情況
        borderSize = this.hexagonEdge*1.2;
        if(borderRow%2==1){
          for(let i=0;i<=borderRow*2;i++){
            if(i%4===0){
              borderSize = this.hexagonEdge*1.1;
              if(i!== 0){
                borderSize = this.hexagonEdge*1.03;
              }
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,6);
            }else if(i%4===1){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,5);
            }
            else if(i%4===2){
              borderSize = this.hexagonEdge*1.2;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,6);
            }else if(i%4===3){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,1);
            }
          }
        }
        if(borderRow%2==0){
          for(let i=0;i<=borderRow*2;i++){
            if(i%4===0){
              borderSize = this.hexagonEdge*1.2
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,6);
            }else if(i%4===1){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,1);
            }
            else if(i%4===2){
              borderSize = this.hexagonEdge*1.03;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,6);
            }else if(i%4===3){
              borderSize = this.hexagonEdge*1.1;
              borderPoint = borderMove(borderPoint[0],borderPoint[1],borderSize,5);
            }
          }
        }
      },
      clearData(){// 清除数据 以及解绑事件 防止内存崩溃
       if(hexagonSvg){
         this.allHexagon.forEach((item)=>{
           item.off('mouseenter',hexagonEnter);
           item.off('mouseleave',hexagonLeave);
           item.off('click',this.hexagonSvgScale);
           // item.clear();
         })
         this.allHexagon=[];
         this.hexagonData=[];
         hexagonSvg.off('click',this.hexagonSvgClearScale);
         // svgPolyline.clear();
         // hexagonSvg.clear();
         hexagonSvg=null;  //Svg的实例
         svgPolyline=null // Svg hexagon的边框
       }
      },

    },
    beforeDestroy(){
      this.clearData()
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
  .hexagon-text{
    position: absolute;
    z-index: 1;
    font-size: 10px;
  }
</style>
<style>
  #SvgHex{
    transition: transform .25s linear;
    transform-origin: 0 0;
  }
  #SvgHex.hexagonSvgBox{
    transition: .25s linear;
  }
</style>
