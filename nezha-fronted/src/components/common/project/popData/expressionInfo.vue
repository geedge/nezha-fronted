<template>
  <div class="expressionInfo" :style="{top:expressionsInfoPosition.y+'px',left:expressionsInfoPosition.x+'px'}" v-if="expressionsData.length">
    <el-tooltip v-model="show" class="item" effect="light" content="Right Bottom 提示文字" placement="right-start" >
      <div slot="content" style="padding: 5px;min-width: 150px;max-width: 260px">
        <div v-if="total>10" class="more-title-other">
          {{$t('dashboard.panel.moreTitleOther')}}{{$t('dashboard.panel.showAllOther')}} {{ total}}
        </div>
        <div  v-for="(item,index) in expressionsData" class="expressions-box">
          <span class="expressions-box-title">{{item.name}}</span>
          <div v-for="item1 in item.value" class="expressions-metric">
            {{item.legend?item.legend:item.metric }} : {{ dataFormat(item.unit,item1.value[1])}}
          </div>
          <div v-if="item.value.length===0">
           NoData
          </div>
        </div>
      </div>
      <div></div>
    </el-tooltip>
  </div>
</template>

<script>
  import chartDataFormat from "@/components/charts/chartDataFormat";
	export default {
		name:"expressionInfo",
    props:{
      lineId:{required:true},
      edgesArray:{},
      expressionsInfoPosition:{},
    },
    watch:{
      expressionsInfoPosition:{
        deep:true,
        immediate: true,
        handler(n){
          this.show=false;
          this.expressionsInfoPosition=n;
          this.$nextTick(()=>{
            this.show=true;
          })
        }
      }
    },
    data(){
		  return{
        expressionsData:[],
        show:true,
        total:0,
      }
    },
    mounted(){
		  let index=0;
      let arr=this.edgesArray.find(item=>item.id===this.lineId).expressions;
      if(arr.length===0){return};
      console.log(arr);
      arr.forEach((item,i)=>{
        if(index<11){
          this.expressionsData.push({...item,value:[]})
        }
        item.value.forEach((item1,j)=>{
          index++;
          if(index<11){
            console.log();
            this.expressionsData[i].value.push(item1)
          }
        })
      });
      this.total=index;
      console.log(this.expressionsData);
    },
    methods:{
      dataFormat(unit,value){
        return chartDataFormat.getUnit(unit?unit:2).compute(value)
      }
    }
  }
</script>

<style scoped>
  .expressionInfo{
    position: absolute;
    transform: translateX(20px);
    min-height: 20px;
    max-height: 200px;
    overflow: hidden;
  }
  .more-title-other{
    margin-bottom: 5px;
  }
  .expressions-box{
    min-width: 100px;
  }
  .expressions-box-title{
    margin-bottom: 5px;
    display: inline-block;
  }
</style>
