<template>
  <div class="expressionInfo" :style="{top:expressionsInfoPosition.y+'px',left:expressionsInfoPosition.x+'px'}" v-if="expressionsData.length">
    <el-tooltip v-model="show" class="item" effect="light" content="Right Bottom 提示文字" placement="right-start" >
      <div slot="content"  class="main-box">
        <div v-if="total>10" class="more-title-other expressions-box">
          {{$t('dashboard.panel.moreTitleOther')}}{{$t('dashboard.panel.showAllOther')}} {{ total}}
        </div>
        <div  v-for="(item,index) in expressionsData" class="expressions-box">
          <span class="expressions-box-title">{{item.name}}</span>
          <div class="expressions-box-content"  v-if="item.value.length!==0">
            <div class="expressions-metric">
              <span class="expressions-box-label" style="font-weight: bold">Key</span>
              <span class="expressions-box-value" style="font-weight: bold">Value</span>
            </div>
            <div v-for="item1 in item.value" class="expressions-metric">
              <span class="expressions-box-label">{{legendFormat(item.metric,item.legend,item1.metric)}}</span>
              <span class="expressions-box-value">{{ dataFormat(item.unit,item1.value[1])}}</span>
            </div>
          </div>
          <div v-if="item.value.length===0" class="expressions-box-content" style="padding: 3px;border-bottom: 1px solid #ebeef5">
            <div class="expressions-metric">
              <span class="expressions-box-label" style="font-weight: bold">Key</span>
              <span class="expressions-box-value" style="font-weight: bold">Value</span>
            </div>
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
        item.value=item.value || [];
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
      },
      legendFormat:function(legend,expression,metric){
        console.log(metric)
        if(/\{\{.+\}\}/.test(expression)&&expression){
          let labelValue=expression.replace(/(\{\{.+?\}\})/g,function(i){
            let label=i.substr(i.indexOf('{{')+2,i.indexOf('}}')-i.indexOf('{{')-2);
            let reg=new RegExp(label+'=".+?"');
            let value=null;
            if(reg.test(legend)){
              let find=legend.match(reg)[0];
              value=find.substr(find.indexOf('"')+1,find.lastIndexOf('"')-find.indexOf('"')-1);
            }
            return value?value:label;
          });
          return metric[labelValue]?metric[labelValue]:labelValue
        }else{
          return expression?expression:legend;
        }

      },
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
  .main-box{
    min-width: 150px;
    max-width: 260px;
    overflow: hidden;
    padding: 0 5px 5px 5px;
    border: 1px solid #ebeef5;
  }
  .expressions-box{
    min-width: 100px;
  }
  .main-box .expressions-box:not(:last-child){
    border-bottom: 1px dashed #ebeef5;
    padding-bottom: 5px;
  }
  .expressions-box-title{
    margin-bottom: 5px;
    margin-top: 5px;
    display: inline-block;
    font-weight: bold;
    font-size: 13px;
    color: #1a1a1a;
  }
  .expressions-box-label{
    font-size: 12px;
    color: #1a1a1a;
    padding: 3px;
    border-bottom: 1px solid #ebeef5 ;
  }
  .expressions-box-value{
    font-size: 12px;
    color: #666;
    padding: 3px 3px 3px 5px;
    border-bottom: 1px solid #ebeef5 ;
  }
  .expressions-box-content{
    border: 1px solid #ebeef5;
    border-bottom: none;
  }
  .expressions-metric{
    display: flex;
  }
  .expressions-metric > span{
    width: 50%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .expressions-metric > span:not(:first-child){
    border-left: 1px solid #ebeef5;
  }
</style>
