<template>
  <div style="width: 100%;height: 100%">
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
		name:"messageRule",
    components:{
      hexagonBox
    },
    props:{
      data:{},
      col:{},
      length:{}
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
      }
    },
    methods:{
      colorSet(item){//设置方块颜色
        // let color = item.level==='P1'?'#FAAFAF':(item.level==='P2'?'#FFCF92':'#99D7C2');
        // let color = level ==='P1'?'#FAAFAF':(level==='P2'?'#FFCF92':'#99D7C2');
        switch(item.level){
          case "P1":
            return{
              color:'#FFAB99',
              hoverColor:'#FABEB2',
            };
          case "P2":
            return{
              color:'#FAAFAF',
              hoverColor:'#FFCDCD',
            };
          case "P3":
            return{
              color:'#FFCF92',
              hoverColor:'#FFE0B8',
            };
          default:
            return{ color:'#99D7C2',hoverColor:'#B2ECD9'}
        }
      },
      infoSet(group,allHexagonRect,allHexagonText,data,item,that){
        // 设置内部文本
        // group 对应六边形所在的组。allHexagonRect吧所有文本框放入，方便控制显示隐藏。data 六边形的相关数 data.center 中心点。that 子组件实例
        let rgbColor='0,0,0';
        let rect1=group.rect(that.hexagonEdge, that.hexagonEdge/3)
          .attr({
            x: data.center[0]-that.hexagonEdge/2,
            y: data.center[1]-that.hexagonEdge/2-7.5
          }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        let text1=group.text(item.alertName).attr({x: data.center[0]-that.hexagonEdge/2+5,y: data.center[1]-that.hexagonEdge/2-7.5+3})
          .font({size:12}).fill({opacity:0});
        allHexagonRect.push(rect1);
        allHexagonText.push(text1);
        text1.on('mousedown',textMouseDown);
        let rect2=group.rect(that.hexagonEdge, that.hexagonEdge/3).attr({
          x: data.center[0]-that.hexagonEdge/2,
          y: data.center[1]-that.hexagonEdge/2 + that.hexagonEdge/3 +5-7.5+3
        }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        allHexagonRect.push(rect2);
        let rect3=group.rect(that.hexagonEdge, that.hexagonEdge/3)
          .attr({
            x: data.center[0]-that.hexagonEdge/2,
            y: data.center[1]-that.hexagonEdge/2+ that.hexagonEdge/3*2 + 10-7.5+3
          }).fill({ color: `rgba(${rgbColor},0)`}).data({color:rgbColor});
        allHexagonRect.push(rect3);
      },
      infoShow(allHexagonRect,allHexagonText){
        allHexagonRect.forEach(item=>{
          let rgbColor = item.data('color')
          item.fill({ color: `rgba(${rgbColor},0.05)`})
        })
        allHexagonText.forEach(item=>{
          item.fill({ opacity:1})
        });
      },
      infoHide(allHexagonRect,allHexagonText){
        allHexagonRect.forEach(item=>{
          let rgbColor = item.data('color')
          item.fill({ color: `rgba(${rgbColor},0)`})
        });
        allHexagonText.forEach(item=>{
          item.fill({ opacity:0})
        });
      }
    }
	}
</script>

<style scoped>

</style>
