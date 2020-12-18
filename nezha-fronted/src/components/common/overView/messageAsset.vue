<template>
  <div style="width: 100%;height: 100%" v-loading="loading">
    <hexagonBox
      :hexData="data"
      :col="col"
      :length="length"
      :colorFrom="'level'"
      :colorSet="colorSet"
      :infoSet="infoSet"
      :infoShow="infoShow"
      :infoHide="infoHide"
      :hexagonEdge="hexagonEdge"
      :from="from"
      :hexagonSvgID="hexagonSvgID"
    />
  </div>
</template>

<script>
  import hexagonBox from '../honeycomb/hexagonFigureSvg'
  function textMouseDown(e){
    window.event? window.event.cancelBubble = true : e.stopPropagation();
  }
  function textMouseEnter(e){
    window.event? window.event.cancelBubble = true : e.stopPropagation();
  }
  function textMouseLeave(e){
    window.event? window.event.cancelBubble = true : e.stopPropagation();
  }
	export default {
		name:"messageAsset",
    components:{
      hexagonBox
    },
    props:{
      data:{},
      col:{},
      length:{},
      from:{},
      hexagonSvgID:{
        type:String,
        default:'hexagonSvg'
      }
    },
    watch:{
      data:{
        immediate: false,
        deep: true,
        handler() {
        }
      },
      col:{
        immediate: false,
        deep: true,
        handler() {
        }
      },
      length:{
        immediate: false,
        deep: true,
        handler() {
        }
      },

    },
    data(){
		  return{
        hexagonEdge:90,
        loading:true,
      }
    },
    methods:{
      colorSet(item){//设置方块颜色
        // let color = item.level==='P1'?'#FAAFAF':(item.level==='P2'?'#FFCF92':'#99D7C2');
        // let color = level ==='P1'?'#FAAFAF':(level==='P2'?'#FFCF92':'#99D7C2');
        let alert=item.alert[0];
        if(alert.P1>0){
          return{
            color:'#FAAFAF',
            hoverColor:'#FFCDCD',
          };
        } else if(alert.P2>0){
          return{
            color:'#FFAB99',
            hoverColor:'#FABEB2',
          };
        } else if(alert.P3>0){
          return{
            color:'#FFCF92',
            hoverColor:'#FFE0B8',
          };
        }else{
          return{ color:'#99D7C2',hoverColor:'#B2ECD9'}
        }
      },
      infoSet(group,allHexagonRect,allHexagonText,data,item,fontSize,that){
        // 设置内部文本
        // group 对应六边形所在的组。allHexagonRect吧所有文本框放入，方便控制显示隐藏。data 六边形的相关数 data.center 中心点。that 子组件实例
        let rgbColor='0,0,0';
        let str='';
        let textPaddingWidth='';
        let textPaddingHeight='';
        let rect0=group.rect(that.hexagonEdge+20, that.hexagonEdge/3)
          .attr({
            x: data.center[0]-that.hexagonEdge/2-10,
            y: data.center[1]-that.hexagonEdge,
            rx:5,
            ry:5,
          }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        str=this.from==='asset'?item.host:item.module;
        str+='';
        if(str.length>=15){
          str=str.slice(0,12)+"..."
        }
        let text0=group.text(str).attr({x:0,y:0,style:'cursor:text'}).font({size:fontSize}).fill({opacity:0,color:'#fff',weight:600,cursor:'text'});
        textPaddingWidth=(that.hexagonEdge+20)-(text0.bbox().width);
        textPaddingHeight=(that.hexagonEdge/3)-(text0.bbox().height);
        text0.attr({
          x: data.center[0]-that.hexagonEdge/2-10 +textPaddingWidth/2,
          y: data.center[1]-that.hexagonEdge + textPaddingHeight/2-4,
        }).hide();
        allHexagonRect.push(rect0);
        allHexagonText.push(text0);
        text0.on('mousedown',textMouseDown);


        let rect1=group.rect(that.hexagonEdge+20, that.hexagonEdge/3)
          .attr({
            x: data.center[0]-that.hexagonEdge/2-10,
            y: data.center[1]-that.hexagonEdge/2-7.5,
            rx:6,
            ry:6,
          }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        str="P1 : "+item.alert[0].P1;
        if(str.length>=15){
          str=str.slice(0,12)+"..."
        }
        let text1=group.text(str).attr({x:0,y:0,style:'cursor:default'}).font({size:fontSize}).fill({opacity:0,color:'#fff',weight:600,cursor:'default'});
        textPaddingWidth=(that.hexagonEdge+20)-(text1.bbox().width);
        textPaddingHeight=(that.hexagonEdge/3)-(text1.bbox().height);
        text1.attr({
          x: data.center[0]-that.hexagonEdge/2-10 +textPaddingWidth/2,
          y: data.center[1]-that.hexagonEdge/2-7.5 +textPaddingHeight/2-4,
        }).hide();



        allHexagonRect.push(rect1);
        allHexagonText.push(text1);


        let rect2=group.rect(that.hexagonEdge+20, that.hexagonEdge/3).attr({
          x: data.center[0]-that.hexagonEdge/2-10,
          y: data.center[1]-that.hexagonEdge/2 + that.hexagonEdge/3 +0.5,
          rx:6,
          ry:6,
        }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        str="P2 : "+item.alert[0].P2;
        if(str.length>=15){
          str=str.slice(0,12)+"..."
        }
        let text2=group.text(str).attr({x:0,y:0,style:'cursor:default'}).font({size:fontSize}).fill({opacity:0,color:'#fff',weight:600,cursor:'default'});
        textPaddingWidth=(that.hexagonEdge+20)-(text2.bbox().width);
        textPaddingHeight=(that.hexagonEdge/3)-(text2.bbox().height);
        text2.attr({
          x: data.center[0]-that.hexagonEdge/2-10 +textPaddingWidth/2,
          y: data.center[1]-that.hexagonEdge/2 + that.hexagonEdge/3 + 0.5+textPaddingHeight/2-4,
        }).hide();
        allHexagonRect.push(rect2);
        allHexagonText.push(text2);


        let rect3=group.rect(that.hexagonEdge+20, that.hexagonEdge/3)
          .attr({
            x: data.center[0]-that.hexagonEdge/2-10,
            y: data.center[1]-that.hexagonEdge/2+ that.hexagonEdge/3*2 + 5.5,
            rx:6,
            ry:6,
          }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        str="P3 : "+item.alert[0].P3;
        if(str.length>=15){
          str=str.slice(0,12)+"..."
        }
        let text3=group.text(str).attr({x:0,y:0,style:'cursor:default'}).font({size:fontSize}).fill({opacity:0,color:'#fff',weight:600,cursor:'default'});
        textPaddingWidth=(that.hexagonEdge+20)-(text3.bbox().width);
        textPaddingHeight=(that.hexagonEdge/3)-(text3.bbox().height);
        text3.attr({
          x: data.center[0]-that.hexagonEdge/2-10 +textPaddingWidth/2,
          y: data.center[1]-that.hexagonEdge/2+ that.hexagonEdge/3*2 +5.5+textPaddingHeight/2-4,
        }).hide();

        allHexagonRect.push(rect3);
        allHexagonText.push(text3);

      },
      infoShow(allHexagonRect,allHexagonText){
        allHexagonRect.forEach(item=>{
          let rgbColor = item.data('color')
          item.fill({ color: `rgba(${rgbColor},0.2)`})
        })
        allHexagonText.forEach(item=>{
          item.fill({ opacity:1}).show()
        });
      },
      infoHide(allHexagonRect,allHexagonText){
        allHexagonRect.forEach(item=>{
          let rgbColor = item.data('color')
          item.fill({ color: `rgba(${rgbColor},0)`})
        });
        allHexagonText.forEach(item=>{
          item.fill({ opacity:0}).hide();
        });
      },
      endLoading(){
        this.loading=false;
      },
      startLoading(){
        this.loading=true;
      }
    }
	}
</script>

<style scoped>

</style>
