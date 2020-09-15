<template>
  <div class="expressionInfo" :style="{top:expressionsInfoPosition.y+'px',left:expressionsInfoPosition.x+'px'}" v-if="expressionsData.length">
    <el-tooltip v-model="show" class="item" effect="light" content="Right Bottom 提示文字" placement="right-start" >
      <div slot="content">
        <div  v-for="(item,index) in expressionsData">
          {{item.name}}
          <div v-for="item1 in item.value">
            {{item.legend?item.legend:item.metric}}:
            {{dataFormat(item.unit,item1.value[0])}}
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
      }
    },
    mounted(){
		  let index=0;
      let arr=this.edgesArray.find(item=>item.id===this.lineId).expressions;
      if(arr.length===0){return};
      console.log(arr);
      arr.forEach((item,i)=>{
        if(index<21){
          this.expressionsData.push({...item,value:[]})
        }
        item.value.forEach((item1,j)=>{
          index++;
          if(index<21){
            console.log();
            this.expressionsData[i].value.push(item1)
          }
        })
      });
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
</style>
